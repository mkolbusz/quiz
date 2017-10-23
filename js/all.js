(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _quiz = require('./quiz.js');

var QUIZ_CONTAINER = '#quiz';

var quizGame = void 0;
var intervalTimer = void 0;

$('#startQuizButton').on('click', function (event) {
    var question = quizGame.start();
    prepareQuizProgress();
    showQuestion(question);
    $('#startQuizButton').hide();
    $('#quiz').show();
});

function prepareQuizProgress() {
    $('.progress-quiz').html('');
    var progressWidth = 100.0 / quizGame.getQuestionsNumber();
    for (var i = 0; i < quizGame.getQuestionsNumber(); i++) {
        $('.progress-quiz').append('<div class="progress-bar bg-info" role="progressbar" style="width: ' + progressWidth + '%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>');
    }
}

function startTimer() {
    var element = document.querySelector('.progress-time .progress-bar');
    element.style.width = "100%";
    intervalTimer = setInterval(function (event) {
        var element = document.querySelector('.progress-time .progress-bar');
        var width = parseInt(element.style.width);
        if (width > 0) {
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
    if (width < 30) {
        timerElement.classList.remove("bg-warning");
        timerElement.classList.add("bg-danger");
    } else if (width < 60) {
        timerElement.classList.remove("bg-success");
        timerElement.classList.add("bg-warning");
    }
}

function showQuestion(q) {
    stopTimer();
    $(QUIZ_CONTAINER + ' .question .answers').html('');
    $(QUIZ_CONTAINER + ' .question .content').html(q.question);
    var i = 0;
    q.answers.forEach(function (answer) {
        $(QUIZ_CONTAINER + ' .question .answers').append('<div class="form-check"><label class="form-check-label"><input class="form-check-input answer" name="answer" type="radio" value="' + answer.isRight + '" data-index="' + i + '"> ' + answer.content + '</label></div>');
        i++;
    });
    startTimer();
}

$(QUIZ_CONTAINER + ' .question .answers').on('click', '.answer', check);

function check(event) {
    checkAnswer();
    if (!quizGame.isEnd()) {
        showQuestion(quizGame.nextQuestion());
    } else {
        $('#nextQuestionButton').hide();
        stopTimer();
        showResults();
    }
}

function checkAnswer() {
    var result = $('#quiz .question .answer:checked').val() == "true";
    var progressWidth = 100.0 / quizGame.getQuestionsNumber();
    var progressClass = result ? 'bg-success' : 'bg-danger';
    $('.progress-quiz .progress-bar').eq(quizGame.getCurrentIndex()).removeClass('bg-info').addClass(progressClass);
    updateResult(result);
}

function updateResult(result) {
    if (localStorage.getItem("result") === null) {
        var _results = [];
        localStorage.setItem("result", JSON.stringify(_results));
    }
    var results = JSON.parse(localStorage.getItem("result"));
    var item = { result: result, index: $('#quiz .question .answer:checked').data('index'), question: quizGame.getQuestion(quizGame.getCurrentIndex()) };
    results.push(item);
    localStorage.setItem("result", JSON.stringify(results));
}

$.getJSON("js/data/categories.json", function (data) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = data.categories[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var category = _step.value;

            $('#categories').append('<a href="#"><span class="badge badge-secondary" data-file="' + category.file + '">' + category.name + '</span></a>');
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    ;
});

$('#categories').on('click', 'a', function (event) {
    event.preventDefault();
    var filename = event.target.dataset.file;
    createQuizSet(filename);
});

function createQuizSet(filename) {
    var data = loadQuizSet(filename);
}

function loadQuizSet(filename) {
    if (localStorage[filename]) {
        return localStorage.getItem(filename);
    }
    var questions = null;
    $.getJSON("js/data/" + filename, function (data) {
        quizGame = new _quiz.QuizGame(data, null);
        $('#startQuizButton').show();
    }).fail(function (jqxhr, status, error) {
        console.log(status, error);
    });
};

function showResults() {
    $('#quiz').hide();
    $('#results').show();
    var points = 0;
    var results = JSON.parse(localStorage.getItem("result"));
    results.forEach(function (result) {
        var question = result.question;
        points += result.result ? 1 : 0;
        $('#results table').append('\n        <tr>\n            <td>' + question.question + '</td>\n            <td>' + quizGame.getRightAnswer(question).content + '</td>\n            <td>' + (question.answers[result.index] ? question.answers[result.index].content : 'Brak odpowiedzi') + '</td>\n            <td>' + (result.result ? 1 : 0) + '</td>\n        </tr>');
    });
    $('#results table').prepend('<tr><td colspan="3">Total points</td><td>' + points + '</td></tr>');
    localStorage.removeItem("result");
}

},{"./quiz.js":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Quiz = function () {
    function Quiz(questions) {
        _classCallCheck(this, Quiz);

        this.questions = questions;
    }

    _createClass(Quiz, [{
        key: "getQuestions",
        value: function getQuestions() {
            return this.questions;
        }
    }]);

    return Quiz;
}();

var QuizGame = function () {
    function QuizGame(quiz) {
        _classCallCheck(this, QuizGame);

        this.quiz = quiz;
        this.currentQuestionIndex = 0;
    }

    _createClass(QuizGame, [{
        key: "mixQuestionsAndAnswers",
        value: function mixQuestionsAndAnswers() {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.quiz.questions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _question = _step.value;

                    _question.answers = _.shuffle(_question.answers);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            this.quiz.questions = _.shuffle(this.quiz.questions);
        }
    }, {
        key: "start",
        value: function start() {
            this.currentQuestionIndex = 0;
            this.mixQuestionsAndAnswers();
            return this.quiz.questions[this.currentQuestionIndex];
        }
    }, {
        key: "getQuestionsNumber",
        value: function getQuestionsNumber() {
            return this.quiz.questions.length;
        }
    }, {
        key: "nextQuestion",
        value: function nextQuestion() {
            return this.quiz.questions[++this.currentQuestionIndex];
        }
    }, {
        key: "setAnswer",
        value: function setAnswer() {
            var questions = this.quiz.getQuestions();
            question[this.currentQuestionIndex];
        }
    }, {
        key: "setQuestions",
        value: function setQuestions(questions) {
            this.questions = questions;
        }
    }, {
        key: "getCurrentIndex",
        value: function getCurrentIndex() {
            return this.currentQuestionIndex;
        }
    }, {
        key: "isEnd",
        value: function isEnd() {
            return this.currentQuestionIndex == this.getQuestionsNumber() - 1;
        }
    }, {
        key: "getQuestion",
        value: function getQuestion(index) {
            if (index >= 0 && index < this.getQuestionsNumber()) {
                return this.quiz.questions[index];
            }
            return null;
        }
    }, {
        key: "getRightAnswer",
        value: function getRightAnswer(question) {
            return question.answers.filter(function (answer) {
                return answer.isRight == "true";
            })[0];
        }
    }]);

    return QuizGame;
}();

exports.Quiz = Quiz;
exports.QuizGame = QuizGame;

},{}]},{},[1]);
