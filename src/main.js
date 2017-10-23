import {QuizGame, Quiz} from './quiz.js';
const QUIZ_CONTAINER = '#quiz';

let quizGame;
let intervalTimer;

$('#startQuizButton').on('click', (event) => {
    let question = quizGame.start();
    prepareQuizProgress();
    showQuestion(question);
    $('#startQuizButton').hide();
    $('#quiz').show();
})

function prepareQuizProgress() {
    $('.progress-quiz').html('');
    let progressWidth = 100.0/quizGame.getQuestionsNumber();
    for(let i=0; i < quizGame.getQuestionsNumber(); i++) {
        $('.progress-quiz').append('<div class="progress-bar bg-info" role="progressbar" style="width: '+progressWidth+'%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>')
    }
}

function startTimer() {
    let element = document.querySelector('.progress-time .progress-bar');
    element.style.width = "100%";
    intervalTimer = setInterval((event) => {
        let element = document.querySelector('.progress-time .progress-bar');
        let width = parseInt(element.style.width);
        if(width > 0) {
            element.style.width = width - 1 + "%";
        } else {
            element.style.width = "0%";
            stopTimer();
            check();
        }
        
        changeTimerColor(width, element);
    }, 200);
}

function stopTimer() {
    clearInterval(intervalTimer);
}


function changeTimerColor(width, timerElement) {
    if(width < 30) {
        timerElement.classList.remove("bg-warning");
        timerElement.classList.add("bg-danger");
    }else if(width < 60) {
        timerElement.classList.remove("bg-success");
        timerElement.classList.add("bg-warning");
    }
}


function showQuestion(q){
    stopTimer();
    $(QUIZ_CONTAINER + ' .question .answers').html('');
    $(QUIZ_CONTAINER + ' .question .content').html(q.question);
    let i = 0;
    q.answers.forEach((answer) => {
        $(QUIZ_CONTAINER + ' .question .answers')
        .append('<div class="form-check"><label class="form-check-label"><input class="form-check-input answer" name="answer" type="radio" value="'+answer.isRight+'" data-index="'+i+'"> '+answer.content+'</label></div>');
        i++;
    });
    startTimer();
}

$(QUIZ_CONTAINER + ' .question .answers').on('click', '.answer', check);

function check(event){
    checkAnswer();
    if(!quizGame.isEnd()){
        showQuestion(quizGame.nextQuestion());
    }else {
        $('#nextQuestionButton').hide();
        stopTimer();
        showResults();
    }
}

function checkAnswer() {
    let result = $('#quiz .question .answer:checked').val() == "true";
    let progressWidth = 100.0/quizGame.getQuestionsNumber();
    let progressClass = result ? 'bg-success' : 'bg-danger';
    $('.progress-quiz .progress-bar').eq(quizGame.getCurrentIndex()).removeClass('bg-info').addClass(progressClass);
    updateResult(result);
}


function updateResult(result){
    if(localStorage.getItem("result") === null){
        let results = [];
        localStorage.setItem("result", JSON.stringify(results));
    }
    let results = JSON.parse(localStorage.getItem("result"));
    let item = {result: result, index: $('#quiz .question .answer:checked').data('index'), question: quizGame.getQuestion(quizGame.getCurrentIndex())};
    results.push(item);
    localStorage.setItem("result", JSON.stringify(results));
}



$.getJSON("js/data/categories.json", (data) => {
    for(let category of data.categories) {
        $('#categories').append('<a href="#"><span class="badge badge-secondary" data-file="'+category.file+'">'+category.name+'</span></a>')
    };
});

$('#categories').on('click', 'a', (event) => {
    event.preventDefault();
    let filename = event.target.dataset.file;
    createQuizSet(filename);
});


function createQuizSet(filename) {
    let data = loadQuizSet(filename);
}

function loadQuizSet(filename) {
    if(localStorage[filename]) {
        return localStorage.getItem(filename);
    }
    let questions = null;
    $.getJSON("js/data/" + filename, (data) => {
        quizGame = new QuizGame(data, null);
        $('#startQuizButton').show();
    }).fail((jqxhr, status, error) => {
        console.log(status, error);
    });
};

function showResults() {
    $('#quiz').hide();
    $('#results').show();
    let points = 0;
    let results = JSON.parse(localStorage.getItem("result"));
    results.forEach((result) => {
        let question = result.question;
        points += (result.result ? 1 : 0);
        $('#results table').append(`
        <tr>
            <td>${question.question}</td>
            <td>${quizGame.getRightAnswer(question).content}</td>
            <td>${question.answers[result.index] ? question.answers[result.index].content : 'Brak odpowiedzi'}</td>
            <td>${(result.result ? 1 : 0)}</td>
        </tr>`)
    });
    $('#results table').prepend(`<tr><td colspan="3">Total points</td><td>${points}</td></tr>`);
    localStorage.removeItem("result");
}