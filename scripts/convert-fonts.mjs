import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const fonts=[
  ["PermanentMarker-Regular.ttf","permanent-marker.typeface.json"],
  ["GochiHand-Regular.ttf","gochi-hand.typeface.json"],
  ["Jua-Regular.ttf","jua.typeface.json"],
  ["Jaro-Regular.ttf","jaro.typeface.json"],
  ["Poppins-ExtraBold.ttf","poppins-extrabold.typeface.json"],
  ["DarumadropOne-Regular.ttf","darumadrop-one.typeface.json"],
  ["CaveatBrush-Regular.ttf","caveat-brush.typeface.json"],
  ["CherryBombOne-Regular.ttf","cherry-bomb-one.typeface.json"],
  ["EastSeaDokdo-Regular.ttf","east-sea-dokdo.typeface.json"],
  ["SourGummy-Bold.ttf","sour-gummy-bold.typeface.json"],
  ["Bungee-Regular.ttf","bungee.typeface.json"],
];
const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ?-";
const round=n=>Math.round(n*100)/100;
for(const [source,target] of fonts){
  const bytes=fs.readFileSync(path.join("public/fonts",source));
  const font=opentype.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
  const glyphs={};
  for(const char of chars){
    const glyph=font.charToGlyph(char); const commands=glyph.getPath(0,0,font.unitsPerEm).commands; const outline=[];
    for(const c of commands){
      if(c.type==="M")outline.push("m",round(c.x),round(-c.y));
      else if(c.type==="L")outline.push("l",round(c.x),round(-c.y));
      else if(c.type==="Q")outline.push("q",round(c.x),round(-c.y),round(c.x1),round(-c.y1));
      else if(c.type==="C")outline.push("b",round(c.x),round(-c.y),round(c.x1),round(-c.y1),round(c.x2),round(-c.y2));
    }
    glyphs[char]={ha:glyph.advanceWidth||font.unitsPerEm*.5,x_min:glyph.xMin||0,x_max:glyph.xMax||0,o:outline.join(" ")};
  }
  const family=font.names.windows?.fontFamily?.en||font.names.macintosh?.fontFamily?.en||source;
  const json={glyphs,familyName:family,ascender:font.ascender,descender:font.descender,underlinePosition:font.tables.post?.underlinePosition||-100,underlineThickness:font.tables.post?.underlineThickness||50,boundingBox:{xMin:font.tables.head.xMin,xMax:font.tables.head.xMax,yMin:font.tables.head.yMin,yMax:font.tables.head.yMax},resolution:font.unitsPerEm,original_font_information:{format:font.outlinesFormat}};
  fs.writeFileSync(path.join("lib/fonts",target),JSON.stringify(json));
}
