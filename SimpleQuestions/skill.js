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
            question: 'Bacon and eggs are most commonly eaten for which meal?',
            answer: 'Breakfast'
        },
        {
            question: 'What is a common side for an American fast food meal',
            answer: 'Fries'
        },
        {
            question: 'Name the fruit that Johnny Appleseed helped plant.',
            answer: 'Apple'
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
            question: 'Which sport do the Lakers play?',
            answer: 'Basketball'
        },
        {
            question: 'Which swimmer has the most Olympic gold medals in history?',
            answer: 'Michael Phelps'
        },
        {
            question: 'Which football player is nicknamed Beast Mode',
            answer: 'Marshawn Lynch'
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
            question: 'Which president is known for ping-pong diplomacy?',
            answer: 'Richard Nixon'
        },
        {
            question: 'Mahatma Gandhi was a civil rights activist from which country?',
            answer: 'India'
        },
        {
            question: 'During the American Revolution, the British army was popular nicknamed as?',
            answer: 'Red Coats'
        },
        {
            question: 'What is the name of the Candian national anthem?',
            answer: 'O Canada'
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
        this.attributes['askedCount'] = 0;
        this.attributes['correctCount'] = 0;
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

// These are the handlers for when the game is getting ready to roll a dice
// Eventually we could put a real dice sound-bite here
const rollModeHandlers = Alexa.CreateStateHandler(GAME_STATES.ROLL, {
    'RollDice': function() {
        const rollNum = getRandomInt(0, QUESTIONS.length);
        const response_rollInfo = "You rolled a " + (rollNum + 1) + " ";
        const response_categoryInfo = "The category is " + QUESTION_CATEGORIES[rollNum] + " ";
        const ind = getRandomInt(0, QUESTIONS[rollNum].length);
        this.attributes['activeQuestion'] = {
            question: QUESTIONS[rollNum][ind].question,
            answer: QUESTIONS[rollNum][ind].answer
        };
        QUESTIONS[rollNum].splice(ind, 1);
        this.attributes['askedCount'] += 1;
        const response_questionAsk = this.attributes['activeQuestion'].question;
        this.handler.state = GAME_STATES.TRIVIA;
        this.emit(':ask', response_rollInfo + response_categoryInfo + response_questionAsk, response_questionAsk);
    }
});


// This is where we handle when a user has been a given a question and needs to respond
const triviaModeHandlers = Alexa.CreateStateHandler(GAME_STATES.TRIVIA, {
    'AnswerQuestion': function() {
        const intent = this.event.request.intent;
        const answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value;
        if (answerSlotFilled) {
            // for now just cast to lowercase and do a string comparison to see if the user was correct
            const isCorrect = this.attributes['activeQuestion'].answer.toLowerCase() === intent.slots.Answer.value.toLowerCase();

            // this is just a bunch of if-branches to build the appropriate speech string
            let speech = "You answered with " + intent.slots.Answer.value;

            // custom speech for being wrong or correct
            if (isCorrect) {
                this.attributes['correctCount'] += 1;
                speech += " and that is correct";
            } else {
                speech += " and that is wrong";
            }

            // now something to mention the score
            speech += " Your score is " + this.attributes['correctCount'] + " out of " + this.attributes['askedCount'];

            // and finally check if game is over or not
            if (this.attributes['askedCount'] === 5) {
                this.handler.state = GAME_STATES.START;
                if (this.attributes['correctCount'] === this.attributes['askedCount']) {
                    // special message for someone who them all correct
                    speech += " wow you got them all correct. You are smart and handsome.";
                } else {
                    speech += " game over.";
                }
                speech += " Play another?";
                this.emit(':ask', speech);
            } else {
                // still have questions to ask. go back to roll state
                this.handler.state = GAME_STATES.ROLL;
                speech += " say roll dice for next question.";
                this.emit(':ask', speech);
            }
        } else {
            this.emit(':ask', "Please respond by starting with " + " The Answer Is");
        }
    },

    'Unhandled': function() {
        this.emit(':ask', "Please respond by starting with " + " The Answer Is");
    }
});

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startGameHandlers, rollModeHandlers, triviaModeHandlers);
    alexa.execute();
};
