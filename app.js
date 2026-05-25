const STORAGE_KEY = "whoami.quiz.v1";
const LANG_KEY = "whoami.lang.v1";

let currentQuiz = null;
let currentLang = localStorage.getItem(LANG_KEY) ?? "en";
let lastAnswers = null;

// ---- i18n ----

const i18n = {
  en: {
    appSubtitle: "A quiz about the real you",
    tabBuilder: "Create",
    tabQuiz: "Play",
    profileHeading: "Personal Info",
    profileLabel: "Info for the AI to read",
    profilePlaceholder: "e.g. name, hobbies, values, catchphrases, stories only friends know",
    makePrompt: "Make Prompt",
    sample: "Sample",
    promptHeading: "AI Prompt",
    promptPlaceholder: "Your prompt will appear here",
    jsonHeading: "Quiz JSON",
    importQuiz: "Import",
    download: "Export",
    share: "🔗 Copy Share Link",
    emptyHeading: "Import a Quiz JSON first",
    goCreate: "Create a quiz",
    submitButton: "See Results",
    resetButton: "Reset",
    retryButton: "Try Again",
    helpStep1: "① Enter personal info about the person",
    helpStep2: "② Click \"Make Prompt\"",
    helpStep3: "③ Paste prompt into ChatGPT / Claude → copy the JSON output",
    helpStep4: "④ Paste JSON here → \"Import\" → Share!",
    qrButton: "QR",
    qrHeading: "Scan to play",
    qrHint: "Point your phone camera at this code",
    resultMessages: {
      perfect: { title: "Perfect!", message: "Are you a stalker?!" },
      great:   { title: "You really know them", message: "You're practically their shadow." },
      good:    { title: "Solid friend level", message: "You know the highlights." },
      growing: { title: "Room to grow", message: "You've scratched the surface." },
      stranger:{ title: "Nice to meet you level", message: "Good news — now you can start!" }
    }
  },
  ja: {
    appSubtitle: "その人らしさを当てるクイズ",
    tabBuilder: "作問",
    tabQuiz: "回答",
    profileHeading: "パーソナル",
    profileLabel: "AIに読ませる情報",
    profilePlaceholder: "例: 名前、好きなもの、価値観、口ぐせ、友人しか知らない話",
    makePrompt: "プロンプト作成",
    sample: "サンプル",
    promptHeading: "AIプロンプト",
    promptPlaceholder: "プロンプトがここに表示されます",
    jsonHeading: "設問JSON",
    importQuiz: "読み込む",
    download: "書き出し",
    share: "🔗 リンクをコピー",
    emptyHeading: "設問JSONを読み込んでください",
    goCreate: "作問へ",
    submitButton: "結果を見る",
    resetButton: "リセット",
    retryButton: "もう一度",
    helpStep1: "① 本人の情報を入力する",
    helpStep2: "② 「プロンプト作成」をクリック",
    helpStep3: "③ ChatGPT / Claude にプロンプトを貼る → JSON出力をコピー",
    helpStep4: "④ JSONをここに貼る → 「読み込む」 → シェア！",
    qrButton: "QR",
    qrHeading: "スキャンして遊ぶ",
    qrHint: "スマホのカメラをかざしてください",
    resultMessages: {
      perfect: { title: "完璧！あなたはストーカーですか？", message: "全問正解です。本人の口ぐせや行動パターンまでかなり把握しています。" },
      great:   { title: "かなり分かってる", message: "近い距離で見ている人の正解率です。あと少しで本人公認レベル。" },
      good:    { title: "友人として順調", message: "知っている部分と意外な部分が混ざっています。次に会ったら答え合わせできます。" },
      growing: { title: "まだ伸びしろあり", message: "第一印象や雰囲気だけでは難しい問題が多かったようです。" },
      stranger:{ title: "はじめまして級", message: "ここから知っていけば大丈夫です。まずは好きなものから聞いてみましょう。" }
    }
  }
};

// ---- Sample data ----

