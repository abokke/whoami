const STORAGE_KEY = "whoami.quiz.v1";

const sampleProfile = `名前: ユウスケ
好きなこと: 新しいWebサービスのプロトタイプ作成、寿司、散歩
性格: 合理的だが、友人の相談には長く付き合う
口ぐせ: 「まず最小で試そう」
苦手: 長すぎる会議、曖昧な依頼
友人が知っている話: 旅行先で毎朝同じ喫茶店に通った
最近の関心: AIを使った自己紹介や友人向けクイズ`;

const sampleQuiz = {
  title: "ユウスケ理解度チェック",
  questions: [
    {
      question: "ユウスケがよく言いそうな一言は？",
      choices: ["まず最小で試そう", "気合いで全部やろう", "明日考えよう", "会議を増やそう"],
      answerIndex: 0,
      explanation: "プロトタイプ志向で、最小実装から検証するのが好きです。"
    },
    {
      question: "苦手なものとして最も近いのは？",
      choices: ["短いメモ", "散歩", "長すぎる会議", "寿司"],
      answerIndex: 2,
      explanation: "長すぎる会議と曖昧な依頼が苦手です。"
    },
    {
      question: "旅行先でやりがちなことは？",
      choices: ["予定を毎分変える", "毎朝同じ喫茶店に通う", "一日中ホテルにいる", "食事を抜く"],
      answerIndex: 1,
      explanation: "気に入った場所を繰り返し楽しむタイプです。"
    },
    {
      question: "最近の関心に最も近いものは？",
      choices: ["AIを使った自己紹介", "陶芸だけ", "釣り大会", "古代文字の暗記"],
      answerIndex: 0,
      explanation: "AIを使った自己紹介や友人向けクイズに関心があります。"
    }
  ]
};

const tabs = document.querySelectorAll("[data-tab]");
const builderView = document.querySelector("#builderView");
const quizView = document.querySelector("#quizView");
const profileInput = document.querySelector("#profileInput");
const promptOutput = document.querySelector("#promptOutput");
const jsonInput = document.querySelector("#jsonInput");
const builderStatus = document.querySelector("#builderStatus");
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

let currentQuiz = null;

function setTab(tabName) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  builderView.classList.toggle("is-active", tabName === "builder");
  quizView.classList.toggle("is-active", tabName === "quiz");
}

function makePrompt(profile) {
  return `あなたは友人向けパーソナリティクイズの編集者です。
以下の人物メモを読み、その人らしさが伝わる4択クイズを6問作ってください。

条件:
- 友人が楽しく解ける難易度にする
- 事実確認だけでなく、価値観・口ぐせ・行動パターンも設問に含める
- 選択肢は4つ
- 正解は answerIndex に0始まりの番号で入れる
- explanation は正解発表で表示できる短い補足にする
- 出力はJSONのみ。Markdownや説明文は出さない

JSONスキーマ:
{
  "title": "人物名やテーマが分かるタイトル",
  "questions": [
    {
      "question": "設問文",
      "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "answerIndex": 0,
      "explanation": "補足"
    }
  ]
}

人物メモ:
${profile.trim()}`;
}

function setStatus(message, isError = false) {
  builderStatus.textContent = message;
  builderStatus.style.color = isError ? "#b42318" : "";
}

function normalizeQuiz(rawQuiz) {
  if (!rawQuiz || typeof rawQuiz !== "object") {
    throw new Error("JSONの形式が正しくありません。");
  }

  if (typeof rawQuiz.title !== "string" || !rawQuiz.title.trim()) {
    throw new Error("title が必要です。");
  }

  if (!Array.isArray(rawQuiz.questions) || rawQuiz.questions.length === 0) {
    throw new Error("questions が必要です。");
  }

  const questions = rawQuiz.questions.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`${index + 1}問目の形式が正しくありません。`);
    }

    if (typeof item.question !== "string" || !item.question.trim()) {
      throw new Error(`${index + 1}問目の question が必要です。`);
    }

    if (!Array.isArray(item.choices) || item.choices.length !== 4) {
      throw new Error(`${index + 1}問目の choices は4件にしてください。`);
    }

    const choices = item.choices.map((choice) => String(choice).trim());
    if (choices.some((choice) => !choice)) {
      throw new Error(`${index + 1}問目の choices に空欄があります。`);
    }

    const answerIndex = Number(item.answerIndex);
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= choices.length) {
      throw new Error(`${index + 1}問目の answerIndex が範囲外です。`);
    }

    return {
      question: item.question.trim(),
      choices,
      answerIndex,
      explanation: typeof item.explanation === "string" ? item.explanation.trim() : ""
    };
  });

  return {
    title: rawQuiz.title.trim(),
    questions
  };
}

function saveQuiz(quiz) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quiz));
}

