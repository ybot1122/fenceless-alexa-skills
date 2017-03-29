'use strict';

const Alexa = require('alexa-sdk');

const GAME_STATES = {
    TRIVIA: '_TRIVIAMODE', // Asking trivia questions.
    ROLL: '_ROLLMODE', // rolling dice
    START: '_STARTMODE', // Entry point, start the game.
    HELP: '_HELPMODE', // The user is asking for help.
    END: '_ENDMODE' // games over user can either replay or quit
};

const QUESTION_CATEGORIES = {
    0: 'FOOD',
    1: 'SPORTS',
    2: 'HISTORY'
}

const QUESTIONS = [
    [
        {
            question: 'What kind of food is usually raw fish and rice.',
            answer: 'Sushi'
        },
        {
            question: 'Complete the sentence. Macaroni and',
            answer: 'Cheese'
        }
    ],
    [
        {
            question: 'What is the name of Seattle\'s football team',
            answer: 'Seahawks'
        },
        {
            question: 'What is the mascot of the University of Washington',
            answer: 'Husky'
        }        
    ],
    [
        {
            question: 'Which year was Barack Obama first elected president',
            answer: '2008'
        },
        {
            question: 'Which city in China held the summer olympics',
            answer: 'Beijing'
        }
    ]
]

const newSessionHandlers = {
     // This will short-cut any incoming intent or launch requests and route them to this handler.
    'NewSession': function() {
        this.handler.state = GAME_STATES.START;
        this.emit(':ask', 'Welcome Would you like to play?', 'Say yes to start the game or no to quit.');
    }
};

const startGameHandlers = Alexa.CreateStateHandler(GAME_STATES.START, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },

    // TODO
    'AMAZON.HelpIntent': function() {
        var message = 'I need to implement help';
        this.emit(':ask', message, message);
    },

    'AMAZON.YesIntent': function() {
        this.handler.state = GAME_STATES.ROLL;
        this.emit(':ask', 'Great! ' + 'Say Roll Dice to begin', 'Say Roll Dice');
    },

    'AMAZON.NoIntent': function() {
        this.emit(':tell', 'Ok, see you next time!');
    },

    'Unhandled': function() {
        var message = 'Say yes to continue, or no to end the game.';
        this.emit(':ask', message, message);
    }
});
// The value is >= to min or < max
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const rollModeHandlers = Alexa.CreateStateHandler(GAME_STATES.ROLL, {
    'RollDice': function() {
        const rollNum = getRandomInt(0, 3);
        const response_rollInfo = "You rolled a " + rollNum + " ";
        const response_categoryInfo = "The category is " + QUESTION_CATEGORIES[rollNum] + " ";
        this.attributes['activeQuestion'] = QUESTIONS[rollNum][getRandomInt(0, QUESTIONS[rollNum].length)];
        const response_questionAsk = this.attributes['activeQuestion'].question;
        this.handler.state = GAME_STATES.TRIVIA;
        this.emit(':ask', response_rollInfo + response_categoryInfo + response_questionAsk, response_questionAsk);
    }
});

const triviaModeHandlers = Alexa.CreateStateHandler(GAME_STATES.TRIVIA, {
    'AnswerQuestion': function() {
        const intent = this.event.request.intent;
        const answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value;
        if (answerSlotFilled) {
            const isCorrect = (this.attributes['activeQuestion'].answer.toLowerCase() === intent.slots.Answer.value.toLowerCase())
                ? ' and that is correct'
                : ' and that is wrong';
            this.handler.state = GAME_STATES.START;
            this.emit(':ask', "You answered with " + intent.slots.Answer.value + isCorrect + " Would you like to play another");
        } else {
            this.emit(':ask', "Please respond by starting with " + " The Answer Is");
        }
    },

    'Unhandled': function() {
        this.emit(':tell', 'could not handle the pressure. self destructing now.');
    }
});

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startGameHandlers, rollModeHandlers, triviaModeHandlers);
    alexa.execute();
};
