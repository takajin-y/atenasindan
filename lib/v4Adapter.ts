// lib/v4Adapter.ts
import V4 from "@/configs/v4.json";

// /diagnosis で集める回答（MVP版）
export type Answers = {
  costume?: "high" | "medium" | "low" | "unknown";
  dataAll?: "yes" | "maybe" | "no";
  product?: "panel" | "book" | "other";
  bookVolume?: "lite" | "normal" | "big";
  familyCostume?: boolean;
  support?: "A" | "B" | "C"; // 仕上がり/着付け+ヘア/着替えのみ
  vibe?: "classic" | "natural" | "art";
  concern?: "mood" | "budget" | "outfit" | "none";
};

const GENRE_KEY = "753-3" as const; // MVPは七五三3歳に固定（後で拡張OK）

function getBaseAnchors() {
  const baseFees = V4.baseFees;
  const min = baseFees.ateCollection;
  const avg = V4.baseFees.legacy["gold"];
  const max = V4.baseFees.legacy["platinum"];
  return { min, avg, max };
}

function genreAddonBySupport(support?: "A" | "B" | "C") {
  const g = (V4 as any).genreAddons?.[GENRE_KEY];
  if (!g) return 0;
  if (support === "A") return g.A ?? 0;
  if (support === "B") return g.B ?? 0;
  if (support === "C") return g.C ?? 0;
  return g.B ?? 0; // 未回答はB寄り
}

function familyCostumeAdd(family?: boolean) {
  return family ? 8000 : 0; // MVP近似。後で adultDressing 連動に置換OK
}

function productAdd(product?: "panel" | "book" | "other", bookVol?: "lite" | "normal" | "big") {
  if (product === "book") {
    if (bookVol === "big") return 12000;
    if (bookVol === "normal") return 5000;
    return 0;
  }
  if (product === "panel") return 6000;
  return 4000; // other
}

function dataAllAdd(dataAll?: "yes" | "maybe" | "no") {
  if (dataAll === "yes") return 7000;
  if (dataAll === "maybe") return 3000;
  return 0;
}

export function estimateRangeFromV4(a: Answers) {
  const anchors = getBaseAnchors();
  const addon = genreAddonBySupport(a.support);

  let add = 0;
  add += familyCostumeAdd(a.familyCostume);
  add += productAdd(a.product, a.bookVolume);
  add += dataAllAdd(a.dataAll);

  const vibeCoef = a.vibe === "art" ? 0.10 : a.vibe === "natural" ? 0.03 : 0;
  const hesitationCoef = a.costume === "unknown" ? 0.05 : 0;

  const min = anchors.min + addon;
  const avg = Math.round(anchors.avg + addon + add * (0.7 + vibeCoef));
  const max = Math.round(anchors.max + addon + add * (0.9 + hesitationCoef) + 5000);

  return { min, avg, max };
}

export function talkingPointsFromV4(a: Answers) {
  const pts: string[] = [];
  pts.push("ご家族がリラックスできる自然な表情づくり");
  if (a.support === "B") pts.push("着付け・ヘアを含めた一貫サポート");
  if (a.product === "book") pts.push("アルバム設計（ページ構成と世界観の統一）");
  if (a.familyCostume) pts.push("ご家族衣装コーデと全体トーン合わせ");
  if (a.concern === "mood") pts.push("人見知り・ご機嫌配慮の段取り（泣いてもOK）");
  return pts;
}
