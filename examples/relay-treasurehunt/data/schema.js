/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  Game,
  HidingSpot,
  checkHidingSpotForTreasure,
  getGame,
  getHidingSpot,
  getHidingSpots,
  getTurnsRemaining,
} from './database';

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'Game') {
      return getGame(id);
    } else if (type === 'HidingSpot') {
      return getHidingSpot(id);
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof Game) {
      return gameType;
    } else if (obj instanceof HidingSpot)  {
      return hidingSpotType;
    } else {
      return null;
    }
  }
);

var gameType = new GraphQLObjectType({
  name: 'Game',
  description: 'A treasure search game',
  fields: () => ({
    id: globalIdField('Game'),
    hidingSpots: {
      type: hidingSpotConnection,
      description: 'Places where treasure might be hidden',
      args: connectionArgs,
      resolve: (game, args) => connectionFromArray(getHidingSpots(), args),
    },
    turnsRemaining: {
      type: GraphQLInt,
      description: 'The number of turns a player has left to find the treasure',
      resolve: () => getTurnsRemaining(),
    },
  }),
  interfaces: [nodeInterface],
});

var hidingSpotType = new GraphQLObjectType({
  name: 'HidingSpot',
  description: 'A place where you might find treasure',
  fields: () => ({
    id: globalIdField('HidingSpot'),
    hasBeenChecked: {
      type: GraphQLBoolean,
      description: 'True this spot has already been checked for treasure',
      resolve: (hidingSpot) => hidingSpot.hasBeenChecked,
    },
    hasTreasure: {
      type: GraphQLBoolean,
      description: 'True if this hiding spot holds treasure',
      resolve: (hidingSpot) => {
        if (hidingSpot.hasBeenChecked) {
          return hidingSpot.hasTreasure;
        } else {
          return null;  // Shh... it's a secret!
        }
      },
    },
  }),
  interfaces: [nodeInterface],
});

var {connectionType: hidingSpotConnection} =
  connectionDefinitions({name: 'HidingSpot', nodeType: hidingSpotType});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    game: {
      type: gameType,
      resolve: () => getGame(),
    },
  }),
});

var CheckHidingSpotForTreasureMutation = mutationWithClientMutationId({
  name: 'CheckHidingSpotForTreasure',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    hidingSpot: {
      type: hidingSpotType,
      resolve: ({localHidingSpotId}) => getHidingSpot(localHidingSpotId),
    },
    game: {
      type: gameType,
      resolve: () => getGame(),
    },
  },
  mutateAndGetPayload: ({id}) => {
    var localHidingSpotId = fromGlobalId(id).id;
    checkHidingSpotForTreasure(localHidingSpotId);
    return {localHidingSpotId};
  },
});

var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    checkHidingSpotForTreasure: CheckHidingSpotForTreasureMutation,
  }),
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export var schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});
