// lib/engine.ts
import type { Answers } from "./v4Adapter";

/** V4で「最低限必要」とみなすキー（まずは七五三3歳向けMVP）。 */
export const REQUIRED_KEYS: (keyof Answers)[] = [
  "support",          // A/B/C
  "dataAll",          // yes/maybe/no
  "product",          // panel/book/other
  // product=book のときだけ必要
  // "bookVolume",
  "familyCostume",    // true/false
  "vibe",             // classic/natural/art（体験寄与→レンジ係数）
  "concern"           // mood/budget/outfit/none（寄り添い文）
];

/** 矛盾判定（増やせる） */
export function findContradictions(a: Answers): string[] {
  const issues: string[] = [];
  // 例）support=A（仕上がり来店）なのに、実は「店内で着替え前提」の話をしている等
  // 今はMVPなので、体験軸の矛盾チェックだけ用意
  if (a.vibe === "classic" && a.product === "other") {
    issues.push("仕上がりの見栄え重視なら、パネルやブックも相性が良いです。");
  }
  if (a.concern === "budget" && a.product === "book" && a.bookVolume === "big") {
    issues.push("ご予算が気になるなら、ブックは「ふつう」からでも十分満足度は高いです。");
  }
  return issues;
}

/** 未入力の必須キーを返す（product=bookのときはbookVolumeも必須に昇格） */
export function missingKeys(a: Answers): (keyof Answers)[] {
  const base = [...REQUIRED_KEYS];
  if (a.product === "book") base.splice(3, 0, "bookVolume"); // familyCostumeの前に差し込む
  return base.filter((k) => {
     const v = a[k];
     if (v === undefined || v === null) return true;          // 未回答
     if (typeof v === "string" && v.trim() === "") return true; // 文字列なら空文字も未回答扱い
     return false;                                            // それ以外は回答済み
   });
 }

/** “次に聞くべき項目” を決め、カード候補を生成（UIに出す材料） */
export function nextQuestion(a: Answers) {
  const miss = missingKeys(a);
  if (miss.length === 0) return null; // 完了

  const key = miss[0];

  // カード候補（MVP：静的だが、直前の回答でラベルを少し変える）
  const catalogs: Record<string, {label: string, options: {key:string,label:string,value:any, helper?:string}[]}> = {
    support: {
      label: "お支度について教えてください",
      options: [
        { key:"A", label:"仕上がり来店（美容なし）", value:"A", helper:"お支度済みでご来店 → 割引が効きます" },
        { key:"B", label:"着付け＆ヘアセット込み", value:"B", helper:"所要時間は少し増えます" },
        { key:"C", label:"着替えのみ", value:"C" }
      ]
    },
    dataAll: {
      label: "データはどのくらい欲しいですか？",
      options: [
        { key:"yes", label:"全部欲しい！", value:"yes" },
        { key:"maybe", label:"あれば嬉しい", value:"maybe" },
        { key:"no", label:"必要ない", value:"no" },
      ]
    },
    product: {
      label: "思い出はどんな形で残しますか？",
      options: [
        { key:"book", label:"ブック", value:"book" },
        { key:"panel", label:"パネル", value:"panel" },
        { key:"other", label:"その他（後で考える）", value:"other" },
      ]
    },
    bookVolume: {
      label: "ブックのボリュームはどれくらい？",
      options: [
        { key:"lite", label:"そこそこ", value:"lite" },
        { key:"normal", label:"ふつう", value:"normal" },
        { key:"big", label:"ドーンと！", value:"big" },
      ]
    },
    familyCostume: {
      label: "ご家族の衣装も追加しますか？",
      options: [
        { key:"true", label:"はい（家族も衣装あり）", value:true },
        { key:"false", label:"いいえ", value:false },
      ]
    },
    vibe: {
      label: "撮影の雰囲気はどれが近いですか？",
      options: [
        { key:"classic", label:"王道でしっかり", value:"classic" },
        { key:"natural", label:"自然体でナチュラル", value:"natural" },
        { key:"art", label:"ちょっとアートっぽく", value:"art" },
      ]
    },
    concern: {
      label: "いま一番の“ちょっと心配”は？",
      options: [
        { key:"mood", label:"子どものご機嫌", value:"mood" },
        { key:"budget", label:"費用のバランス", value:"budget" },
        { key:"outfit", label:"衣装の数や相性", value:"outfit" },
        { key:"none", label:"特になし", value:"none" },
      ]
    }
  };

  // “寄り添い一言” を添える（体験価値を思い出させる）
  const empathy: Record<string, string> = {
    support: "どの選択でも大丈夫。大切なのは“当日の過ごし方”がご家族らしいことです🕊️",
    dataAll: "枚数よりも“好きが詰まった写真”が残るのが一番。迷ったら全部もアリ☺️",
    product: "おうちに飾る？めくって楽しむ？…想像するとワクワクしますね✨",
    bookVolume: "ページは後からも増やせます。まずは“ちょうど良さ”から始めましょう。",
    familyCostume: "家族でトーンを合わせると、写真の幸福感がグッと上がります📸",
    vibe: "“その子らしさ”が一番の宝物。雰囲気は目安なので、当日に合わせて調整できます。",
    concern: "不安ごとを先に握っておけば、当日は“楽しむこと”だけに集中できます。"
  };

  return {
    key,
    label: catalogs[key as string].label,
    empathy: empathy[key as string],
    options: catalogs[key as string].options
  };
}
