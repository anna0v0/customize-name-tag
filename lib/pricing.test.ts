import { describe, expect, it } from "vitest";
import { NAME_TAG_UNIT_PRICE, ORGANIZER_UNIT_PRICE, nameTagItemsTotal, nameTagOrderTotal, orderItemsTotal } from "./pricing";

describe("name tag pricing", () => {
  it("charges HK$50 for one name tag", () => {
    expect(NAME_TAG_UNIT_PRICE).toBe(50);
    expect(nameTagOrderTotal(1)).toBe(50);
  });

  it("multiplies the fixed price by quantity", () => {
    expect(nameTagOrderTotal(3)).toBe(150);
  });

  it("totals all designs in a multi-item order", () => {
    expect(nameTagItemsTotal([{ quantity: 2 }, { quantity: 3 }])).toBe(250);
  });

  it("charges the organizer variant price",()=>{
    expect(ORGANIZER_UNIT_PRICE).toBe(80);
    expect(orderItemsTotal([{quantity:2,design:{productType:"beyblade-organizer"}}])).toBe(160);
  });
});
