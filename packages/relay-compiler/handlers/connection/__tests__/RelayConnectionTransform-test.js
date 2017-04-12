/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

require('configureForRelayOSS');

jest.disableAutomock();

describe('RelayConnectionTransform', () => {
  let RelayCompilerContext;
  let RelayConnectionTransform;
  let RelayPrinter;
  let RelayTestSchema;
  let getGoldenMatchers;
  let parseGraphQLText;

  beforeEach(() => {
    jest.resetModules();

    RelayCompilerContext = require('RelayCompilerContext');
    RelayConnectionTransform = require('RelayConnectionTransform');
    RelayPrinter = require('RelayPrinter');
    RelayTestSchema = require('RelayTestSchema');
    getGoldenMatchers = require('getGoldenMatchers');
    parseGraphQLText = require('parseGraphQLText');

    jasmine.addMatchers(getGoldenMatchers(__filename));
  });

  function transformerWithOptions(options) {
    const prettyStringify = require('prettyStringify');

    return text => {
      try {
        const schema = RelayConnectionTransform.transformSchema(
          RelayTestSchema,
        );
        const {definitions} = parseGraphQLText(schema, text);
        let context = new RelayCompilerContext(schema).addAll(definitions);
        context = RelayConnectionTransform.transform(context, options);
        return context
          .documents()
          .map(
            doc =>
              RelayPrinter.print(doc) +
              '# Metadata:\n' +
              prettyStringify(doc.metadata),
          )
          .join('\n');
      } catch (error) {
        return error.message;
      }
    };
  }

  it('transforms @connection fields', () => {
    expect('fixtures/connection-transform').toMatchGolden(
      transformerWithOptions(),
    );
  });

  it('transforms @connection fields with requisite fields', () => {
    expect(
      'fixtures/connection-transform-generate-requisite-fields',
    ).toMatchGolden(
      transformerWithOptions({
        generateRequisiteFields: true,
      }),
    );
  });
});
