/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  GraphQLID,
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
  getFaction,
  getShip,
  getFactions,
  createShip,
} from './database';

/**
 * This is a basic end-to-end test, designed to demonstrate the various
 * capabilities of a Relay-compliant GraphQL server.
 *
 * It is recommended that readers of this test be familiar with
 * the end-to-end test in GraphQL.js first, as this test skips
 * over the basics covered there in favor of illustrating the
 * key aspects of the Relay spec that this test is designed to illustrate.
 *
 * We will create a GraphQL schema that describes the major
 * factions and ships in the original Star Wars trilogy.
 *
 * NOTE: This may contain spoilers for the original Star
 * Wars trilogy.
 */

/**
 * Using our shorthand to describe type systems,
 * the type system for our example will be the following:
 *
 * interface Node {
 *   id: ID!
 * }
 *
 * type Faction : Node {
 *   id: ID!
 *   name: String
 *   ships: ShipConnection
 * }
 *
 * type Ship : Node {
 *   id: ID!
 *   name: String
 * }
 *
 * type ShipConnection {
 *   edges: [ShipEdge]
 *   pageInfo: PageInfo!
 * }
 *
 * type ShipEdge {
 *   cursor: String!
 *   node: Ship
 * }
 *
 * type PageInfo {
 *   hasNextPage: Boolean!
 *   hasPreviousPage: Boolean!
 *   startCursor: String
 *   endCursor: String
 * }
 *
 * type Query {
 *   rebels: Faction
 *   empire: Faction
 *   node(id: ID!): Node
 * }
 *
 * input IntroduceShipInput {
 *   clientMutationId: string!
 *   shipName: string!
 *   factionId: ID!
 * }
 *
 * input IntroduceShipPayload {
 *   clientMutationId: string!
 *   ship: Ship
 *   faction: Faction
 * }
 *
 * type Mutation {
 *   introduceShip(input IntroduceShipInput!): IntroduceShipPayload
 * }
 */

/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve a node object to its GraphQL type.
 */
var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'Faction') {
      return getFaction(id);
    } else if (type === 'Ship') {
      return getShip(id);
    } else {
      return null;
    }
  },
  (obj) => {
    return obj.ships ? factionType : shipType;
  }
);

/**
 * We define our basic ship type.
 *
 * This implements the following type system shorthand:
 *   type Ship : Node {
 *     id: String!
 *     name: String
 *   }
 */
var shipType = new GraphQLObjectType({
  name: 'Ship',
  description: 'A ship in the Star Wars saga',
  fields: () => ({
    id: globalIdField('Ship'),
    name: {
      type: GraphQLString,
      description: 'The name of the ship.',
    },
  }),
  interfaces: [nodeInterface]
});

/**
 * We define a connection between a faction and its ships.
 *
 * connectionType implements the following type system shorthand:
 *   type ShipConnection {
 *     edges: [ShipEdge]
 *     pageInfo: PageInfo!
 *   }
 *
 * connectionType has an edges field - a list of edgeTypes that implement the
 * following type system shorthand:
 *   type ShipEdge {
 *     cursor: String!
 *     node: Ship
 *   }
 */
var {connectionType: shipConnection} =
  connectionDefinitions({name: 'Ship', nodeType: shipType});

/**
 * We define our faction type, which implements the node interface.
 *
 * This implements the following type system shorthand:
 *   type Faction : Node {
 *     id: String!
 *     name: String
 *     ships: ShipConnection
 *   }
 */
var factionType = new GraphQLObjectType({
  name: 'Faction',
  description: 'A faction in the Star Wars saga',
  fields: () => ({
    id: globalIdField('Faction'),
    name: {
      type: GraphQLString,
      description: 'The name of the faction.',
    },
    ships: {
      type: shipConnection,
      description: 'The ships used by the faction.',
      args: connectionArgs,
      resolve: (faction, args) => connectionFromArray(
        faction.ships.map((id) => getShip(id)),
        args
      ),
    }
  }),
  interfaces: [nodeInterface]
});

/**
 * This is the type that will be the root of our query,
 * and the entry point into our schema.
 *
 * This implements the following type system shorthand:
 *   type Query {
 *     factions(names: [FactionName]): [Faction]
 *     node(id: String!): Node
 *   }
 */
var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    factions: {
      type: new GraphQLList(factionType),
      args: {
        names: {
          type: new GraphQLList(GraphQLString),
        },
      },
      resolve: (root, {names}) => getFactions(names),
    },
    node: nodeField
  })
});

/**
 * This will return a GraphQLFieldConfig for our ship mutation.
 *
 * It creates these two types implicitly:
 *   input IntroduceShipInput {
 *     clientMutationId: string!
 *     shipName: string!
 *     factionId: ID!
 *   }
 *
 *   input IntroduceShipPayload {
 *     clientMutationId: string!
 *     ship: Ship
 *     faction: Faction
 *   }
 */
var shipMutation = mutationWithClientMutationId({
  name: 'IntroduceShip',
  inputFields: {
    shipName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    factionId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  outputFields: {
    ship: {
      type: shipType,
      resolve: (payload) => getShip(payload.shipId)
    },
    faction: {
      type: factionType,
      resolve: (payload) => getFaction(payload.factionId)
    }
  },
  mutateAndGetPayload: ({shipName, factionId}) => {
    var newShip = createShip(shipName, factionId);
    return {
      shipId: newShip.id,
      factionId: factionId,
    };
  }
});

/**
 * This is the type that will be the root of our mutations,
 * and the entry point into performing writes in our schema.
 *
 * This implements the following type system shorthand:
 *   type Mutation {
 *     introduceShip(input IntroduceShipInput!): IntroduceShipPayload
 *   }
 */
var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    introduceShip: shipMutation
  })
});

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export var schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});
