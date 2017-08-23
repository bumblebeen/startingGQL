
import express from 'express';
import graphqlHTTP  from 'express-graphql';
import {buildSchema} from 'graphql';

const fakeDatabase= {};

class Message {
  constructor(id, {content, author}) {
    this.id=id;
    this.content = content;
    this.author= author;
  }
}

const schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }
  type Query {
    getMessage(id: ID!): Message
    allMessages: [Message]
  }
  type Mutation {
    createMessage(zap: MessageInput): Message
    updateMessage(id: ID!, zap: MessageInput): Message
  }
`);

const rootValue = {
  allMessages: () => {
    return Object.keys(fakeDatabase).map(key => {
      return new Message(key, fakeDatabase[key]);
    });
  },
  getMessage: ({id}) =>{
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id);
    }
    return new Message(id, fakeDatabase[id]);
  },
  createMessage: ({zap}) => {
    let id = require('crypto').randomBytes(10).toString('hex');
    fakeDatabase[id] = zap;
    return new Message(id, zap)
  },
  updateMessage: ({id, zap})=> {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id ' + id);
    }
    fakeDatabase[id] = input;
    return new Message(id, input);
  }
};

function loggingMiddleware(req, res, next) {
  console.log('ip:', req.ip);
  console.log('headers:', req.headers['content-type']);
  next();
}


const app = express();

app.use('/graphql', loggingMiddleware, graphqlHTTP({
  schema,
  rootValue,
  graphiql: true
}));

app.listen(4000);
console.log('Running GQL at :4000');