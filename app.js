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
    stepPrompt: "Prompt",
    stepJson: "JSON",
    stepEdit: "Edit",
    stepShare: "Share",
    profileHeading: "Personal Info",
    profileLabel: "Info for the AI to read",
    profilePlaceholder: "e.g. name, hobbies, values, catchphrases, stories only friends know",
    makePrompt: "Make Prompt",
    sample: "Sample",
    promptHeading: "AI Prompt",
    promptStepNote: "Copy this prompt to an external AI, then bring the JSON result back here.",
    goJsonStep: "Paste generated JSON",
    promptPlaceholder: "Your prompt will appear here",
    jsonHeading: "Quiz JSON",
    jsonEyebrow: "AI output",
    quizReadyEyebrow: "Generated flow",
    quizReadyHeading: "Generate, review, then edit",
    quizReadyNote: "Paste the AI output here, then import it to review and edit the generated quiz.",
    jsonSummary: "Paste or edit quiz JSON",
    generatedEyebrow: "Generated quiz",
    openEditor: "Edit questions",
    editorHeading: "Review and customize",
    editorNote: "Edit weak questions, choices, correct answers, or explanations before sharing.",
    editorTitleLabel: "Quiz title",
    editorQuestionLabel: "Question",
    editorChoicesLabel: "Choices",
    editorCorrectLabel: "Correct",
    editorExplanationLabel: "Explanation",
    editorSaved: "Quiz edits saved.",
    confirmPublishMessage: "Did you check the questions, correct answers, and explanations?",
    importQuiz: "Import",
    download: "Export",
    goShareStep: "Go to share",
    shareEyebrow: "Publish",
    shareHeading: "Quiz URL",
    shareNote: "Share this URL after you finish editing the questions.",
    shareUrlLabel: "Quiz URL",
    copyUrl: "Copy URL",
    openQuiz: "Open play screen",
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
    challengeEyebrow: "Challenge",
    resultEyebrow: "Result",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    explanationLabel: "Why",
    correctLabel: "Correct",
    copiedShare: "Share link copied.",
    qrError: "Could not load the QR code library. Copy the share link instead.",
    selectedAnswer: "Selected answer",
    changeAnswer: "Change",
    unansweredError: "Choose one answer.",
    aiButtonsLabel: "Open in AI",
    openChatGpt: "Open in ChatGPT",
    openClaude: "Open in Claude",
    openGemini: "Open in Gemini",
    copyPromptOnly: "Copy",
    copiedFeedback: "Copied!",
    copyFailedFeedback: "Copy manually",
    statusMessages: {
      sharedLoaded: "Shared quiz loaded.",
      sharedLoadError: "Could not load the shared quiz link.",
      profileRequired: "Enter personal info first.",
      promptCreated: "AI prompt created.",
      promptMissing: "There is no prompt to copy.",
      promptCopied: "Prompt copied.",
      promptSelected: "Could not copy automatically, so the prompt was selected.",
      sampleLoaded: "Sample loaded.",
      quizImported: "{count} questions loaded.",
      importError: "Could not load the quiz JSON.",
      exportMissing: "There is no quiz JSON to export.",
      exportDone: "Quiz JSON exported.",
      quizCleared: "Quiz cleared."
    },
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
    stepPrompt: "プロンプト",
    stepJson: "JSON貼付",
    stepEdit: "編集",
    stepShare: "共有",
    profileHeading: "パーソナル",
    profileLabel: "AIに読ませる情報",
    profilePlaceholder: "例: 名前、好きなもの、価値観、口ぐせ、友人しか知らない話",
    makePrompt: "プロンプト作成",
    sample: "サンプル",
    promptHeading: "AIプロンプト",
    promptStepNote: "このプロンプトを外部AIに貼り付け、生成されたJSONを次のステップに戻します。",
    goJsonStep: "生成JSONを貼り付ける",
    promptPlaceholder: "プロンプトがここに表示されます",
    jsonHeading: "設問JSON",
    jsonEyebrow: "AIの出力",
    quizReadyEyebrow: "生成フロー",
    quizReadyHeading: "生成して、確認して、編集",
    quizReadyNote: "AIの出力をここに貼り付けて読み込むと、生成結果の確認と編集に進めます。",
    jsonSummary: "設問JSONを貼り付け/編集",
    generatedEyebrow: "生成されたクイズ",
    openEditor: "設問を編集",
    editorHeading: "設問を確認・編集",
    editorNote: "いまいちな質問、選択肢、正解、解説を共有前に調整できます。",
    editorTitleLabel: "クイズタイトル",
    editorQuestionLabel: "質問",
    editorChoicesLabel: "選択肢",
    editorCorrectLabel: "正解",
    editorExplanationLabel: "解説",
    editorSaved: "設問の編集を保存しました。",
    confirmPublishMessage: "質問・正解・解説の内容を確認しましたか？",
    importQuiz: "読み込む",
    download: "書き出し",
    goShareStep: "共有へ進む",
    shareEyebrow: "公開",
    shareHeading: "出題URL",
    shareNote: "設問の編集が終わったら、このURLを回答者に共有します。",
    shareUrlLabel: "出題URL",
    copyUrl: "URLをコピー",
    openQuiz: "回答画面を開く",
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
    challengeEyebrow: "チャレンジ",
    resultEyebrow: "結果",
    yourAnswer: "あなたの回答",
    correctAnswer: "正解",
    explanationLabel: "解説",
    correctLabel: "正解",
    copiedShare: "共有リンクをコピーしました。",
    qrError: "QRコードライブラリを読み込めませんでした。共有リンクをコピーしてください。",
    selectedAnswer: "選択した回答",
    changeAnswer: "変更",
    unansweredError: "回答を1つ選んでください。",
    aiButtonsLabel: "AIで開く",
    openChatGpt: "ChatGPT で開く",
    openClaude: "Claude で開く",
    openGemini: "Gemini で開く",
    copyPromptOnly: "コピー",
    copiedFeedback: "コピーしました！",
    copyFailedFeedback: "手動でコピーしてください",
    statusMessages: {
      sharedLoaded: "共有されたクイズを読み込みました。",
      sharedLoadError: "共有リンクのクイズを読み込めませんでした。",
      profileRequired: "パーソナルを入力してください。",
      promptCreated: "AIプロンプトを作成しました。",
      promptMissing: "コピーするプロンプトがありません。",
      promptCopied: "プロンプトをコピーしました。",
      promptSelected: "コピーできないため、プロンプトを選択しました。",
      sampleLoaded: "サンプルを読み込みました。",
      quizImported: "{count}問のクイズを読み込みました。",
      importError: "設問JSONを読み込めません。",
      exportMissing: "書き出す設問JSONがありません。",
      exportDone: "設問JSONを書き出しました。",
      quizCleared: "クイズを消去しました。"
    },
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
const builderStepTabs = document.querySelectorAll("[data-builder-step]");
const builderStepPanels = document.querySelectorAll("[data-step-panel]");
const builderView = document.querySelector("#builderView");
const quizView = document.querySelector("#quizView");
const profileInput = document.querySelector("#profileInput");
const promptOutput = document.querySelector("#promptOutput");
const jsonInput = document.querySelector("#jsonInput");
const quizEditorDetails = document.querySelector("#quizEditorDetails");
const quizEditor = document.querySelector("#quizEditor");
const quizTitleEditor = document.querySelector("#quizTitleEditor");
const questionEditorStack = document.querySelector("#questionEditorStack");
const quizReveal = document.querySelector("#quizReveal");
const generatedQuizTitle = document.querySelector("#generatedQuizTitle");
const generatedQuizMeta = document.querySelector("#generatedQuizMeta");
const shareUrlInput = document.querySelector("#shareUrlInput");
const openQuizButton = document.querySelector("#openQuizButton");
const goShareButton = document.querySelector("#goShareButton");
const builderStatus = document.querySelector("#builderStatus");
const langToggle = document.querySelector("#langToggle");
const shareButtons = document.querySelectorAll("[data-share-action='copy']");
const qrButtons = document.querySelectorAll("[data-share-action='qr']");
const qrOverlay = document.querySelector("#qrOverlay");
const qrCanvas = document.querySelector("#qrCanvas");
const quizTitle = document.querySelector("#quizTitle");
const quizMeta = document.querySelector("#quizMeta");
const scoreMeterFill = document.querySelector("#scoreMeterFill");
const quizProgressBar = document.querySelector("#quizProgressBar");
const stickyQuizTitle = document.querySelector("#stickyQuizTitle");
const stickyQuizMeta = document.querySelector("#stickyQuizMeta");
const stickyScoreMeterFill = document.querySelector("#stickyScoreMeterFill");
const emptyState = document.querySelector("#emptyState");
const quizForm = document.querySelector("#quizForm");
const questionStack = document.querySelector("#questionStack");
const resultPanel = document.querySelector("#resultPanel");
const resultTitle = document.querySelector("#resultTitle");
const resultMessage = document.querySelector("#resultMessage");
const resultDetail = document.querySelector("#resultDetail");
let shareUrlVersion = 0;

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

