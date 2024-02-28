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
const tipE = document.getElementById(`tip`);
const answerE = document.getElementById(`answer`);
const mainCounter = document.querySelector(`main .counter`);
const goodCounter = document.querySelector(`#goodAnswers .counter`);
const badCounter = document.querySelector(`#badAnswers .counter`);
const chapterRadio = document.querySelectorAll(`input[type="radio"][name="chapter"]`);
const languageRadio = document.querySelectorAll(`input[type="radio"][name="language"]`);
const goodAnswers = document.getElementById('goodAnswers');
const badAnswers = document.getElementById('badAnswers');
const menuTitle = document.getElementById('menuTitle');
const paragraphElement = document.createElement('p');

let drawRandom = (min, max) => { return Math.floor(Math.random() * (max - min + 1) + min); }

let displayQuestion = (index) => {
  const questionTmp = questions[index];
  question.textContent = `${questionTmp[options.language.origin]}`;
  tipE.textContent = questionTmp.tip ? `${questionTmp.tip}` : ``;
}

let chooseLang = () => {
  if(options.language.mix) if(Math.random() > .5) { options.language.origin = `pl`; options.language.translate = `en`; } else { options.language.origin = `en`; options.language.translate = `pl`; };
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

let checkAnswer = () => {
  const userAnswer = answerE.value.trim().toLowerCase();
  const correctAnswer = questions[questionIndex][options.language.translate].trim().toLowerCase();
  
  if (userAnswer === correctAnswer) {
    answerE.classList.add(`correct`);
    answerE.value = ``;
    options.counter--;
    addGoodAnswer(questionIndex);
    deleteBad(questions[questionIndex]);
    updateCounter(mainCounter, options.counter);
    updateCounter(goodCounter, good.length);

    if(good.length + bad.length != questions.length) displayQuestion(drawQuestion());
    else finish();
  } else answerE.classList.remove(`correct`);
}

let toggleBadAnswerRestart = () => {
  if(answerE.hasAttribute(`disabled`)) {
    start();
  } else {
    answerE.value = ``;
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

let start = () => {
  answerE.removeAttribute(`disabled`);
  answerE.value = ``, good = [], bad = [];
  options.counter = questions.length;
  removeAllP(goodAnswers);
  removeAllP(badAnswers);
  displayQuestion(drawQuestion());
  updateCounter(mainCounter, options.counter);
  updateCounter(goodCounter, 0);
  updateCounter(badCounter, 0);
}

let finish = () => {
  answerE.setAttribute(`disabled`, `disabled`);
  question.textContent = ``, tipE.textContent = ``;
  if(bad.length == 0) answerE.value = `Passed`;
  else answerE.value = `Dobre: ${good.length}  Złe: ${bad.length}`;
}

let createP = (content, parent) => {
  let p = document.createElement('p');
  p.textContent = content;
  parent.appendChild(p);
}

let removeAllP = (parent) => {
  Array.from(parent.getElementsByTagName('p')).forEach(p => {
    p.remove();
  });
}

let loadBad = () => {
  if(localStorage.getItem('badAnswers') !== null) return JSON.parse(localStorage.getItem('badAnswers'));

  return null;
}

let saveBad = (question) => {
  //Load bad questions
  let oldBad = loadBad() || [];
    
  //Check is question saved already, if not add
  if(!oldBad.find(item => JSON.stringify(item) === JSON.stringify(question))) oldBad.push(question);

  //Save in storage
  localStorage.setItem('badAnswers', JSON.stringify(oldBad));
}

let deleteBad = (question) => {
  //Load bad questions
  let oldBad = loadBad() || [];

  //Delete question
  oldBad = oldBad.filter(item => JSON.stringify(item) !== JSON.stringify(question));

  //Save in storage
  localStorage.setItem('badAnswers', JSON.stringify(oldBad));
}

document.addEventListener(`keypress`, (event) => {
  if(event.key === `Enter`) toggleBadAnswerRestart();
  // if(event.key === `s`) console.log(JSON.parse(localStorage.getItem("badAnswers")));
  // if(event.key === `c`) localStorage.clear();
});

answerE.addEventListener(`keyup`, checkAnswer);
chapterRadio.forEach(input => {
  input.addEventListener(`change`, (event) => {
    options.chapter = event.target.value;
    menuTitle.textContent = event.target.nextElementSibling.textContent;

    if(event.target.value === `bad` && loadBad().length !== 0) questions = loadBad();
    else {
      questions = [];
      question.textContent = `Brak pytań`;
      questions = allQuestions[options.chapter];
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
        break;
      case `en`:
        options.language.origin = `en`;
        options.language.translate = `pl`;
        break;
      case `mix`:
          options.language.mix = true;
        break;
      default:
        options.language.origin = `pl`;
        options.language.translate = `en`;
    }
    answerE.value = ``;
    displayQuestion(questionIndex);
  });
});

start();