let good = [], bad = [], questions = [], questionIndex;
let options = {
  chapter: Object.keys(allQuestions)[0],
  language: {
    origin: `pl`,
    translate: `en`,
    mix: false
  },
  counter: 0
};
questions = allQuestions[options.chapter];

const question = document.getElementById(`question`);
const tip = document.getElementById(`tip`);
const answer = document.getElementById(`answer`);
const mainCounter = document.querySelector(`main .counter`);
const goodCounter = document.querySelector(`#goodCounter`);
const badCounter = document.querySelector(`#badCounter`);
const chapterRadio = document.querySelectorAll(`input[type="radio"][name="chapter"]`);
const languageRadio = document.querySelectorAll(`input[type="radio"][name="language"]`);
const goodAnswers = document.getElementById(`goodAnswers`);
const badAnswers = document.getElementById(`badAnswers`);
const menuTitle = document.getElementById(`menuTitle`);
const deleteBtn = document.getElementById(`deleteBtn`);
const paragraphElement = document.createElement(`p`);

// QUESTION AND ANSWER FUNCTIONS

let drawRandom = (min, max) => { return Math.floor(Math.random() * (max - min + 1) + min); }

let chooseLang = () => {
  if(options.language.mix) if(Math.random() > .5) { options.language.origin = `pl`; options.language.translate = `en`; } else { options.language.origin = `en`; options.language.translate = `pl`; };
}

let displayQuestion = (index) => {
  const questionTmp = questions[index];
  question.textContent = `${questionTmp[options.language.origin]}`;
  tip.textContent = questionTmp.tip ? `${questionTmp.tip}` : ``;
}

let drawQuestion = () => {
  chooseLang();

  do questionIndex = drawRandom(0, questions.length-1);
  while(good.includes(questionIndex) || bad.includes(questionIndex));

  return questionIndex;
}

let addGoodAnswer = (index) => {
  good.push(index);
  createP(`${questions[index].pl} - ${questions[index].en}`, goodAnswers);
}

let addBadAnswer = (index) => {
  if(!bad.includes(index)) {
    bad.push(index);
    createP(`${questions[index].pl} - ${questions[index].en}`, badAnswers);
  }
}

// CHECK ANSWER AND REACT

let checkAnswer = () => {
  const userAnswer = answer.value.trim().toLowerCase();
  const correctAnswer = questions[questionIndex][options.language.translate].trim().toLowerCase();
  
  if (userAnswer === correctAnswer) {
    answer.classList.add(`correct`);
    answer.value = ``;
    options.counter--;
    addGoodAnswer(questionIndex);
    deleteBad(questions[questionIndex]);
    updateCounter(mainCounter, options.counter);
    updateCounter(goodCounter, good.length);

    if(good.length + bad.length != questions.length) displayQuestion(drawQuestion());
    else finish();
  } else answer.classList.remove(`correct`);
}

let toggleBadAnswerRestart = () => {
  if(answer.hasAttribute(`disabled`)) {
    start();
    answer.focus();
  } else {
    answer.value = ``;
    options.counter--;
    addBadAnswer(questionIndex);
    saveBad(questions[questionIndex]);
    updateCounter(mainCounter, options.counter);
    updateCounter(badCounter, bad.length);
    if(good.length + bad.length != questions.length) displayQuestion(drawQuestion());
    else finish();
  }
}

let updateCounter = (counter, value) => {
  counter.textContent = value;
}

// START AND FINISH SETTINGS

let init = () => {
  options.chapter = document.querySelector(`input[type="radio"][name="chapter"]:checked`).value;
  questions = allQuestions[options.chapter];
}

let start = () => {
  answer.removeAttribute(`disabled`);
  answer.value = ``, good = [], bad = [];
  options.counter = questions.length;
  removeAllP(goodAnswers);
  removeAllP(badAnswers);
  displayQuestion(drawQuestion());
  updateCounter(mainCounter, options.counter);
  updateCounter(goodCounter, 0);
  updateCounter(badCounter, 0);
}

let finish = () => {
  answer.setAttribute(`disabled`, `disabled`);
  question.textContent = ``, tip.textContent = ``;
  if(bad.length == 0) answer.value = `Passed`;
  else answer.value = `Dobre: ${good.length}  Złe: ${bad.length}`;
}

// CREATE AND REMOVE PARAGRAPH FUNCTIONS

let createP = (content, parent) => {
  let p = document.createElement(`p`);
  p.textContent = content;
  parent.appendChild(p);
}

let removeAllP = (parent) => {
  Array.from(parent.getElementsByTagName(`p`)).forEach(p => {
    p.remove();
  });
}

// BAD ANSWERS

let loadBad = () => {
  if(localStorage.getItem(`badAnswers`) !== null) return JSON.parse(localStorage.getItem(`badAnswers`));

  return null;
}

let saveBad = (question) => {
  let oldBad = loadBad() || [];
  if(!oldBad.find(item => JSON.stringify(item) === JSON.stringify(question))) oldBad.push(question);
  localStorage.setItem(`badAnswers`, JSON.stringify(oldBad));
}

let deleteBad = (question) => {
  let oldBad = loadBad() || [];
  oldBad = oldBad.filter(item => JSON.stringify(item) !== JSON.stringify(question));
  localStorage.setItem(`badAnswers`, JSON.stringify(oldBad));
}

// EVENT LISTENERS

document.addEventListener(`keypress`, (event) => {
  if(event.key === `Enter`) toggleBadAnswerRestart();
  // For tests
  // if(event.key === `s`) console.log(JSON.parse(localStorage.getItem(`badAnswers`)));
  // if(event.key === `c`) localStorage.clear();
});

answer.addEventListener(`keyup`, checkAnswer);

deleteBtn.addEventListener(`click`, () => {
  localStorage.removeItem(`badAnswers`);
  question.textContent = `Brak pytań`, tip.textContent = ``;;
  updateCounter(mainCounter, 0);
});

chapterRadio.forEach(input => {
  input.addEventListener(`change`, (event) => {
    options.chapter = event.target.value;
    menuTitle.textContent = event.target.nextElementSibling.textContent;

    if(event.target.value === `bad` && loadBad() && loadBad().length !== 0) questions = loadBad();
    else {
      questions = [];
      question.textContent = `Brak pytań`;
      questions = allQuestions[options.chapter];
      updateCounter(mainCounter, 0);
    }
    
    start();
  });
});

languageRadio.forEach(input => {
  input.addEventListener(`change`, (event) => {
    switch(event.target.value) {
      case `pl`:
          options.language.origin = `pl`;
          options.language.translate = `en`;
          options.language.mix = false;
        break;
      case `en`:
        options.language.origin = `en`;
        options.language.translate = `pl`;
        options.language.mix = false;
        break;
      case `mix`:
          options.language.mix = true;
        break;
      default:
        options.language.origin = `pl`;
        options.language.translate = `en`;
        options.language.mix = false;
    }
    answer.value = ``;
    displayQuestion(questionIndex);
  });
});

init();
start();