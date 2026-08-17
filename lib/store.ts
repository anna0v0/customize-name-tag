import { promises as fs } from "node:fs";
import path from "node:path";
import { firebaseAdminIsConfigured, getFirebaseAdmin } from "./firebase-admin";

export type OrderStatus = "Submitted"|"Generating"|"Pending Review"|"Awaiting Customer Approval"|"Confirmed"|"In Production"|"Completed"|"Manual Review Required"|"Cancelled";
export type StoredOrderItem = { design:Record<string, unknown>; quantity:number };
export type StoredOrder = { id:string; createdAt:string; status:OrderStatus; customerName:string; email:string; phone:string; shippingMethod?:"sf-express"|"local-mail"; shippingLabel?:string; shippingFee?:number; quantity:number; unitPrice?:number; subtotal?:number; totalAmount?:number; currency?:"HKD"; notes:string; design:Record<string, unknown>; items?:StoredOrderItem[] };

const dataDir = path.join(process.cwd(), ".data");
const orderFile = path.join(dataDir, "orders.json");

async function localOrders(): Promise<StoredOrder[]> {
  try { return JSON.parse(await fs.readFile(orderFile, "utf8")) as StoredOrder[]; } catch { return []; }
}

function firestoreOrder(order: StoredOrder): StoredOrder {
  const clean=(source:Record<string,unknown>)=>{const design={...source};if(design.iconAssetId)delete design.iconDataUrl;return design};
  return { ...order, design:clean(order.design), items:order.items?.map(item=>({...item,design:clean(item.design)})) };
}

export async function getOrders(): Promise<StoredOrder[]> {
  if (!firebaseAdminIsConfigured()) return localOrders();
  const snapshot = await getFirebaseAdmin().db.collection("orders").get();
  return snapshot.docs
    .map(doc => doc.data() as StoredOrder)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<StoredOrder | null> {
  if (firebaseAdminIsConfigured()) {
    const snapshot = await getFirebaseAdmin().db.collection("orders").doc(id).get();
    return snapshot.exists ? snapshot.data() as StoredOrder : null;
  }
  return (await localOrders()).find(order => order.id === id) ?? null;
}

export async function getOrdersByEmail(email: string): Promise<StoredOrder[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  return (await getOrders()).filter(order => order.email.trim().toLowerCase() === normalized);
}

export async function saveOrder(order: StoredOrder) {
  if (firebaseAdminIsConfigured()) {
    await getFirebaseAdmin().db.collection("orders").doc(order.id).set(firestoreOrder(order));
    return;
  }
  await fs.mkdir(dataDir, { recursive: true });
  const all = await localOrders();
  all.unshift(order);
  await fs.writeFile(orderFile, JSON.stringify(all, null, 2));
}

export async function updateOrder(id: string, status: OrderStatus) {
  if (firebaseAdminIsConfigured()) {
    const ref = getFirebaseAdmin().db.collection("orders").doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) return null;
    await ref.update({ status });
    return { ...(snapshot.data() as StoredOrder), status };
  }
  const all = await localOrders();
  const order = all.find(item => item.id === id);
  if (!order) return null;
  order.status = status;
  await fs.writeFile(orderFile, JSON.stringify(all, null, 2));
  return order;
}

export async function saveIconAsset(id: string, bytes: Buffer, contentType: string) {
  const extension = contentType === "image/svg+xml" ? "svg" : "png";
  const objectPath = `icons/${id}.${extension}`;
  if (firebaseAdminIsConfigured()) {
    await getFirebaseAdmin().bucket.file(objectPath).save(bytes, { contentType, resumable: false, metadata: { cacheControl: "private, max-age=0" } });
  } else {
    const dir = path.join(dataDir, "icons");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${id}.${extension}`), bytes);
  }
  return objectPath;
}

export async function saveModel(id: string, bytes: Buffer) {
  if (firebaseAdminIsConfigured()) {
    await getFirebaseAdmin().bucket.file(`models/${id}.3mf`).save(bytes, { contentType: "model/3mf", resumable: false, metadata: { cacheControl: "private, max-age=0" } });
    return;
  }
  const dir = path.join(dataDir, "models");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${id}.3mf`), bytes);
}

export async function getModel(id: string): Promise<Buffer | null> {
  try {
    if (firebaseAdminIsConfigured()) {
      const [bytes] = await getFirebaseAdmin().bucket.file(`models/${id}.3mf`).download();
      return bytes;
    }
    return await fs.readFile(path.join(dataDir, "models", `${id}.3mf`));
  } catch { return null; }
}
