class Quiz {
    constructor(questions) {
        this.questions = questions;
    }

    getQuestions() {
        return this.questions;
    }
}

class QuizGame {
    constructor(quiz) {
        this.quiz = quiz;
        this.currentQuestionIndex = 0;
    }

    mixQuestionsAndAnswers() {
        for(let question of this.quiz.questions){
            question.answers = _.shuffle(question.answers);
        }
        this.quiz.questions = _.shuffle(this.quiz.questions);
    }

    start() {
        this.currentQuestionIndex = 0;
        this.mixQuestionsAndAnswers();
        return this.quiz.questions[this.currentQuestionIndex];
    }

    getQuestionsNumber() {
        return this.quiz.questions.length;
    }

    nextQuestion() {
        return this.quiz.questions[++this.currentQuestionIndex];
    }

    setAnswer() {
        let questions = this.quiz.getQuestions();
        question[this.currentQuestionIndex]
    }

    setQuestions(questions){
        this.questions = questions;
    }

    getCurrentIndex() {
        return this.currentQuestionIndex;
    }
    isEnd() {
        return this.currentQuestionIndex == this.getQuestionsNumber()-1;
    }

    getQuestion(index) {
        if(index >= 0 && index < this.getQuestionsNumber()){
            return this.quiz.questions[index];
        }
        return null;
    }

    getRightAnswer(question) {
        return question.answers.filter((answer) => {
            return answer.isRight == "true";
        })[0];
    }
}

export {Quiz, QuizGame}