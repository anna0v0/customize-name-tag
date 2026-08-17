import {describe,expect,it} from "vitest";
import {avatarSvg,defaultAvatarSelection} from "./avatar";
import {parseSvgIcon} from "./svg-icon";

describe("avatar icon export",()=>{
  it("converts the default layered avatar into printable contours",()=>{
    const contours=parseSvgIcon(avatarSvg(defaultAvatarSelection()));
    expect(contours.length).toBeGreaterThan(1);
    expect(contours.some(contour=>contour.hole)).toBe(true);
    expect(Math.max(...contours.flatMap(contour=>contour.points.flatMap(point=>[Math.abs(point.x),Math.abs(point.y)])))).toBeLessThanOrEqual(1.01);
  });
});