const sampleProfile = `名前: サンプル太郎
好きなこと: カレーライス、読書、週末のサイクリング
性格: マイペースだが、頼まれると断れない
口ぐせ: 「とりあえずやってみよう」
苦手: 早起き、電話での長話
友人が知っている話: 迷子になるたびに隠れた名店を発見する
最近の関心: 自炊のレパートリーを増やすこと`;

const sampleQuiz = {
  title: { en: "Do You Know Sample Taro?", ja: "サンプル太郎理解度チェック" },
  questions: [
    {
      question: { en: "What phrase does Sample Taro say most often?", ja: "サンプル太郎がよく言いそうな一言は？" },
      choices: [
        { en: "Let's just give it a try",  ja: "とりあえずやってみよう" },
        { en: "Let's think it over first", ja: "まず考えてからにしよう" },
        { en: "Leave it to someone else",  ja: "誰かに任せよう" },
        { en: "Let's add more steps",      ja: "もっと手順を増やそう" }
      ],
      answerIndex: 0,
      explanation: { en: "His go-to phrase is 'Let's just give it a try' — action before overthinking.", ja: "口ぐせは「とりあえずやってみよう」。考えすぎる前に動くタイプです。" }
    },
    {
      question: { en: "What is Sample Taro most likely to struggle with?", ja: "サンプル太郎が最も苦手なことは？" },
      choices: [
        { en: "Cooking",          ja: "料理" },
        { en: "Cycling",          ja: "サイクリング" },
        { en: "Waking up early",  ja: "早起き" },
        { en: "Reading books",    ja: "読書" }
      ],
      answerIndex: 2,
      explanation: { en: "Early mornings are his weakness — and long phone calls too.", ja: "早起きと電話での長話が苦手です。" }
    },
    {
      question: { en: "What tends to happen when Sample Taro gets lost?", ja: "サンプル太郎が迷子になったとき、よくあることは？" },
      choices: [
        { en: "He panics and calls for help",       ja: "パニックになって助けを呼ぶ" },
        { en: "He discovers a hidden gem restaurant", ja: "隠れた名店を発見する" },
        { en: "He retraces his steps perfectly",    ja: "完璧に来た道を戻る" },
        { en: "He stays put and waits",             ja: "その場で動かず待つ" }
      ],
      answerIndex: 1,
      explanation: { en: "Getting lost is practically his superpower for finding great spots.", ja: "迷子になるたびに名店を見つけるのが特技みたいになっています。" }
    },
    {
      question: { en: "What is Sample Taro's recent hobby focus?", ja: "サンプル太郎の最近の関心は？" },
      choices: [
        { en: "Expanding his home cooking repertoire", ja: "自炊のレパートリーを増やすこと" },
        { en: "Learning a new language",               ja: "新しい言語の習得" },
        { en: "Training for a marathon",               ja: "マラソンのトレーニング" },
        { en: "Starting a podcast",                    ja: "ポッドキャストを始めること" }
      ],
      answerIndex: 0,
      explanation: { en: "He's been focused on home cooking lately — curry being a staple.", ja: "最近は自炊に力を入れています。カレーが得意料理です。" }
    },
    {
      question: { en: "How does Sample Taro react when someone asks him a favor?", ja: "頼まれごとをされたとき、サンプル太郎はどうする？" },
      choices: [
        { en: "Says no right away",              ja: "すぐに断る" },
        { en: "Agrees even when busy",           ja: "忙しくても引き受けてしまう" },
        { en: "Negotiates the deadline first",   ja: "まず締め切りを交渉する" },
        { en: "Pretends not to have heard",      ja: "聞こえなかったふりをする" }
      ],
      answerIndex: 1,
      explanation: { en: "He can't say no — being asked is enough for him to say yes.", ja: "断れない性格なので、頼まれるとついOKしてしまいます。" }
    }
  ]
};

// ---- DOM refs ----

