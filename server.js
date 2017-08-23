
import express from 'express';
import graphqlHTTP  from 'express-graphql';
import {buildSchema} from 'graphql';


class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({numRolls}) {
    var output = [];
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}

const schema = buildSchema(`
  type Query {
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
    rollDice(numDice: Int!, numSides: Int): [Int]
    getDie(numSides:Int): RandomDie
  }
  type RandomDie {
    numSides: Int
    rollOnce: Int
    roll(numRolls: Int!): [Int]
  }
`);

const rootValue = {
  getDie: ({numSides}) => {
    return new RandomDie(numSides || 6  );
  },
  quoteOfTheDay: (root, {headers}, whatevs) => {
    return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
  },
  random: () => {
    return Math.random();
  },
  rollThreeDice: () => {
    return [1,2,3].map(_ => 1+  Math.floor(Math.random() * 6))
  },
  rollDice: ({numDice, numSides}) => {
    var output = [];
    for (var i = 0; i < numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (numSides || 6)));
    }
    return output;
  }
};


const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue,
  graphiql: true
}));

app.listen(4000);
console.log('Running GQL at :4000');