function loadStoredQuiz() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return normalizeQuiz(JSON.parse(stored));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function renderQuiz(quiz) {
  currentQuiz = quiz;
  quizTitle.textContent = quiz ? quiz.title : "未読み込み";
  quizMeta.textContent = quiz ? `${quiz.questions.length}問` : "0問";
  scoreMeterFill.style.width = "0%";
  questionStack.innerHTML = "";
  resultPanel.hidden = true;

  if (!quiz) {
    emptyState.hidden = false;
    quizForm.hidden = true;
    return;
  }

  emptyState.hidden = true;
  quizForm.hidden = false;

  quiz.questions.forEach((item, questionIndex) => {
    const card = document.createElement("section");
    card.className = "question-card";

    const kicker = document.createElement("div");
    kicker.className = "question-kicker";
    kicker.textContent = `Q${questionIndex + 1}`;

    const question = document.createElement("p");
    question.className = "question-text";
    question.textContent = item.question;

    const choices = document.createElement("div");
    choices.className = "choices";

    item.choices.forEach((choiceText, choiceIndex) => {
      const label = document.createElement("label");
      label.className = "choice";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${questionIndex}`;
      input.value = String(choiceIndex);
      input.required = true;

      const text = document.createElement("span");
      text.textContent = choiceText;

      label.append(input, text);
      choices.append(label);
    });

    card.append(kicker, question, choices);
    questionStack.append(card);
  });
}

function getResultMessage(score, total) {
  const ratio = total === 0 ? 0 : score / total;

  if (ratio === 1) {
    return {
      title: "完璧！あなたはストーカーですか？",
      message: "全問正解です。本人の口ぐせや行動パターンまでかなり把握しています。"
    };
  }

  if (ratio >= 0.75) {
    return {
      title: "かなり分かってる",
      message: "近い距離で見ている人の正解率です。あと少しで本人公認レベル。"
    };
  }

  if (ratio >= 0.45) {
    return {
      title: "友人として順調",
      message: "知っている部分と意外な部分が混ざっています。次に会ったら答え合わせできます。"
    };
  }

  if (ratio > 0) {
    return {
      title: "まだ伸びしろあり",
      message: "第一印象や雰囲気だけでは難しい問題が多かったようです。"
    };
  }

  return {
    title: "はじめまして級",
    message: "ここから知っていけば大丈夫です。まずは好きなものから聞いてみましょう。"
  };
}

function showResult(event) {
  event.preventDefault();
  if (!currentQuiz) {
    return;
  }

  const answers = currentQuiz.questions.map((_, index) => {
    const selected = quizForm.querySelector(`input[name="question-${index}"]:checked`);
    return selected ? Number(selected.value) : -1;
  });

  if (answers.some((answer) => answer === -1)) {
    quizForm.reportValidity();
    return;
  }

  const score = answers.reduce((sum, answer, index) => {
    return sum + (answer === currentQuiz.questions[index].answerIndex ? 1 : 0);
  }, 0);

  const total = currentQuiz.questions.length;
  const result = getResultMessage(score, total);
  resultTitle.textContent = result.title;
  resultMessage.textContent = `${score}/${total}問正解。${result.message}`;
  quizMeta.textContent = `${score}/${total}問正解`;
  scoreMeterFill.style.width = `${Math.round((score / total) * 100)}%`;
  resultDetail.innerHTML = "";

  currentQuiz.questions.forEach((item, index) => {
    const row = document.createElement("div");
    const isCorrect = answers[index] === item.answerIndex;
    row.className = `answer-row ${isCorrect ? "is-correct" : "is-wrong"}`;
    const selectedChoice = item.choices[answers[index]];
    const correctChoice = item.choices[item.answerIndex];
    row.textContent = isCorrect
      ? `Q${index + 1}: 正解 ${correctChoice}`
      : `Q${index + 1}: ${selectedChoice} → 正解 ${correctChoice}`;

    if (item.explanation) {
      row.textContent += ` / ${item.explanation}`;
    }

    resultDetail.append(row);
  });

  quizForm.hidden = true;
  resultPanel.hidden = false;
  resultTitle.scrollIntoView({ behavior: "smooth", block: "start" });
}

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

document.querySelector("#clearQuizButton").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  jsonInput.value = "";
  renderQuiz(null);
  setStatus("クイズを消去しました。");
});

document.querySelector("#resetAnswersButton").addEventListener("click", () => {
  quizForm.reset();
  scoreMeterFill.style.width = "0%";
  quizMeta.textContent = currentQuiz ? `${currentQuiz.questions.length}問` : "0問";
});

document.querySelector("#retryButton").addEventListener("click", () => {
  quizForm.reset();
  quizForm.hidden = false;
  resultPanel.hidden = true;
  scoreMeterFill.style.width = "0%";
  quizMeta.textContent = currentQuiz ? `${currentQuiz.questions.length}問` : "0問";
  quizForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

quizForm.addEventListener("submit", showResult);

const storedQuiz = loadStoredQuiz();
if (storedQuiz) {
  currentQuiz = storedQuiz;
  jsonInput.value = JSON.stringify(storedQuiz, null, 2);
  renderQuiz(storedQuiz);
} else {
  renderQuiz(null);
}
