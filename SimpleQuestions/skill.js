'use strict';

const Alexa = require('alexa-sdk');

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
            question: 'What is the name of the Canadian national anthem?',
            answer: 'Oh Canada'
        }
    ]
]

const GAME_STATES = {
    START: '_START', // Entry point, start the game.
    ASSIGNMENT: '_ASSIGNMENT',
    ROUNDONE: '_ROUNDONE',
    ROUNDTWO: '_ROUNDTWO',
    END: '_END'
};

const startGameHandlers = Alexa.CreateStateHandler(GAME_STATES.START, {
    'NewSession': function () {
        this.emit('NewSession');
    },

    // TODO
    'AMAZON.HelpIntent': function() {
        var message = 'I need to implement help';
        this.emit(':ask', message, message);
    },

    'AMAZON.YesIntent': function() {
        this.handler.state = GAME_STATES.ASSIGNMENT;
        this.emit(':ask', 'This is a story. Yadadadadadaadadad Blahblahblahblahblah. Is player one ready?', 'Is player one ready?');
    },

    'AMAZON.NoIntent': function() {
        this.emit(':tell', 'Ok, see you next time!');
    },

    'Unhandled': function() {
        var message = 'Say yes to continue, or no to quit.';
        this.emit(':ask', message, message);
    }
});

// HELPER FUNCTION
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// HELPER FUNCTION
function getQuestion() {
    const rollNum = getRandomInt(0, QUESTIONS.length);

    const ind = getRandomInt(0, QUESTIONS[rollNum].length);

    return {
        question: QUESTIONS[rollNum][ind].question,
        answer: QUESTIONS[rollNum][ind].answer
    };
}

const assignmentHandlers = Alexa.CreateStateHandler(GAME_STATES.ASSIGNMENT, {
    'AMAZON.YesIntent': function() {
        if (!this.attributes['playerone']) {
            this.attributes['playerone'] = {
                score: 2
            };
            this.emit(':ask', 'Nice to meet you, player one. Is player two ready?', 'Is player two ready?');
        } else {
            this.handler.state = GAME_STATES.ROUNDONE;
            this.attributes['playertwo'] = {
                score: 2
            };
            this.attributes['currentPlayer'] = 'playerone';
            this.attributes['selectedAction'] = null;
            this.attributes['activeQuestion'] = getQuestion();
            this.attributes['roundsCompleted'] = 0;
            this.emit(':ask', 'Both players confirmed. Get ready for round one! In the first round you can attack. Player one is up first.', 'Player one, you can attack');
        }
    },

    'AMAZON.NoIntent': function() {
        this.emit(':tell', 'Ok, see you next time!');
    },

    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'Bye');
    },

    'Unhandled': function() {
        if (!this.attributes['playerone']) {
            this.emit(':ask', 'player one, are you ready?');
        } else {
            this.emit(':ask', 'player two, are you ready?');
        }
    }
});

const roundOneHandlers = Alexa.CreateStateHandler(GAME_STATES.ROUNDONE, {

    'AnswerQuestion': function() {
        if (this.attributes['selectedAction']) {
            this.emit('AnswerQuestion');
        } else {
            this.emit(':ask', 'You can attack');
        }
    },

    'AttackIntent': function() {
        const player = (this.attributes['currentPlayer'] === 'playerone') ? 'player one' : 'player two';
        const enemy = (this.attributes['currentPlayer'] === 'playerone') ? 'player two' : 'player one';
        const response_questionAsk = this.attributes['activeQuestion'].question;

        if (this.attributes['selectedAction']) {
            this.emit(':ask', player + ', ' + response_questionAsk, player + ', ' + response_questionAsk);
            return;
        }

        this.attributes['selectedAction'] = 'attack';

        this.emit(':ask', player + ' wants to attack ' + enemy + '. ' + player + ', ' + response_questionAsk,  player + ', ' + response_questionAsk);
    },


    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'Bye');
    },

    'Unhandled': function() {
        const player = (this.attributes['currentPlayer'] === 'playerone') ? 'player one' : 'player two';
        const response_questionAsk = this.attributes['activeQuestion'].question;

        if (!this.attributes['selectedAction']) {
            this.emit(':ask', 'Hey ' + player + ', you can attack', 'Hey ' + player + ', you can attack');
        } else {
            this.emit(':ask', player + ', ' + response_questionAsk, player + ', ' + response_questionAsk, player + ', ' + response_questionAsk, player + ', ' + response_questionAsk);
        }
    }

});