const tabs = document.querySelectorAll("[data-tab]");
const builderView = document.querySelector("#builderView");
const quizView = document.querySelector("#quizView");
const profileInput = document.querySelector("#profileInput");
const promptOutput = document.querySelector("#promptOutput");
const jsonInput = document.querySelector("#jsonInput");
const builderStatus = document.querySelector("#builderStatus");
const langToggle = document.querySelector("#langToggle");
const shareButton = document.querySelector("#shareButton");
const qrButton = document.querySelector("#qrButton");
const quizTitle = document.querySelector("#quizTitle");
const quizMeta = document.querySelector("#quizMeta");
const scoreMeterFill = document.querySelector("#scoreMeterFill");
const emptyState = document.querySelector("#emptyState");
const quizForm = document.querySelector("#quizForm");
const questionStack = document.querySelector("#questionStack");
const resultPanel = document.querySelector("#resultPanel");
const resultTitle = document.querySelector("#resultTitle");
const resultMessage = document.querySelector("#resultMessage");
const resultDetail = document.querySelector("#resultDetail");

// ---- Helpers ----

function t(field) {
  if (field && typeof field === "object" && !Array.isArray(field)) {
    return field[currentLang] ?? field.en ?? field.ja ?? "";
  }
  return field ?? "";
}

function setStatus(message, isError = false) {
  builderStatus.textContent = message;
  builderStatus.style.color = isError ? "#b42318" : "";
}

// ---- Language toggle ----

function applyLang() {
  const L = i18n[currentLang];
  document.documentElement.lang = currentLang;
  langToggle.textContent = currentLang === "en" ? "日本語" : "English";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (L[key] !== undefined) el.textContent = L[key];
  });

  profileInput.placeholder = L.profilePlaceholder;
  promptOutput.placeholder = L.promptPlaceholder;

  if (currentQuiz) renderQuiz(currentQuiz);
  if (!resultPanel.hidden && lastAnswers) renderResult(lastAnswers);

  localStorage.setItem(LANG_KEY, currentLang);
}

// ---- Tab management ----

function setTab(tabName) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  builderView.classList.toggle("is-active", tabName === "builder");
  quizView.classList.toggle("is-active", tabName === "quiz");
}

// ---- Prompt generation ----

function makePrompt(profile) {
  return `You are an editor of a personality quiz for friends.
Read the person memo below and output a quiz JSON — nothing else.

STRICT REQUIREMENTS (violating any of these will break the app):
- EXACTLY 5 questions — not 3, not 4, not 6. Count before you respond.
- EXACTLY 4 choices per question — not 3, not 5. Count each question.
- EVERY string field must be bilingual: { "en": "...", "ja": "..." }
- title must also be bilingual: { "en": "...", "ja": "..." }
- answerIndex is a 0-based integer (0, 1, 2, or 3)
- Wrap your output in a \`\`\`json code block so the user can copy it with one click
- Do NOT truncate. Output all 5 questions in full.

JSON schema (follow exactly):
{
  "title": { "en": "...", "ja": "..." },
  "questions": [
    {
      "question": { "en": "...", "ja": "..." },
      "choices": [
        { "en": "...", "ja": "..." },
        { "en": "...", "ja": "..." },
        { "en": "...", "ja": "..." },
        { "en": "...", "ja": "..." }
      ],
      "answerIndex": 0,
      "explanation": { "en": "...", "ja": "..." }
    },
    { "question": {...}, "choices": [{...},{...},{...},{...}], "answerIndex": 0, "explanation": {...} },
    { "question": {...}, "choices": [{...},{...},{...},{...}], "answerIndex": 0, "explanation": {...} },
    { "question": {...}, "choices": [{...},{...},{...},{...}], "answerIndex": 0, "explanation": {...} },
    { "question": {...}, "choices": [{...},{...},{...},{...}], "answerIndex": 0, "explanation": {...} }
  ]
}

Person memo:
${profile.trim()}`;
}

// ---- URL share ----

