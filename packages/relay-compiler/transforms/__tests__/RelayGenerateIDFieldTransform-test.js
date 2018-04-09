/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const {buildSchema, GraphQLNonNull, GraphQLID} = require('graphql');

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayParser = require('RelayParser');
const RelayTestSchema = require('RelayTestSchema');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

const {
  transform,
  buildSelectionFromFieldDefinition,
  getIDFieldDefinition,
  getNodeIDFieldDefinition,
} = require('RelayGenerateIDFieldTransform');

describe('RelayGenerateIDFieldTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/generate-id-field-transform`,
    text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      return new GraphQLCompilerContext(RelayTestSchema)
        .addAll(ast)
        .applyTransforms([transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );

  describe('buildSelectionFromFieldDefinition', () => {
    it('returns an aliased selection', () => {
      expect(
        buildSelectionFromFieldDefinition({
          name: 'id',
          type: new GraphQLNonNull(GraphQLID),
        }),
      ).toEqual({
        kind: 'ScalarField',
        alias: '__id',
        args: [],
        directives: [],
        handles: null,
        metadata: null,
        name: 'id',
        type: new GraphQLNonNull(GraphQLID),
      });
    });

    it('returns an unaliased selection when the name matches the alias', () => {
      expect(
        buildSelectionFromFieldDefinition({
          name: '__id',
          type: new GraphQLNonNull(GraphQLID),
        }),
      ).toEqual({
        kind: 'ScalarField',
        alias: null,
        args: [],
        directives: [],
        handles: null,
        metadata: null,
        name: '__id',
        type: new GraphQLNonNull(GraphQLID),
      });
    });
  });

  describe('getNodeIDFieldDefinition()', () => {
    it('returns nothing in case no Node interface exists', () => {
      const schema = buildSchema(`
        interface NotNode {
          id: ID!
        }
      `);
      expect(getNodeIDFieldDefinition(schema)).toEqual(null);
    });

    it('returns a ID field entry of the Node interface', () => {
      const schema = buildSchema(`
        interface Node {
          customNodeID: ID
        }
      `);
      expect(getNodeIDFieldDefinition(schema).name).toEqual('customNodeID');
    });

    it('returns a ID! field entry of the Node interface', () => {
      const schema = buildSchema(`
        interface Node {
          customNodeID: ID!
        }
      `);
      expect(getNodeIDFieldDefinition(schema).name).toEqual('customNodeID');
    });

    it('asserts that Node has a field of type ID(!)', () => {
      const schema = buildSchema(`
        interface Node {
          id: String
        }
      `);
      expect(() => getNodeIDFieldDefinition(schema)).toThrow();
    });

    it('asserts that Node does not have multiple fields of type ID!', () => {
      const schema = buildSchema(`
        interface Node {
          id: ID!
          customNodeID: ID!
        }
      `);
      expect(() => getNodeIDFieldDefinition(schema)).toThrow();
    });
  });

  describe('getIDFieldDefinition()', () => {
    it('always returns the inflected Node ID! field', () => {
      const schema = buildSchema(`
        interface Node {
          customNodeID: ID!
        }
        type Artwork implements Node {
          customNodeID: ID!
        }
        type Artist {
          customNodeID: ID!
        }
      `);
      expect(
        getIDFieldDefinition(schema, schema.getType('Artwork')).name,
      ).toEqual('customNodeID');
      expect(
        getIDFieldDefinition(schema, schema.getType('Artist')).name,
      ).toEqual('customNodeID');
    });

    it('returns that a type has the fallback `id` field', () => {
      const schema = buildSchema(`
        interface Node {
          customNodeID: ID!
        }
        type Artist {
          id: ID!
        }
      `);
      expect(
        getIDFieldDefinition(schema, schema.getType('Artist')).name,
      ).toEqual('id');
    });
  });
});
