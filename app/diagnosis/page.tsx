"use client";
import { useMemo, useState } from "react";
import type { Answers } from "../../lib/v4Adapter";
import { estimateRangeFromV4, talkingPointsFromV4 } from "../../lib/v4Adapter";
import { nextQuestion, findContradictions } from "../../lib/engine";
import { reassuringRemark } from "../../lib/empathetic";

export default function Page() {
  const [answers, setAnswers] = useState<Answers>({});
  const [history, setHistory] = useState<{role:"athena"|"user", text:string}[]>([
    { role:"athena", text:"はじめまして。今日はどんな記念日ですか？私と一緒に“あなたらしい体験プラン”を見つけましょう🕊️" }
  ]);

  const nq = useMemo(() => nextQuestion(answers), [answers]);
  const contradictions = useMemo(() => findContradictions(answers), [answers]);
  const done = !nq;
  const range = useMemo(() => (done ? estimateRangeFromV4(answers) : null), [done, answers]);
  const points = useMemo(() => (done ? talkingPointsFromV4(answers) : []), [done, answers]);

  const pick = (key: keyof Answers, value: any, label: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setHistory(prev => [...prev, { role:"user", text: label }]);
  };

  return (
    <main style={{maxWidth:720,margin:"0 auto",padding:24}}>
      <h1 style={{fontSize:22,fontWeight:700,marginBottom:8}}>アテナちゃん診断🕊️（カード選択・可変ターン）</h1>

      {/* 会話ログ（簡易） */}
      <div style={{display:"grid",gap:12,marginBottom:16}}>
        {history.map((m,i)=>(
          <div key={i} style={{alignSelf: m.role==="athena"?"start":"end", maxWidth:"85%"}}>
            <div style={{
              padding:"10px 14px", borderRadius:14,
              background: m.role==="athena"?"#fff":"#74151d", color: m.role==="athena"?"#111":"#fff"
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* 矛盾があれば“やさしい指摘” */}
      {contradictions.length>0 && (
        <div style={{background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:12, padding:12, marginBottom:12}}>
          <b>ちょこっとご提案💡</b>
          <ul style={{margin:"6px 0 0 16px"}}>
            {contradictions.map((t,i)=>(<li key={i}>{t}</li>))}
          </ul>
        </div>
      )}

      {/* 進行中：次の質問カード */}
      {!done && nq && (
        <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:16,padding:16}}>
          <div style={{fontWeight:600, marginBottom:6}}>アテナ</div>
          <div style={{marginBottom:10}}>{nq.label}</div>
          <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
            {nq.options.map(opt=>(
              <button key={opt.key} onClick={()=>pick(nq.key as any, opt.value, opt.label)}
                style={{padding:"8px 12px",borderRadius:999,border:"1px solid #ddd",background:"#F9FAFB"}}>
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{fontSize:12,color:"#6B7280", marginTop:10}}>{nq.empathy}</div>
        </div>
      )}

      {/* 完了：レンジ提示＋LINE誘導 */}
      {done && range && (
        <div style={{display:"grid",gap:16}}>
          <div style={{background:"#fff0f3", border:"1px solid #f8cdd4", borderRadius:16, padding:16}}>
            <h2 style={{fontSize:18, fontWeight:700, marginBottom:8}}>診断が完了しました！🎉</h2>
            <p>
              ここまでのご希望ですと、目安は
              <b> 約{range.min.toLocaleString()}円〜</b>
              <b> 約{range.avg.toLocaleString()}円前後</b>／内容次第で
              <b> 約{range.max.toLocaleString()}円</b> です。
            </p>
            <p style={{marginTop:8, color:"#6B7280"}}>{reassuringRemark(answers)}</p>
            {points.length>0 && (
              <ul style={{marginTop:8, paddingLeft:18}}>
                {points.map((t,i)=>(<li key={i}>{t}</li>))}
              </ul>
            )}
          </div>
          <div style={{background:"#fff",borderRadius:16,padding:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <p style={{marginBottom:8}}>「あなた専用の正式お見積り」は LINE でお送りします。受け取りますか？</p>
            <a href={(process.env.NEXT_PUBLIC_LINE_URL as string)||"#"} target="_blank"
              style={{display:"inline-block",background:"#06C755",color:"#fff",padding:"10px 16px",borderRadius:16,textDecoration:"none"}}>
              LINEで受け取る
            </a>
          </div>
          <button onClick={()=>{ setAnswers({}); setHistory([{role:"athena", text:"もう一度いきましょう。今日はどんな記念日ですか？🕊️"}]); }}
            style={{color:"#6B7280", textDecoration:"underline"}}>最初からやり直す</button>
        </div>
      )}
    </main>
  );
}
