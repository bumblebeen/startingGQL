
import express from 'express';
import graphqlHTTP  from 'express-graphql';
import {buildSchema} from 'graphql';

const fakeDatabase = {
  'a': {
    id: 'a',
    name: 'alice',
  },
  'b': {
    id: 'b',
    name: 'bob',
  },
};

// Define the User type
const userType = new graphql.GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString },
  }
});

// Define the Query type
const queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: userType,
      // `args` describes the arguments that the `user` query accepts
      args: {
        id: { type: graphql.GraphQLString }
      },
      resolve: function (_, {id}) {
        return fakeDatabase[id];
      }
    }
  }
});

const schema = new graphql.GraphQLSchema({query: queryType});


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