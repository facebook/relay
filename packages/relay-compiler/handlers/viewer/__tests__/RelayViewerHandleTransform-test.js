/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

jest.disableAutomock();

describe('RelayViewerHandleTransform', () => {
  let RelayCompilerContext;
  let RelayPrinter;
  let RelayViewerHandleTransform;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;
  let buildASTSchema;
  let dedent;
  let parse;

  beforeEach(() => {
    jest.resetModules();

    RelayCompilerContext = require('RelayCompilerContext');
    RelayPrinter = require('RelayPrinter');
    RelayViewerHandleTransform = require('RelayViewerHandleTransform');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');
    dedent = require('dedent');
    ({buildASTSchema, parse} = require('graphql'));

    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  it('adds a handle to viewer fields', () => {
    expect('fixtures/viewer-handle-transform').toMatchGolden(text => {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      let context = new RelayCompilerContext(RelayTestSchema).addAll(
        definitions,
      );
      context = RelayViewerHandleTransform.transform(context, RelayTestSchema);
      const documents = [];
      context.documents().forEach(doc => {
        documents.push(RelayPrinter.print(doc));
      });
      return documents.join('\n');
    });
  });

  it('ignores schemas where viewer has an id', () => {
    const schema = buildASTSchema(parse(`
      type Query {
        viewer: Viewer
      }
      type Viewer {
        id: ID!
      }
    `));
    const text = `
      query TestQuery {
        viewer {
          id
        }
      }
    `;
    const {definitions} = parseGraphQLText(schema, text);
    let context = new RelayCompilerContext(schema).addAll(
      definitions,
    );
    context = RelayViewerHandleTransform.transform(context, schema);
    const TestQuery = context.getRoot('TestQuery');
    const viewer = TestQuery.selections[0];
    // No handle is added
    expect(viewer.handles).toBe(undefined);
  });
});