function statusText(key, vars = {}) {
  const template = i18n[currentLang].statusMessages[key] ?? "";
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
}

function setShareControls(enabled) {
  shareButtons.forEach((button) => {
    button.disabled = !enabled;
  });
  qrButtons.forEach((button) => {
    button.disabled = !enabled;
  });
  if (openQuizButton) openQuizButton.disabled = !enabled;
  if (!enabled && shareUrlInput) shareUrlInput.value = "";
}

function setBuilderStep(step) {
  const nextStep = String(step);
  builderStepTabs.forEach((button) => {
    const isActive = button.dataset.builderStep === nextStep;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "step" : "false");
  });
  builderStepPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.stepPanel === nextStep);
  });
}

function updateBuilderStepAvailability(hasQuiz) {
  const hasJsonInput = Boolean(jsonInput.value.trim());
  builderStepTabs.forEach((button) => {
    const step = Number(button.dataset.builderStep);
    button.disabled = step > 2 && !hasQuiz && !hasJsonInput;
  });
}

function confirmBeforeShare() {
  return window.confirm(i18n[currentLang].confirmPublishMessage);
}

async function updateShareUrlField() {
  if (!shareUrlInput) return;
  if (!currentQuiz) {
    shareUrlVersion += 1;
    shareUrlInput.value = "";
    if (openQuizButton) openQuizButton.disabled = true;
    return;
  }

  const version = ++shareUrlVersion;
  const url = await buildShareUrl(currentQuiz);
  if (version !== shareUrlVersion) return;
  shareUrlInput.value = url;
  if (openQuizButton) openQuizButton.disabled = false;
}