async function compress(str) {
  const bytes = new TextEncoder().encode(str);
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  let binary = "";
  new Uint8Array(buf).forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

async function decompress(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  return new Response(ds.readable).text();
}

async function buildShareUrl(quiz) {
  const json = JSON.stringify(quiz);
  const base = location.href.split("#")[0];
  if (window.CompressionStream) {
    try {
      const b64 = await compress(json);
      return `${base}#q2=${b64}`;
    } catch { /* fall through */ }
  }
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return `${base}#q=${b64}`;
}

async function loadFromHash() {
  const hash = location.hash;
  try {
    let json;
    if (hash.startsWith("#q2=")) {
      json = await decompress(hash.slice(4));
    } else if (hash.startsWith("#q=")) {
      json = decodeURIComponent(escape(atob(hash.slice(3))));
    } else {
      return false;
    }
    const quiz = normalizeQuiz(JSON.parse(json));
    saveQuiz(quiz);
    renderQuiz(quiz);
    setTab("quiz");
    const builderTab = document.querySelector('[data-tab="builder"]');
    builderTab.hidden = true;
    document.querySelector(".tablist").classList.add("single-tab");
    document.querySelector("#helpBanner").hidden = true;
    return true;
  } catch {
    return false;
  }
}

// ---- Validation ----

function normalizeBilingualString(field, label) {
  if (typeof field === "string") {
    const s = field.trim();
    if (!s) throw new Error(`${label} が必要です。`);
    return { en: s, ja: s };
  }
  if (field && typeof field === "object") {
    const en = String(field.en ?? "").trim();
    const ja = String(field.ja ?? "").trim();
    if (!en && !ja) throw new Error(`${label} が必要です。`);
    return { en: en || ja, ja: ja || en };
  }
  throw new Error(`${label} の形式が正しくありません。`);
}

function normalizeQuiz(rawQuiz) {
  if (!rawQuiz || typeof rawQuiz !== "object") {
    throw new Error("JSONの形式が正しくありません。");
  }

  const title = normalizeBilingualString(rawQuiz.title, "title");

  if (!Array.isArray(rawQuiz.questions) || rawQuiz.questions.length !== 5) {
    throw new Error("questions はちょうど5件にしてください。");
  }

  const questions = rawQuiz.questions.map((item, index) => {
    const num = `${index + 1}問目`;
    if (!item || typeof item !== "object") {
      throw new Error(`${num} の形式が正しくありません。`);
    }

    const question = normalizeBilingualString(item.question, `${num} question`);

    if (!Array.isArray(item.choices) || item.choices.length !== 4) {
      throw new Error(`${num} の choices は4件にしてください。`);
    }

    const choices = item.choices.map((choice, ci) =>
      normalizeBilingualString(choice, `${num} 選択肢${ci + 1}`)
    );

    const answerIndex = Number(item.answerIndex);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= choices.length) {
      throw new Error(`${num} の answerIndex が範囲外です。`);
    }

    const explanation = item.explanation
      ? normalizeBilingualString(item.explanation, `${num} explanation`)
      : { en: "", ja: "" };

    return { question, choices, answerIndex, explanation };
  });

  return { title, questions };
}

// ---- Storage ----

function saveQuiz(quiz) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quiz));
}

function loadStoredQuiz() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return normalizeQuiz(JSON.parse(stored));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

// ---- Render quiz ----

