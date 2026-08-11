import { promises as fs } from "fs";
import path from "path";
export type OrderStatus = "Submitted"|"Generating"|"Pending Review"|"Awaiting Customer Approval"|"Confirmed"|"In Production"|"Completed"|"Manual Review Required"|"Cancelled";
export type StoredOrder = { id:string; createdAt:string; status:OrderStatus; customerName:string; email:string; phone:string; quantity:number; notes:string; design:Record<string, unknown> };
const dir = path.join(process.cwd(), ".data"); const file = path.join(dir, "orders.json");
export async function getOrders(): Promise<StoredOrder[]> { try { return JSON.parse(await fs.readFile(file,"utf8")); } catch { return []; } }
export async function saveOrder(order: StoredOrder) { await fs.mkdir(dir,{recursive:true}); const all=await getOrders(); all.unshift(order); await fs.writeFile(file,JSON.stringify(all,null,2)); }
export async function updateOrder(id:string,status:OrderStatus){const all=await getOrders();const o=all.find(x=>x.id===id);if(!o)return null;o.status=status;await fs.writeFile(file,JSON.stringify(all,null,2));return o;}