function baseQuizMeta(quiz) {
  return quiz ? `${quiz.questions.length} ${currentLang === "en" ? "questions" : "問"}` : "";
}

function answeredQuizMeta(answered, total) {
  return currentLang === "en"
    ? `${answered}/${total} answered`
    : `${answered}/${total}問回答済み`;
}

function updateProgress(meta, percent) {
  quizMeta.textContent = meta;
  stickyQuizMeta.textContent = meta;
  scoreMeterFill.style.width = `${percent}%`;
  stickyScoreMeterFill.style.width = `${percent}%`;
}

function setQuestionError(card, message = "") {
  const error = card.querySelector(".question-error");
  card.classList.toggle("is-missing", Boolean(message));
  error.textContent = message;
}

function syncQuestionCards() {
  questionStack.querySelectorAll(".question-card").forEach((card) => {
    const checked = card.querySelector("input[type='radio']:checked");
    const selected = card.querySelector(".selected-answer-text");
    const changeButton = card.querySelector(".change-answer-button");
    if (!checked) {
      card.classList.remove("is-answered", "is-editing");
      selected.textContent = "";
      changeButton.hidden = true;
      return;
    }

    selected.textContent = checked.nextElementSibling.textContent;
    changeButton.hidden = false;
    card.classList.add("is-answered");
    card.classList.remove("is-editing");
    setQuestionError(card);
  });
}

function setLocalizedValue(field, value) {
  if (!field || typeof field !== "object" || Array.isArray(field)) return;
  field[currentLang] = value;
}

quizTitleEditor.addEventListener("input", () => {
  if (!currentQuiz) return;
  setLocalizedValue(currentQuiz.title, quizTitleEditor.value);
  syncEditedQuiz();
});

function syncEditedQuiz() {
  if (!currentQuiz) return;
  jsonInput.value = JSON.stringify(currentQuiz, null, 2);
  saveQuiz(currentQuiz);
  setShareControls(true);
  updateShareUrlField();
}

