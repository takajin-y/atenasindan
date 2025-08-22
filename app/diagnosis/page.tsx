"use client";
import { useMemo, useState } from "react";

/** MVP用の簡易コンフィグ（後でV4 JSONに差し替えます） */
const CONFIG = {
  base: 38000,
  avg: 45000,
  weights: {
    costume: { high: 8000, medium: 3000, low: 0, unknown: 0 },
    dataAll: { yes: 7000, maybe: 3000, no: 0 },
    product: { panel: 6000, book: 12000, other: 4000 },
    bookVolume: { lite: 0, normal: 5000, big: 12000 },
    familyCostume: { true: 8000, false: 0 },
  },
};

type QA = {
  id: string;
  text: string;
  dependsOn?: { key: string; value: any };
  options: { key: string; label: string; value: any }[];
};

/** 10ターン（七五三3歳女の子例） */
const FLOW: QA[] = [
  { id: "costume", text: "衣装にはどのくらいこだわりたいですか？", options: [
    { key: "high", label: "こだわりたい！", value: "high" },
    { key: "medium", label: "そこそこ", value: "medium" },
    { key: "low", label: "特にない", value: "low" },
    { key: "unknown", label: "迷ってます…", value: "unknown" },
  ]},
  { id: "dataAll", text: "全データは欲しいですか？", options: [
    { key: "yes", label: "欲しい！", value: "yes" },
    { key: "maybe", label: "あれば嬉しい", value: "maybe" },
    { key: "no", label: "必要ない", value: "no" },
  ]},
  { id: "product", text: "どんな形で思い出を残しますか？", options: [
    { key: "book", label: "ブック", value: "book" },
    { key: "panel", label: "パネル", value: "panel" },
    { key: "other", label: "その他", value: "other" },
  ]},
  { id: "bookVolume", text: "ブックのボリューム感は？", dependsOn: { key: "product", value: "book" }, options: [
    { key: "lite", label: "そこそこ", value: "lite" },
    { key: "normal", label: "ふつう", value: "normal" },
    { key: "big", label: "ドーンと！", value: "big" },
  ]},
  { id: "familyCostume", text: "ご家族の衣装も追加しますか？", options: [
    { key: "true", label: "はい（家族も衣装あり）", value: true },
    { key: "false", label: "いいえ", value: false },
  ]},
  { id: "vibe", text: "撮影の雰囲気は？", options: [
    { key: "classic", label: "王道でしっかり", value: "classic" },
    { key: "natural", label: "自然体でナチュラル", value: "natural" },
    { key: "art", label: "ちょっとアートっぽく", value: "art" },
  ]},
  { id: "concern", text: "ちょっと心配なことは？", options: [
    { key: "mood", label: "子どものご機嫌", value: "mood" },
    { key: "budget", label: "費用のバランス", value: "budget" },
    { key: "outfit", label: "衣装の数や相性", value: "outfit" },
    { key: "none", label: "特になし", value: "none" },
  ]},
  { id: "timePref", text: "撮影の過ごし方は？", options: [
    { key: "enjoy", label: "イベントとして楽しみたい", value: "enjoy" },
    { key: "efficient", label: "効率よくサクッと", value: "efficient" },
    { key: "slow", label: "思い出をじっくり", value: "slow" },
  ]},
  { id: "familyJoin", text: "ご家族の参加度合いは？", options: [
    { key: "dressup", label: "家族も衣装を着たい", value: "dressup" },
    { key: "casual", label: "普段着で一緒に", value: "casual" },
    { key: "childOnly", label: "子どもだけ", value: "childOnly" },
  ]},
  { id: "priority", text: "一番大切にしたいのは？", options: [
    { key: "balance", label: "価格とのバランス", value: "balance" },
    { key: "expression", label: "自然な表情", value: "expression" },
    { key: "lux", label: "豪華さ・見栄え", value: "lux" },
    { key: "memory", label: "思い出としての価値", value: "memory" },
  ]},
];

function estimate(answers: Record<string, any>) {
  const w = CONFIG.weights;
  let add = 0;
  const pick = (key: keyof typeof w, sub: string) => Number((w as any)[key]?.[sub] ?? 0);
  add += pick("costume", String(answers.costume ?? "unknown"));
  add += pick("dataAll", String(answers.dataAll ?? "no"));
  add += pick("product", String(answers.product ?? "other"));
  if (answers.product === "book") add += pick("bookVolume", String(answers.bookVolume ?? "lite"));
  add += pick("familyCostume", String(Boolean(answers.familyCostume)));

  const vibeCoef = answers.vibe === "art" ? 0.15 : answers.vibe === "natural" ? 0.05 : 0;
  const avgWith = Math.max(CONFIG.avg, CONFIG.base + 3000) + Math.round(add * (0.7 + vibeCoef));
  const max = avgWith + Math.round(add * 0.6) + 5000;
  return { min: CONFIG.base, avg: avgWith, max };
}

export default function Page() {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [i, setI] = useState(0);
  const visible = useMemo(
    () => FLOW.filter(q => !q.dependsOn || answers[q.dependsOn.key] === q.dependsOn.value),
    [answers]
  );
  const current = visible[i];
  const done = i >= visible.length;

  const onPick = (q: QA, v: any) => {
    setAnswers(prev => ({ ...prev, [q.id]: v }));
    setI(prev => prev + 1);
  };

  const range = useMemo(() => (done ? estimate(answers) : null), [done, answers]);
  const lineUrl = (process.env.NEXT_PUBLIC_LINE_URL as string) || "https://line.me/R/ti/p/@YOUR_ID";

  return (
    <main style={{ margin: "0 auto", maxWidth: 720, padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>アテナちゃん診断🕊️</h1>
      <p style={{ color: "#555", marginBottom: 16 }}>七五三（3歳 女の子）のプランを一緒に見つけましょう。</p>

      {!done && current && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 18, marginBottom: 12 }}>{current.text}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {current.options.map(opt => (
              <button
                key={opt.key}
                onClick={() => onPick(current, opt.value)}
                style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #ddd", background: "#f7f7f7" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 12 }}>
            {i + 1} / {visible.length}
          </div>
        </div>
      )}

      {done && range && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ background: "#fff0f3", border: "1px solid #f8cdd4", borderRadius: 16, padding: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>診断が完了しました！🎉</h2>
            <p>
              ここまでの回答から見ると、想定レンジは
              <b> 約{range.min.toLocaleString()}円〜</b> /
              <b> 約{range.avg.toLocaleString()}円前後</b> で、
              追加内容によっては <b>約{range.max.toLocaleString()}円</b> 程度になります。
            </p>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ marginBottom: 8 }}>
              より具体的な「あなた専用プラン」を LINE でお送りします。受け取りますか？
            </p>
            <a href={lineUrl} target="_blank" style={{
              display: "inline-block", background: "#06C755", color: "#fff",
              padding: "10px 16px", borderRadius: 16, textDecoration: "none"
            }}>
              LINEで受け取る
            </a>
          </div>

          <button onClick={() => { setAnswers({}); setI(0); }} style={{ color: "#666", textDecoration: "underline" }}>
            もう一度診断する
          </button>
        </div>
      )}
    </main>
  );
}
