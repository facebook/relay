/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {ConcreteRequest} from '../../util/RelayConcreteNode';

const {graphql} = require('../../query/GraphQLTag');
const NormalizationEngine = require('../NormalizationEngine');
const normalizeResponse = require('../normalizeResponse');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

describe('NormalizationEngine', () => {
  const ServerUserQuery = graphql`
    query NormalizationEngineTest1Query {
      me {
        id
        name
      }
    }
  `;

  function createEngine(
    query: ConcreteRequest,
    variables?: {[string]: unknown} = {},
    config?: {operationLoader?: $FlowFixMe},
  ): NormalizationEngine {
    const operation = createOperationDescriptor(query, variables);
    return new NormalizationEngine({
      normalizeResponse,
      operation: operation.request.node.operation,
      operationLoader: config?.operationLoader,
      variables: operation.request.variables,
    });
  }

  // --------------------------------------------------------------------------
  // Test 1: processResponse normalizes a raw server response
  // --------------------------------------------------------------------------
  test('processResponse normalizes a raw server response', () => {
    const engine = createEngine(ServerUserQuery);

    const result = engine.processResponse({
      data: {
        me: {
          __typename: 'User',
          id: '1',
          name: 'Zuck',
        },
      },
    });

    expect(result.payloads[0].isPreNormalized).toBe(true);
    expect(result.payloads[0].source).toBeDefined();

    // Verify the source contains flat normalized records
    const rootRecord = result.payloads[0].source.get('client:root');
    expect(rootRecord).toBeDefined();

    const userRecord = result.payloads[0].source.get('1');
    expect(userRecord).toBeDefined();
    // $FlowFixMe[prop-missing] - test internal record shape
    // $FlowFixMe[incompatible-use] - userRecord is checked above with toBeDefined
    expect(userRecord.name).toBe('Zuck');
  });

  // --------------------------------------------------------------------------
  // Test 2: processResponse sets isFinal from response extensions
  // --------------------------------------------------------------------------
  test('processResponse sets isFinal from response extensions', () => {
    const engine = createEngine(ServerUserQuery);

    const resultNotFinal = engine.processResponse({
      data: {
        me: {__typename: 'User', id: '1', name: 'Zuck'},
      },
    });
    expect(resultNotFinal.payloads[0].isFinal).toBe(false);

    const resultFinal = engine.processResponse({
      data: {
        me: {__typename: 'User', id: '1', name: 'Zuck'},
      },
      extensions: {is_final: true},
    });
    expect(resultFinal.payloads[0].isFinal).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Test 3: processResponse nullifies followupPayloads and
  //         incrementalPlaceholders
  // --------------------------------------------------------------------------
  test('processResponse nullifies consumed metadata', () => {
    const engine = createEngine(ServerUserQuery);

    const result = engine.processResponse({
      data: {
        me: {__typename: 'User', id: '1', name: 'Zuck'},
      },
    });

    // followupPayloads and incrementalPlaceholders are consumed by the
    // NormalizationEngine (for future @defer/@stream/@module handling)
    // and should be null on the output.
    expect(result.payloads[0].followupPayloads).toBeNull();
    expect(result.payloads[0].incrementalPlaceholders).toBeNull();
  });

  // --------------------------------------------------------------------------
  // Test 4: processResponse preserves errors from server response
  // --------------------------------------------------------------------------
  test('processResponse preserves errors from server response', () => {
    const engine = createEngine(ServerUserQuery);

    const result = engine.processResponse({
      data: {
        me: {__typename: 'User', id: '1', name: 'Zuck'},
      },
      errors: [
        {
          locations: [{column: 1, line: 1}],
          message: 'partial error',
          path: ['me', 'name'],
          severity: 'WARNING',
        },
      ],
    });

    expect(result.payloads[0].isPreNormalized).toBe(true);
    expect(result.payloads[0].errors).toBeDefined();
    expect(result.payloads[0].errors?.length).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // Test 5: processResponse preserves fieldPayloads from normalization
  // --------------------------------------------------------------------------
  test('processResponse preserves fieldPayloads from normalization', () => {
    const engine = createEngine(ServerUserQuery);

    const result = engine.processResponse({
      data: {
        me: {__typename: 'User', id: '1', name: 'Zuck'},
      },
    });

    // fieldPayloads should be present (may be empty array for simple queries)
    // but should NOT be null — the NormalizationEngine passes them through
    // so OperationExecutor/PublishQueue can process handle fields.
    expect(result.payloads[0].fieldPayloads).toBeDefined();
  });
});