function renderQuiz(quiz) {
  currentQuiz = quiz;
  quizTitle.textContent = quiz ? t(quiz.title) : "—";
  quizMeta.textContent = quiz
    ? `${quiz.questions.length} ${currentLang === "en" ? "questions" : "問"}`
    : "";
  scoreMeterFill.style.width = "0%";
  questionStack.innerHTML = "";
  resultPanel.hidden = true;
  lastAnswers = null;

  if (!quiz) {
    emptyState.hidden = false;
    quizForm.hidden = true;
    shareButton.disabled = true;
    qrButton.disabled = true;
    return;
  }

  emptyState.hidden = true;
  quizForm.hidden = false;
  shareButton.disabled = false;
  qrButton.disabled = false;

  quiz.questions.forEach((item, questionIndex) => {
    const card = document.createElement("section");
    card.className = "question-card";

    const kicker = document.createElement("div");
    kicker.className = "question-kicker";
    kicker.textContent = `Q${questionIndex + 1}`;

    const question = document.createElement("p");
    question.className = "question-text";
    question.textContent = t(item.question);

    const choices = document.createElement("div");
    choices.className = "choices";

    item.choices.forEach((choiceField, choiceIndex) => {
      const label = document.createElement("label");
      label.className = "choice";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${questionIndex}`;
      input.value = String(choiceIndex);
      input.required = true;

      const text = document.createElement("span");
      text.textContent = t(choiceField);

      label.append(input, text);
      choices.append(label);
    });

    card.append(kicker, question, choices);
    questionStack.append(card);
  });

  questionStack.addEventListener("change", () => {
    const answered = quizForm.querySelectorAll("input[type='radio']:checked").length;
    const total = currentQuiz.questions.length;
    scoreMeterFill.style.width = `${Math.round((answered / total) * 100)}%`;
    quizMeta.textContent = currentLang === "en"
      ? `${answered}/${total} answered`
      : `${answered}/${total}問回答済み`;
  }, { once: false });
}

// ---- Result ----

function getResultMessage(score, total) {
  const ratio = total === 0 ? 0 : score / total;
  const msgs = i18n[currentLang].resultMessages;
  if (ratio === 1)    return msgs.perfect;
  if (ratio >= 0.75)  return msgs.great;
  if (ratio >= 0.45)  return msgs.good;
  if (ratio > 0)      return msgs.growing;
  return msgs.stranger;
}

function renderResult(answers) {
  if (!currentQuiz) return;
  const total = currentQuiz.questions.length;
  const score = answers.reduce((sum, answer, index) => {
    return sum + (answer === currentQuiz.questions[index].answerIndex ? 1 : 0);
  }, 0);

  const result = getResultMessage(score, total);
  resultTitle.textContent = result.title;
  const scoreLabel = currentLang === "en"
    ? `${score}/${total} correct.`
    : `${score}/${total}問正解。`;
  resultMessage.textContent = `${scoreLabel} ${result.message}`;
  quizMeta.textContent = currentLang === "en"
    ? `${score}/${total} correct`
    : `${score}/${total}問正解`;
  scoreMeterFill.style.width = `${Math.round((score / total) * 100)}%`;

  resultDetail.innerHTML = "";
  currentQuiz.questions.forEach((item, index) => {
    const row = document.createElement("div");
    const isCorrect = answers[index] === item.answerIndex;
    row.className = `answer-row ${isCorrect ? "is-correct" : "is-wrong"}`;
    const correctChoice = t(item.choices[item.answerIndex]);
    const explanationText = t(item.explanation);

    if (isCorrect) {
      row.textContent = `Q${index + 1}: ✓ ${correctChoice}`;
    } else {
      const selectedChoice = t(item.choices[answers[index]]);
      row.textContent = `Q${index + 1}: ${selectedChoice} → ✓ ${correctChoice}`;
    }

    if (explanationText) row.textContent += ` / ${explanationText}`;
    resultDetail.append(row);
  });
}

function showResult(event) {
  event.preventDefault();
  if (!currentQuiz) return;

  const answers = currentQuiz.questions.map((_, index) => {
    const selected = quizForm.querySelector(`input[name="question-${index}"]:checked`);
    return selected ? Number(selected.value) : -1;
  });

  if (answers.some((a) => a === -1)) {
    quizForm.reportValidity();
    return;
  }

  lastAnswers = answers;
  renderResult(answers);

  quizForm.hidden = true;
  resultPanel.hidden = false;
  resultTitle.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- Event listeners ----

langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "ja" : "en";
  applyLang();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

document.querySelectorAll("[data-tab-jump]").forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tabJump));
});

document.querySelector("#makePromptButton").addEventListener("click", () => {
  const profile = profileInput.value.trim();
  if (!profile) {
    setStatus("パーソナルを入力してください。", true);
    profileInput.focus();
    return;
  }
  promptOutput.value = makePrompt(profile);
  setStatus("AIプロンプトを作成しました。");
});

document.querySelector("#copyPromptButton").addEventListener("click", async () => {
  if (!promptOutput.value.trim()) {
    setStatus("コピーするプロンプトがありません。", true);
    return;
  }
  const btn = document.querySelector("#copyPromptButton");
  const icon = btn.querySelector("span");
  try {
    await navigator.clipboard.writeText(promptOutput.value);
    icon.textContent = "✓";
    btn.classList.add("is-copied");
    setTimeout(() => {
      icon.textContent = "⧉";
      btn.classList.remove("is-copied");
    }, 1500);
    setStatus("プロンプトをコピーしました。");
  } catch {
    promptOutput.select();
    setStatus("コピーできないため、プロンプトを選択しました。");
  }
});

document.querySelector("#loadSampleButton").addEventListener("click", () => {
  profileInput.value = sampleProfile;
  promptOutput.value = makePrompt(sampleProfile);
  jsonInput.value = JSON.stringify(sampleQuiz, null, 2);
  setStatus("サンプルを読み込みました。");
});

document.querySelector("#clearProfileButton").addEventListener("click", () => {
  profileInput.value = "";
  promptOutput.value = "";
  setStatus("");
});

function stripCodeFences(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
}

document.querySelector("#importQuizButton").addEventListener("click", () => {
  try {
    const quiz = normalizeQuiz(JSON.parse(stripCodeFences(jsonInput.value)));
    saveQuiz(quiz);
    renderQuiz(quiz);
    setStatus(`${quiz.questions.length}問のクイズを読み込みました。`);
    setTab("quiz");
  } catch (error) {
    setStatus(error.message || "設問JSONを読み込めません。", true);
  }
});

document.querySelector("#downloadQuizButton").addEventListener("click", () => {
  const source = jsonInput.value.trim() || (currentQuiz ? JSON.stringify(currentQuiz, null, 2) : "");
  if (!source) {
    setStatus("書き出す設問JSONがありません。", true);
    return;
  }
  const blob = new Blob([source], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "whoami-quiz.json";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("設問JSONを書き出しました。");
});

shareButton.addEventListener("click", async () => {
  if (!currentQuiz) return;
  const url = await buildShareUrl(currentQuiz);
  try {
    await navigator.clipboard.writeText(url);
    setStatus("共有リンクをコピーしました。Discordに貼ってね！");
  } catch {
    prompt("共有リンクをコピーしてください:", url);
  }
});

document.querySelector("#qrButton").addEventListener("click", async () => {
  if (!currentQuiz) return;
  const url = await buildShareUrl(currentQuiz);
  const canvas = document.querySelector("#qrCanvas");
  await QRCode.toCanvas(canvas, url, { width: 260, margin: 2 });
  document.querySelector("#qrOverlay").hidden = false;
});

document.querySelector("#qrClose").addEventListener("click", () => {
  document.querySelector("#qrOverlay").hidden = true;
});

document.querySelector("#qrOverlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.hidden = true;
});

document.querySelector("#clearQuizButton").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  jsonInput.value = "";
  renderQuiz(null);
  setStatus("クイズを消去しました。");
});

document.querySelector("#resetAnswersButton").addEventListener("click", () => {
  quizForm.reset();
  scoreMeterFill.style.width = "0%";
  quizMeta.textContent = currentQuiz
    ? `${currentQuiz.questions.length} ${currentLang === "en" ? "questions" : "問"}`
    : "";
  lastAnswers = null;
});

document.querySelector("#retryButton").addEventListener("click", () => {
  quizForm.reset();
  quizForm.hidden = false;
  resultPanel.hidden = true;
  scoreMeterFill.style.width = "0%";
  quizMeta.textContent = currentQuiz
    ? `${currentQuiz.questions.length} ${currentLang === "en" ? "questions" : "問"}`
    : "";
  lastAnswers = null;
  quizForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

quizForm.addEventListener("submit", showResult);

// ---- Init ----

applyLang();

(async () => {
  if (!await loadFromHash()) {
    renderQuiz(loadStoredQuiz());
  }
})();
