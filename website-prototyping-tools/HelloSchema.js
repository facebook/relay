/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

const GREETINGS = {
  hello: 'Hello world',
};

/**
 * Objects.
 * Build up a portrait of your data universe
 * using the object type. Here, we define a
 * type of object that has a 'hello' field
 * that is of the string type.
 */
const GreetingsType = new GraphQLObjectType({
  name: 'Greetings',
  fields: () => ({
    hello: {type: GraphQLString},
  }),
});

/**
 * The schema.
 * Here we export a schema that offers one root
 * field named 'greetings', and a method to
 * resolve its data.
 *
 * To learn more about writing GraphQL schemas for Relay, visit:
 *   https://github.com/graphql/graphql-relay-js
 */
export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      greetings: {
        type: GreetingsType,
        // Here we define a resolver that returns
        // the data defined above. Were this schema
        // executing on the server side, you could
        // write a resolve method that fetches
        // live data from a database.
        resolve: () => GREETINGS,
      },
    }),
  }),
});