function updateAnswerProgress() {
  if (!currentQuiz) {
    updateProgress("", 0);
    return;
  }
  const answered = quizForm.querySelectorAll("input[type='radio']:checked").length;
  const total = currentQuiz.questions.length;
  const meta = answered === 0 ? baseQuizMeta(currentQuiz) : answeredQuizMeta(answered, total);
  updateProgress(meta, Math.round((answered / total) * 100));
}

// ---- Language toggle ----

function applyLang() {
  const L = i18n[currentLang];
  document.documentElement.lang = currentLang;
  langToggle.textContent = currentLang === "en" ? "日本語" : "English";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (L[key] !== undefined) {
      // Skip elements whose button ancestor is showing transient "is-copied" feedback;
      // the setTimeout in handleAiButtonClick will restore the correct text when it fires.
      const btnAncestor = el.closest("[data-ai-provider]");
      if (btnAncestor && btnAncestor.classList.contains("is-copied")) return;
      el.textContent = L[key];
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.dataset.i18nAriaLabel;
    if (L[key] !== undefined) el.setAttribute("aria-label", L[key]);
  });

  profileInput.placeholder = L.profilePlaceholder;
  promptOutput.placeholder = L.promptPlaceholder;

  if (currentQuiz) renderQuiz(currentQuiz);
  if (!resultPanel.hidden && lastAnswers) renderResult(lastAnswers);

  localStorage.setItem(LANG_KEY, currentLang);
}

// ---- Tab management ----

