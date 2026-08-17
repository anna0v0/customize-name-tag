import { describe, expect, it } from "vitest";
import { toPublicOrderSummary } from "./public-order";
import type { StoredOrder } from "./store";

describe("public order summary",()=>{
  it("returns useful status details without customer or production data",()=>{
    const design={name:"Milo",font:"Sour Gummy Bold",baseColor:"#f4f0e7",topColor:"#1e1f22",icon:"flower",iconScale:1,templateVersion:"1",iconDataUrl:"private"};
    const order:StoredOrder={id:"FF-2026-ABC123",createdAt:"2026-08-17T04:00:00.000Z",status:"Pending Review",customerName:"Anna",email:"anna@example.com",phone:"12345678",quantity:2,notes:"private",design,items:[{design,quantity:2}]};
    const result=toPublicOrderSummary(order);
    expect(result.orderId).toBe("FF-2026-ABC123");
    expect(result.totalAmount).toBe(100);
    expect(result.designs).toHaveLength(1);
    expect(result.designs[0]).toMatchObject({name:"Milo",quantity:2,design:{name:"Milo",icon:"flower"}});
    expect(JSON.stringify(result)).not.toContain("anna@example.com");
    expect(JSON.stringify(result)).not.toContain("private");
  });
});
