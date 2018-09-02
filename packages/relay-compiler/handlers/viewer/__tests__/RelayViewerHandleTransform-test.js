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

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayTestSchema = require('RelayTestSchema');
const RelayViewerHandleTransform = require('RelayViewerHandleTransform');

const parseGraphQLText = require('parseGraphQLText');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');
const {buildASTSchema, parse} = require('graphql');

describe('RelayViewerHandleTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/viewer-handle-transform`,
    text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      const context = new GraphQLCompilerContext(RelayTestSchema)
        .addAll(definitions)
        .applyTransforms([RelayViewerHandleTransform.transform]);
      const documents = [];
      context.forEachDocument(doc => {
        documents.push(GraphQLIRPrinter.print(doc));
      });
      return documents.join('\n');
    },
  );

  it('ignores schemas where viewer is not an object', () => {
    const schema = buildASTSchema(
      parse(`
      type Query {
        viewer: Viewer
      }
      scalar Viewer
    `),
      {assumeValid: true},
    );
    const text = `
      query TestQuery {
        viewer
      }
    `;
    const {definitions} = parseGraphQLText(schema, text);
    const context = new GraphQLCompilerContext(schema)
      .addAll(definitions)
      .applyTransforms([RelayViewerHandleTransform.transform]);
    const TestQuery = context.getRoot('TestQuery');
    const viewer = TestQuery.selections[0];
    expect(viewer.name).toBe('viewer');
    expect(viewer.kind).toBe('ScalarField');
    // No handle is added
    expect(viewer.handles).toBe(undefined);
  });

  it('ignores schemas where viewer has an id', () => {
    const schema = buildASTSchema(
      parse(`
      type Query {
        viewer: Viewer
      }
      type Viewer {
        id: ID!
      }
    `),
      {assumeValid: true},
    );
    const text = `
      query TestQuery {
        viewer {
          id
        }
      }
    `;
    const {definitions} = parseGraphQLText(schema, text);
    const context = new GraphQLCompilerContext(schema)
      .addAll(definitions)
      .applyTransforms([RelayViewerHandleTransform.transform]);
    const TestQuery = context.getRoot('TestQuery');
    const viewer = TestQuery.selections[0];
    expect(viewer.name).toBe('viewer');
    expect(viewer.kind).toBe('LinkedField');
    // No handle is added
    expect(viewer.handles).toBe(undefined);
  });
});
