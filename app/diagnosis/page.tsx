"use client";
import { useMemo, useState } from "react";
import { flow753_3yo_girl, QA } from "../../lib/questions";
import { estimateRangeFromV4, talkingPointsFromV4, Answers } from "../../lib/v4Adapter";

export default function Page() {
  const [answers, setAnswers] = useState<Answers>({});
  const [i, setI] = useState(0);

  const visible = useMemo(
    () => flow753_3yo_girl.filter(q => !q.dependsOn || (answers as any)[q.dependsOn.key] === q.dependsOn.value),
    [answers]
  );
  const current = visible[i];
  const done = i >= visible.length;

  const onPick = (q: QA, v: any) => {
    setAnswers(prev => ({ ...prev, [q.id]: v }));
    setI(prev => prev + 1);
  };

  const range = useMemo(() => (done ? estimateRangeFromV4(answers) : null), [done, answers]);
  const points = useMemo(() => (done ? talkingPointsFromV4(answers) : []), [done, answers]);
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
            {points.length > 0 && (
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {points.map((t, idx) => (<li key={idx}>{t}</li>))}
              </ul>
            )}
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
