import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

var GREETINGS = {
  hello: 'Hello world',
};

var GreetingsType = new GraphQLObjectType({
  name: 'Greetings',
  fields: () => ({
    hello: {type: GraphQLString},
  }),
});

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      greetings: {
        type: GreetingsType,
        resolve: () => GREETINGS,
      },
    }),
  }),
});
