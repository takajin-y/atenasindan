export type AnswerValue = string | boolean;
export type QA = {
  id: string;
  text: string;
  dependsOn?: { key: string; value: AnswerValue };
  options: { key: string; label: string; value: AnswerValue }[];
};

export const flow753_3yo_girl: QA[] = [
  { id: "support", text: "お支度について教えてください", options: [
    { key: "A", label: "仕上がり来店（美容なし）", value: "A" },
    { key: "B", label: "着付け＆ヘアセット込み", value: "B" },
    { key: "C", label: "着替えのみ", value: "C" },
  ]},
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
  // --- 揺らぎ・体験価値 ---
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
  { id: "priority", text: "一番大切にしたいのは？", options: [
    { key: "balance", label: "価格とのバランス", value: "balance" },
    { key: "expression", label: "自然な表情", value: "expression" },
    { key: "lux", label: "豪華さ・見栄え", value: "lux" },
    { key: "memory", label: "思い出としての価値", value: "memory" },
  ]},
];