const roundTwoHandlers = Alexa.CreateStateHandler(GAME_STATES.ROUNDTWO, {
    'AnswerQuestion': function() {
        if (this.attributes['selectedAction']) {
            this.emit('AnswerQuestion');
        } else {
            this.emit(':ask', 'You can attack or defend');
        }
    },

    'AttackIntent': function() {
        const player = (this.attributes['currentPlayer'] === 'playerone') ? 'player one' : 'player two';
        const enemy = (this.attributes['currentPlayer'] === 'playerone') ? 'player two' : 'player one';
        const response_questionAsk = this.attributes['activeQuestion'].question;

        if (this.attributes['selectedAction']) {
            this.emit(':ask', player + ', ' + response_questionAsk, player + ', ' + response_questionAsk);
            return;
        }

        this.attributes['selectedAction'] = 'attack';

        this.emit(':ask', player + ' wants to attack ' + enemy + '. ' + player + ', ' + response_questionAsk,  player + ', ' + response_questionAsk);
    },

    'DefendIntent': function() {
        const player = (this.attributes['currentPlayer'] === 'playerone') ? 'player one' : 'player two';
        const enemy = (this.attributes['currentPlayer'] === 'playerone') ? 'player two' : 'player one';
        const response_questionAsk = this.attributes['activeQuestion'].question;

        if (this.attributes['selectedAction']) {
            this.emit(':ask', player + ', ' + response_questionAsk, player + ', ' + response_questionAsk);
            return;
        }

        this.attributes['selectedAction'] = 'defend';

        this.emit(':ask', player + ' wants to defend. ' + player + ', ' + response_questionAsk,  player + ', ' + response_questionAsk);
    },


    'AMAZON.StopIntent': function() {
        this.emit(':tell', 'Bye');
    },

    'Unhandled': function() {
        const player = (this.attributes['currentPlayer'] === 'playerone') ? 'player one' : 'player two';
        const response_questionAsk = this.attributes['activeQuestion'].question;

        if (!this.attributes['selectedAction']) {
            this.emit(':ask', 'Hey ' + player + ', you can attack or defend', 'Hey ' + player + ', you can attack or defend');
        } else {
            this.emit(':ask', player + ', ' + response_questionAsk, player + ', ' + response_questionAsk, player + ', ' + response_questionAsk, player + ', ' + response_questionAsk);
        }
    }
});

const globalHandlers = {
     // This will short-cut any incoming intent or launch requests and route them to this handler.
    'NewSession': function() {
        this.handler.state = GAME_STATES.START;
        this.emit(':ask', 'Welcome Would you like to play?', 'Say yes to start the game or no to quit.');
    },

    'AnswerQuestion': function() {
        if (!this.attributes['activeQuestion'] || !this.attributes['selectedAction']) {
            this.emit(':tell', 'somehow you entered an invalid game state. please inform the developer.');
            return;
        }

        const intent = this.event.request.intent;
        const answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value;
        if (answerSlotFilled) {
            const player = (this.attributes['currentPlayer'] === 'playerone') ? 'player one' : 'player two';
            const enemy = (this.attributes['currentPlayer'] === 'playerone') ? 'player two' : 'player one';
            const otherPlayer = (this.attributes['currentPlayer'] === 'playerone') ? 'playertwo' : 'playerone';
            // for now just cast to lowercase and do a string comparison to see if the user was correct
            const isCorrect = this.attributes['activeQuestion'].answer.toLowerCase() === intent.slots.Answer.value.toLowerCase();

            // this is just a bunch of if-branches to build the appropriate speech string
            let speech = "You answered with " + intent.slots.Answer.value;

            // custom speech for being wrong or correct
            if (isCorrect) {
                this.attributes['correctCount'] += 1;
                speech += ", and that is correct. ";
            } else {
                speech += ", and that is wrong. ";
            }

            if (isCorrect) {
                if (this.attributes['selectedAction'] === 'attack') {
                    speech += player + " successfully dealt one damage to " + enemy + ". ";
                    this.attributes[otherPlayer].score -= 1;
                } else if (this.attributes['selectedAction'] === 'defend') {
                    this.attributes[this.attributes['currentPlayer']].score += 1;
                    speech += player + " successfully defended and increased their health by 1. ";
                }
            } else {
                if (this.attributes['selectedAction'] === 'attack') {
                    speech += player + " failed to do damage to " + enemy + ". ";
                } else if (this.attributes['selectedAction'] === 'defend') {
                    speech += player + " failed to defend themselves. ";
                }
            }

            // check if game is over or not
            if (this.attributes['playerone'].score <= 0) {
                this.handler.state = GAME_STATES.START;
                speech += " Player one died. Good game. You win, player two. Play another?";
                this.attributes['playerone'] = null;
                this.attributes['playertwo'] = null;
                this.emit(':ask', speech);
                return;
            } else if (this.attributes['playertwo'].score <= 0) {
                this.handler.state = GAME_STATES.START;
                speech += " Player two died. Good game. You win, player one. Play another?";
                this.attributes['playerone'] = null;
                this.attributes['playertwo'] = null;
                this.emit(':ask', speech);
                return;
            }

            // now something to mention the score
            speech += " " + player + " score is " + this.attributes[this.attributes['currentPlayer']].score + ". " + enemy + " score is " + this.attributes[otherPlayer].score;

            if (this.attributes['currentPlayer'] === 'playertwo') {
                this.attributes['roundsCompleted'] += 1;
            }

            this.attributes['currentPlayer'] = otherPlayer;
            this.attributes['selectedAction'] = null;
            this.attributes['activeQuestion'] = getQuestion();

            if (this.attributes['roundsCompleted'] === 3) {
                this.handler.state = GAME_STATES.ROUNDTWO;
                speech += ". It is time for round two. In this round you can attack or defend. ";
                speech += ". " + enemy + " it is your turn now.";
                this.emit(':ask', speech, "It is time for round two. In this round you can attack or defend.");
                return;
            }

            speech += ". " + enemy + " it is your turn now.";

            this.emit(':ask', speech, enemy + " it is your turn now.");
        } else {
            this.emit(':ask', "Please respond by starting with " + " The Answer Is");
        }
    }
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(globalHandlers, startGameHandlers, assignmentHandlers, roundOneHandlers, roundTwoHandlers);
    alexa.execute();
};
