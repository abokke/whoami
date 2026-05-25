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

const sampleProfile = `名前: ユウスケ
好きなこと: 新しいWebサービスのプロトタイプ作成、寿司、散歩
性格: 合理的だが、友人の相談には長く付き合う
口ぐせ: 「まず最小で試そう」
苦手: 長すぎる会議、曖昧な依頼
友人が知っている話: 旅行先で毎朝同じ喫茶店に通った
最近の関心: AIを使った自己紹介や友人向けクイズ`;

const sampleQuiz = {
  title: { en: "Do You Know Yusuke?", ja: "ユウスケ理解度チェック" },
  questions: [
    {
      question: { en: "What phrase does Yusuke say most often?", ja: "ユウスケがよく言いそうな一言は？" },
      choices: [
        { en: "Let's try the smallest version first", ja: "まず最小で試そう" },
        { en: "Let's do it all with guts",            ja: "気合いで全部やろう" },
        { en: "Think about it tomorrow",               ja: "明日考えよう" },
        { en: "Let's add more meetings",               ja: "会議を増やそう" }
      ],
      answerIndex: 0,
      explanation: { en: "He prefers prototyping from the smallest possible unit.", ja: "最小実装から検証するのが好きです。" }
    },
    {
      question: { en: "What is Yusuke most likely to dislike?", ja: "ユウスケが最も苦手なものは？" },
      choices: [
        { en: "Quick memos",  ja: "短いメモ" },
        { en: "Walking",      ja: "散歩" },
        { en: "Long meetings",ja: "長すぎる会議" },
        { en: "Sushi",        ja: "寿司" }
      ],
      answerIndex: 2,
      explanation: { en: "Long meetings and vague requests are his kryptonite.", ja: "長すぎる会議と曖昧な依頼が苦手です。" }
    },
    {
      question: { en: "What does Yusuke tend to do on trips?", ja: "旅行先でユウスケがやりがちなことは？" },
      choices: [
        { en: "Change plans every minute",          ja: "予定を毎分変える" },
        { en: "Visit the same café every morning",  ja: "毎朝同じ喫茶店に通う" },
        { en: "Stay in the hotel all day",           ja: "一日中ホテルにいる" },
        { en: "Skip meals",                          ja: "食事を抜く" }
      ],
      answerIndex: 1,
      explanation: { en: "Once he finds a place he likes, he keeps going back.", ja: "気に入った場所を繰り返し楽しむタイプです。" }
    },
    {
      question: { en: "What best describes Yusuke's current interest?", ja: "ユウスケの最近の関心に最も近いのは？" },
      choices: [
        { en: "AI tools for self-intros and friend quizzes", ja: "AIを使った自己紹介や友人向けクイズ" },
        { en: "Pottery only",                                ja: "陶芸だけ" },
        { en: "Fishing tournaments",                         ja: "釣り大会" },
        { en: "Memorizing ancient scripts",                  ja: "古代文字の暗記" }
      ],
      answerIndex: 0,
      explanation: { en: "He's been into AI tools for connecting with people.", ja: "AIを使った友人向けサービスに関心があります。" }
    },
    {
      question: { en: "How would Yusuke respond to a vague request?", ja: "曖昧な依頼を受けたとき、ユウスケが取りそうな行動は？" },
      choices: [
        { en: "Start immediately without asking",         ja: "確認せずすぐ動く" },
        { en: "Clarify the goal and scope first",         ja: "目的とスコープを先に確認する" },
        { en: "Delegate it to someone else",              ja: "誰かに任せる" },
        { en: "Ignore it and wait",                       ja: "無視して待つ" }
      ],
      answerIndex: 1,
      explanation: { en: "Vague requests are one of his biggest dislikes — clarity first.", ja: "曖昧な依頼が苦手なので、まず明確化を求めます。" }
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
Read the person memo below and create a 4-choice quiz with exactly 5 questions that captures who this person really is.

Rules:
- Make it fun and accessible for friends
- Include not just facts but also values, catchphrases, and behavior patterns
- 4 choices per question
- EVERY text field (question, each choice, explanation) must be bilingual: {"en": "...", "ja": "..."}
- title must also be bilingual: {"en": "...", "ja": "..."}
- answerIndex is 0-based integer
- Output JSON only — no markdown, no explanation outside the JSON

JSON schema:
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
    }
  ]
}

Person memo:
${profile.trim()}`;
}

// ---- URL share ----

function buildShareUrl(quiz) {
  const json = JSON.stringify(quiz);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const base = location.href.split("#")[0];
  return `${base}#q=${b64}`;
}

function loadFromHash() {
  const hash = location.hash;
  if (!hash.startsWith("#q=")) return false;
  try {
    const json = decodeURIComponent(escape(atob(hash.slice(3))));
    const quiz = normalizeQuiz(JSON.parse(json));
    saveQuiz(quiz);
    renderQuiz(quiz);
    setTab("quiz");
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
    return;
  }

  emptyState.hidden = true;
  quizForm.hidden = false;
  shareButton.disabled = false;

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
  try {
    await navigator.clipboard.writeText(promptOutput.value);
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

document.querySelector("#importQuizButton").addEventListener("click", () => {
  try {
    const quiz = normalizeQuiz(JSON.parse(jsonInput.value));
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
  const url = buildShareUrl(currentQuiz);
  try {
    await navigator.clipboard.writeText(url);
    setStatus("共有リンクをコピーしました。Discordに貼ってね！");
  } catch {
    prompt("共有リンクをコピーしてください:", url);
  }
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

if (!loadFromHash()) {
  renderQuiz(loadStoredQuiz());
}
