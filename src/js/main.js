let good = [], bad = [];
let questionIndex;
let options = {
  chapter: Object.keys(questions)[0],
  language: {
    origin: `pl`,
    translate: `en`,
    mix: false
  },
  counter: 0
};

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
const paragraphElement = document.createElement('p');

let drawRandom = (min, max) => { return Math.floor(Math.random() * (max - min + 1) + min); }

let displayQuestion = (questionIndex) => {
  const questionTmp = questions[options.chapter][questionIndex];
  question.textContent = `${questionTmp[options.language.origin]}`;
  tipE.textContent = questionTmp.tip ? `${questionTmp.tip}` : ``;
}

let chooseLang = () => {
  if(options.language.mix) if(Math.random() > .5) { options.language.origin = `pl`; options.language.translate = `en`; } else { options.language.origin = `en`; options.language.translate = `pl`; };
}

let drawQuestion = () => {
  chooseLang();

  do questionIndex = drawRandom(0, questions[options.chapter].length-1);
  while(good.includes(questionIndex));

  return questionIndex;
}

let addGoodAnswer = (index) => {
  good.push(questionIndex);
  createP(`${questions[options.chapter][index].pl} - ${questions[options.chapter][index].en}`, goodAnswers);
}

let addBadAnswer = (index) => {
  if(!bad.includes(index)) {
    bad.push(index);
    createP(`${questions[options.chapter][index].pl} - ${questions[options.chapter][index].en}`, badAnswers);
  }
}

let checkAnswer = () => {
  const userAnswer = answerE.value.trim().toLowerCase();
  const correctAnswer = questions[options.chapter][questionIndex][options.language.translate].trim().toLowerCase();
  
  if (userAnswer === correctAnswer) {
    answerE.classList.add(`correct`);
    answerE.value = ``;
    options.counter--;
    addGoodAnswer(questionIndex);
    updateCounter(mainCounter, options.counter);
    updateCounter(goodCounter, good.length);
    if(good.length != questions[options.chapter].length) displayQuestion(drawQuestion());
    else finish();
  } else answerE.classList.remove(`correct`);
}

let toggleAnswerRestart = () => {
  if(answerE.hasAttribute(`disabled`)) {
    start();
  } else {
    answerE.value = ``;
    addBadAnswer(questionIndex);
    updateCounter(badCounter, bad.length);
    displayQuestion(drawQuestion());
  }
}

let updateCounter = (counter, value) => {
  counter.textContent = value;
}

let start = () => {
  answerE.removeAttribute(`disabled`);
  answerE.value = ``;
  good = [], bad = [];
  options.counter = questions[options.chapter].length;
  removeAllP(goodAnswers);
  removeAllP(badAnswers);
  displayQuestion(drawQuestion());
  updateCounter(mainCounter, options.counter);
  updateCounter(goodCounter, 0);
  updateCounter(badCounter, 0);
}

let finish = () => {
  answerE.setAttribute(`disabled`, `disabled`);
  question.textContent = ``;
  tipE.textContent = ``;
  answerE.value = `Passed`;
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

document.addEventListener(`keypress`, (event) => {
  if(event.key === `Enter`) {
    toggleAnswerRestart(); 
  }
});
answerE.addEventListener(`keyup`, checkAnswer);
chapterRadio.forEach(input => {
  input.addEventListener(`change`, (event) => {
    options.chapter = event.target.value;
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