function setTab(tabName) {
  if (tabName === "quiz" && currentQuiz) renderQuiz(currentQuiz);
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

function bytesToBase64Url(bytes) {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function compress(str) {
  const bytes = new TextEncoder().encode(str);
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  return bytesToBase64Url(new Uint8Array(buf));
}

async function decompress(b64) {
  const bytes = base64UrlToBytes(b64);
  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  return new Response(ds.readable).text();
}

async function buildShareUrl(quiz) {
  const json = JSON.stringify(quiz);
  const base = location.href.split("#")[0];
  if (window.CompressionStream && window.DecompressionStream) {
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
      if (!window.DecompressionStream) return false;
      json = await decompress(hash.slice(4));
    } else if (hash.startsWith("#q=")) {
      json = decodeURIComponent(escape(atob(hash.slice(3))));
    } else {
      return false;
    }
    const quiz = normalizeQuiz(JSON.parse(json));
    saveQuiz(quiz);
    jsonInput.value = JSON.stringify(quiz, null, 2);
    renderQuiz(quiz);
    setTab("quiz");
    const builderTab = document.querySelector('[data-tab="builder"]');
    builderTab.hidden = true;
    document.querySelector(".tablist").classList.add("single-tab");
    const helpBanner = document.querySelector("#helpBanner");
    if (helpBanner) helpBanner.hidden = true;
    setStatus(statusText("sharedLoaded"));
    return true;
  } catch {
    setStatus(statusText("sharedLoadError"), true);
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

// ---- Render quiz editor ----

function renderQuizReveal(quiz) {
  quizReveal.hidden = !quiz;
  if (!quiz) {
    generatedQuizTitle.textContent = "—";
    generatedQuizMeta.textContent = "";
    return;
  }

  generatedQuizTitle.textContent = t(quiz.title);
  generatedQuizMeta.textContent = baseQuizMeta(quiz);
}

function renderQuizEditor(quiz) {
  quizEditorDetails.hidden = !quiz;
  quizEditorDetails.open = Boolean(quiz);
  questionEditorStack.innerHTML = "";

  if (!quiz) {
    quizTitleEditor.value = "";
    return;
  }

  const L = i18n[currentLang];
  quizTitleEditor.value = t(quiz.title);

  quiz.questions.forEach((item, questionIndex) => {
    const card = document.createElement("section");
    card.className = "editor-question-card";

    const header = document.createElement("div");
    header.className = "editor-question-header";

    const kicker = document.createElement("span");
    kicker.className = "question-kicker";
    kicker.textContent = `Q${questionIndex + 1}`;

    const correctLabel = document.createElement("span");
    correctLabel.className = "editor-correct-summary";
    correctLabel.textContent = `${L.editorCorrectLabel}: ${item.answerIndex + 1}`;

    header.append(kicker, correctLabel);

    const questionLabel = document.createElement("label");
    questionLabel.className = "editor-field";
    const questionCaption = document.createElement("span");
    questionCaption.textContent = L.editorQuestionLabel;
    const questionInput = document.createElement("textarea");
    questionInput.rows = 2;
    questionInput.value = t(item.question);
    questionInput.addEventListener("input", () => {
      setLocalizedValue(item.question, questionInput.value);
      syncEditedQuiz();
    });
    questionLabel.append(questionCaption, questionInput);

    const choicesGroup = document.createElement("fieldset");
    choicesGroup.className = "editor-choices";

    const choicesLegend = document.createElement("legend");
    choicesLegend.textContent = L.editorChoicesLabel;
    choicesGroup.append(choicesLegend);

    item.choices.forEach((choice, choiceIndex) => {
      const row = document.createElement("label");
      row.className = "editor-choice";

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `editor-answer-${questionIndex}`;
      radio.value = String(choiceIndex);
      radio.checked = item.answerIndex === choiceIndex;
      radio.setAttribute("aria-label", `${L.editorCorrectLabel} ${choiceIndex + 1}`);
      radio.addEventListener("change", () => {
        item.answerIndex = choiceIndex;
        correctLabel.textContent = `${L.editorCorrectLabel}: ${choiceIndex + 1}`;
        syncEditedQuiz();
      });

      const choiceInput = document.createElement("input");
      choiceInput.type = "text";
      choiceInput.value = t(choice);
      choiceInput.addEventListener("input", () => {
        setLocalizedValue(choice, choiceInput.value);
        syncEditedQuiz();
      });

      row.append(radio, choiceInput);
      choicesGroup.append(row);
    });

    const explanationLabel = document.createElement("label");
    explanationLabel.className = "editor-field";
    const explanationCaption = document.createElement("span");
    explanationCaption.textContent = L.editorExplanationLabel;
    const explanationInput = document.createElement("textarea");
    explanationInput.rows = 2;
    explanationInput.value = t(item.explanation);
    explanationInput.addEventListener("input", () => {
      setLocalizedValue(item.explanation, explanationInput.value);
      syncEditedQuiz();
    });
    explanationLabel.append(explanationCaption, explanationInput);

    card.append(header, questionLabel, choicesGroup, explanationLabel);
    questionEditorStack.append(card);
  });
}

// ---- Render quiz ----

function renderQuiz(quiz) {
  currentQuiz = quiz;
  updateBuilderStepAvailability(Boolean(quiz));
  renderQuizReveal(quiz);
  renderQuizEditor(quiz);
  quizTitle.textContent = quiz ? t(quiz.title) : "—";
  stickyQuizTitle.textContent = quiz ? t(quiz.title) : "—";
  quizProgressBar.hidden = !quiz;
  updateProgress(baseQuizMeta(quiz), 0);
  questionStack.innerHTML = "";
  resultPanel.hidden = true;
  lastAnswers = null;

  if (!quiz) {
    emptyState.hidden = false;
    quizForm.hidden = true;
    setShareControls(false);
    updateShareUrlField();
    return;
  }

  emptyState.hidden = true;
  quizForm.hidden = false;
  setShareControls(true);
  updateShareUrlField();

  quiz.questions.forEach((item, questionIndex) => {
    const card = document.createElement("section");
    card.className = "question-card";
    card.dataset.questionIndex = String(questionIndex);

    const kicker = document.createElement("div");
    kicker.className = "question-kicker";
    kicker.textContent = `Q${questionIndex + 1}`;

    const question = document.createElement("p");
    question.className = "question-text";
    question.textContent = t(item.question);

    const selectedSummary = document.createElement("div");
    selectedSummary.className = "selected-answer";

    const selectedLabel = document.createElement("span");
    selectedLabel.className = "selected-answer-label";
    selectedLabel.textContent = i18n[currentLang].selectedAnswer;

    const selectedText = document.createElement("strong");
    selectedText.className = "selected-answer-text";

    const changeButton = document.createElement("button");
    changeButton.className = "change-answer-button";
    changeButton.type = "button";
    changeButton.textContent = i18n[currentLang].changeAnswer;
    changeButton.hidden = true;
    changeButton.addEventListener("click", () => {
      card.classList.add("is-editing");
      const checked = card.querySelector("input[type='radio']:checked");
      if (checked) checked.focus();
    });

    selectedSummary.append(selectedLabel, selectedText, changeButton);

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
      input.setAttribute("aria-describedby", `question-error-${questionIndex}`);

      const text = document.createElement("span");
      text.textContent = t(choiceField);

      label.append(input, text);
      choices.append(label);
    });

    const error = document.createElement("p");
    error.className = "question-error";
    error.id = `question-error-${questionIndex}`;
    error.setAttribute("aria-live", "polite");

    card.append(kicker, question, selectedSummary, choices, error);
    questionStack.append(card);
  });

  questionStack.onchange = () => {
    syncQuestionCards();
    updateAnswerProgress();
  };
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

function getResultTone(score, total) {
  const ratio = total === 0 ? 0 : score / total;
  if (ratio >= 0.75) return "positive";
  if (ratio >= 0.45) return "neutral";
  return "negative";
}

function renderResult(answers) {
  if (!currentQuiz) return;
  const total = currentQuiz.questions.length;
  const score = answers.reduce((sum, answer, index) => {
    return sum + (answer === currentQuiz.questions[index].answerIndex ? 1 : 0);
  }, 0);

  const result = getResultMessage(score, total);
  const tone = getResultTone(score, total);
  resultPanel.classList.remove("is-positive", "is-neutral", "is-negative", "is-perfect");
  resultPanel.classList.add(`is-${tone}`);
  if (score === total) resultPanel.classList.add("is-perfect");

  resultTitle.textContent = result.title;
  const scoreLabel = currentLang === "en"
    ? `${score}/${total} correct.`
    : `${score}/${total}問正解。`;
  resultMessage.textContent = `${scoreLabel} ${result.message}`;
  quizMeta.textContent = currentLang === "en"
    ? `${score}/${total} correct`
    : `${score}/${total}問正解`;
  updateProgress(quizMeta.textContent, Math.round((score / total) * 100));

  resultDetail.innerHTML = "";
  currentQuiz.questions.forEach((item, index) => {
    const row = document.createElement("div");
    const isCorrect = answers[index] === item.answerIndex;
    row.className = `answer-row ${isCorrect ? "is-correct" : "is-wrong"}`;
    const correctChoice = t(item.choices[item.answerIndex]);
    const selectedChoice = t(item.choices[answers[index]]);
    const explanationText = t(item.explanation);

    const badge = document.createElement("span");
    badge.className = "answer-badge";
    badge.textContent = isCorrect ? `Q${index + 1} ${i18n[currentLang].correctLabel}` : `Q${index + 1}`;

    const answerBody = document.createElement("div");
    answerBody.className = "answer-body";

    const selected = document.createElement("p");
    selected.innerHTML = `<strong>${i18n[currentLang].yourAnswer}</strong><span></span>`;
    selected.querySelector("span").textContent = selectedChoice;
    answerBody.append(selected);

    if (!isCorrect) {
      const correct = document.createElement("p");
      correct.innerHTML = `<strong>${i18n[currentLang].correctAnswer}</strong><span></span>`;
      correct.querySelector("span").textContent = correctChoice;
      answerBody.append(correct);
    }

    if (explanationText) {
      const explanation = document.createElement("p");
      explanation.className = "answer-explanation";
      explanation.innerHTML = `<strong>${i18n[currentLang].explanationLabel}</strong><span></span>`;
      explanation.querySelector("span").textContent = explanationText;
      answerBody.append(explanation);
    }

    row.append(badge, answerBody);
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
    let firstMissing = null;
    answers.forEach((answer, index) => {
      const card = questionStack.querySelector(`[data-question-index="${index}"]`);
      if (answer === -1) {
        setQuestionError(card, i18n[currentLang].unansweredError);
        card.classList.add("is-editing");
        firstMissing ??= card;
      } else {
        setQuestionError(card);
      }
    });
    firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  lastAnswers = answers;
  renderResult(answers);

  quizForm.hidden = true;
  resultPanel.hidden = false;
  resultTitle.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---- Analytics ----

function trackAiButtonClick(provider) {
  if (typeof gtag === "function") {
    gtag("event", "ai_button_click", { ai_provider: provider });
  } else {
    console.log("[analytics] ai_button_click", { ai_provider: provider });
  }
}

// ---- AI buttons ----

const AI_URLS = {
  chatgpt: "https://chatgpt.com/",
  claude: "https://claude.ai/new",
  gemini: "https://gemini.google.com/app",
};

async function handleAiButtonClick(provider) {
  const prompt = promptOutput.value.trim();
  if (!prompt) {
    setStatus(statusText("promptMissing"), true);
    return;
  }

  const btn = document.querySelector(`[data-ai-provider="${provider}"]`);
  if (!btn) return;
  // Target the translatable span if present (a11y structure), otherwise the button itself.
  const labelEl = btn.querySelector("[data-i18n]") ?? btn;
  const originalText = labelEl.textContent;
  const L = i18n[currentLang];

  async function attemptCopy() {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(prompt);
      return true;
    }
    // Graceful degradation: execCommand fallback.
    // NOTE: This is called inside an async function, so the user-gesture context
    // is typically lost by the time execCommand runs. Most modern browsers will
    // silently fail or throw here. The try/catch in the caller handles that case
    // by showing a "copy manually" message rather than crashing.
    const ta = document.createElement("textarea");
    ta.value = prompt;
    ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (!ok) throw new Error("execCommand failed");
    return true;
  }

  let copied = false;
  try {
    await attemptCopy();
    copied = true;
  } catch {
    // copy failed — show degradation message, still open the URL
  }

  trackAiButtonClick(provider);

  if (provider !== "copy_only" && AI_URLS[provider]) {
    window.open(AI_URLS[provider], "_blank", "noopener,noreferrer");
  }

  const feedback = copied ? L.copiedFeedback : L.copyFailedFeedback;
  labelEl.textContent = feedback;
  btn.classList.add("is-copied");
  setTimeout(() => {
    labelEl.textContent = originalText;
    btn.classList.remove("is-copied");
  }, 2000);
}

// ---- Event listeners ----

document.querySelectorAll("[data-ai-provider]").forEach((btn) => {
  btn.addEventListener("click", () => handleAiButtonClick(btn.dataset.aiProvider));
});

langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "ja" : "en";
  applyLang();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

builderStepTabs.forEach((button) => {
  button.addEventListener("click", () => goBuilderStep(button.dataset.builderStep));
});

document.querySelectorAll("[data-tab-jump]").forEach((button) => {
  button.addEventListener("click", () => setTab(button.dataset.tabJump));
});

document.querySelector("#makePromptButton").addEventListener("click", () => {
  const profile = profileInput.value.trim();
  if (!profile) {
    setStatus(statusText("profileRequired"), true);
    profileInput.focus();
    return;
  }
  promptOutput.value = makePrompt(profile);
  setStatus(statusText("promptCreated"));
});

document.querySelector("#goJsonButton").addEventListener("click", () => {
  setBuilderStep(2);
  jsonInput.focus();
});

document.querySelector("#copyPromptButton").addEventListener("click", async () => {
  if (!promptOutput.value.trim()) {
    setStatus(statusText("promptMissing"), true);
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
    setStatus(statusText("promptCopied"));
    setBuilderStep(2);
  } catch {
    promptOutput.select();
    setStatus(statusText("promptSelected"));
  }
});

document.querySelector("#loadSampleButton").addEventListener("click", () => {
  profileInput.value = sampleProfile;
  promptOutput.value = makePrompt(sampleProfile);
  jsonInput.value = JSON.stringify(sampleQuiz, null, 2);
  setBuilderStep(2);
  setStatus(statusText("sampleLoaded"));
});

document.querySelector("#clearProfileButton").addEventListener("click", () => {
  profileInput.value = "";
  promptOutput.value = "";
  setStatus("");
});

function stripCodeFences(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
}

function importQuizFromInput(targetStep = 3) {
  try {
    const quiz = normalizeQuiz(JSON.parse(stripCodeFences(jsonInput.value)));
    saveQuiz(quiz);
    quizEditorDetails.open = false;
    renderQuiz(quiz);
    setStatus(statusText("quizImported", { count: quiz.questions.length }));
    if (targetStep === 4) {
      setBuilderStep(3);
      if (confirmBeforeShare()) {
        setBuilderStep(4);
        updateShareUrlField();
      }
    } else {
      setBuilderStep(targetStep);
    }
    return true;
  } catch (error) {
    setBuilderStep(2);
    setStatus(error.message || statusText("importError"), true);
    return false;
  }
}

function goBuilderStep(step) {
  const targetStep = Number(step);
  if (targetStep > 2) {
    const activeStep = document.querySelector(".step-panel.is-active")?.dataset.stepPanel;
    if (activeStep === "2" || !currentQuiz) {
      if (!jsonInput.value.trim()) {
        setBuilderStep(2);
        setStatus(statusText("importError"), true);
        return;
      }
      importQuizFromInput(targetStep);
      return;
    }
  }
  if (targetStep === 4 && !confirmBeforeShare()) {
    setBuilderStep(3);
    return;
  }

  setBuilderStep(targetStep);
  if (targetStep === 4) updateShareUrlField();
}

jsonInput.addEventListener("input", () => {
  updateBuilderStepAvailability(Boolean(currentQuiz));
});

document.querySelector("#importQuizButton").addEventListener("click", () => {
  importQuizFromInput(3);
});

document.querySelector("#downloadQuizButton").addEventListener("click", () => {
  const source = jsonInput.value.trim() || (currentQuiz ? JSON.stringify(currentQuiz, null, 2) : "");
  if (!source) {
    setStatus(statusText("exportMissing"), true);
    return;
  }
  const blob = new Blob([source], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "whoami-quiz.json";
  link.click();
  URL.revokeObjectURL(url);
  setStatus(statusText("exportDone"));
});

async function copyShareLink() {
  if (!currentQuiz) return;
  const url = await buildShareUrl(currentQuiz);
  try {
    await navigator.clipboard.writeText(url);
    setStatus(i18n[currentLang].copiedShare);
  } catch {
    prompt("共有リンクをコピーしてください:", url);
  }
}

async function showQrCode() {
  if (!currentQuiz) return;
  const url = await buildShareUrl(currentQuiz);
  if (!window.QRCode) {
    setStatus(i18n[currentLang].qrError, true);
    return;
  }
  await QRCode.toCanvas(qrCanvas, url, { width: 260, margin: 2 });
  qrOverlay.hidden = false;
}

shareButtons.forEach((button) => {
  button.addEventListener("click", copyShareLink);
});

qrButtons.forEach((button) => {
  button.addEventListener("click", showQrCode);
});

goShareButton.addEventListener("click", () => {
  if (!currentQuiz) {
    goBuilderStep(2);
    return;
  }
  goBuilderStep(4);
});

openQuizButton.addEventListener("click", () => {
  if (!currentQuiz) return;
  setTab("quiz");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelector("#qrClose").addEventListener("click", () => {
  qrOverlay.hidden = true;
});

qrOverlay.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.hidden = true;
});

document.querySelector("#clearQuizButton").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  jsonInput.value = "";
  renderQuiz(null);
  setBuilderStep(2);
  setStatus(statusText("quizCleared"));
});

document.querySelector("#resetAnswersButton").addEventListener("click", () => {
  quizForm.reset();
  questionStack.querySelectorAll(".question-card").forEach((card) => {
    setQuestionError(card);
    card.classList.remove("is-answered", "is-editing");
    card.querySelector(".selected-answer-text").textContent = "";
    card.querySelector(".change-answer-button").hidden = true;
  });
  updateProgress(baseQuizMeta(currentQuiz), 0);
  lastAnswers = null;
});

document.querySelector("#retryButton").addEventListener("click", () => {
  quizForm.reset();
  quizForm.hidden = false;
  resultPanel.hidden = true;
  questionStack.querySelectorAll(".question-card").forEach((card) => {
    setQuestionError(card);
    card.classList.remove("is-answered", "is-editing");
    card.querySelector(".selected-answer-text").textContent = "";
    card.querySelector(".change-answer-button").hidden = true;
  });
  updateProgress(baseQuizMeta(currentQuiz), 0);
  lastAnswers = null;
  quizForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

quizForm.addEventListener("submit", showResult);

// ---- Init ----

applyLang();

(async () => {
  if (!await loadFromHash()) {
    const storedQuiz = loadStoredQuiz();
    if (storedQuiz) jsonInput.value = JSON.stringify(storedQuiz, null, 2);
    renderQuiz(storedQuiz);
    setBuilderStep(storedQuiz ? 3 : 1);
  }
})();
