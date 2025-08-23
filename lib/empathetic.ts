// lib/empathetic.ts
import type { Answers } from "./v4Adapter";

export function reassuringRemark(a: Answers) {
  if (a.concern === "mood") {
    return "泣いたりグズったりも“その子の旬”。studio ateは流れをほどきながら、その子ペースで進めます🫶";
  }
  if (a.concern === "budget") {
    return "ご予算は無理せずに。体験が良ければ“好きな写真”が自然と増えます。後から選ぶのもOKです。";
  }
  if (a.vibe === "art") {
    return "少しアート寄りも素敵。光や背景を工夫して“作品感”を強められます。";
  }
  return "わからないことは私にお任せください。選びながら“ちょうどいい”を一緒に見つけましょう。";
}
