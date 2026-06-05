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

const RelayNetwork = require('../../network/RelayNetwork');
const {graphql} = require('../../query/GraphQLTag');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('RelayModernEnvironment empty query handling', () => {
  let originalFlag;

  beforeEach(() => {
    originalFlag = RelayFeatureFlags.ENABLE_EMPTY_QUERY_CHECK;
    RelayFeatureFlags.ENABLE_EMPTY_QUERY_CHECK = true;
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_EMPTY_QUERY_CHECK = originalFlag;
  });

  it('isEmpty returns true for empty operations and false for non-empty', () => {
    const environment = new RelayModernEnvironment({
      network: RelayNetwork.create(() => {
        throw new Error(
          'Network requests should not be made during this test',
        );
      }),
    });

    const query = graphql`
      query RelayModernEnvironmentEmptyTestIsEmptyQuery($cond: Boolean!) {
        me @include(if: $cond) {
          id
        }
      }
    `;
    const emptyOperation = createOperationDescriptor(query, {cond: false});
    const nonEmptyOperation = createOperationDescriptor(query, {cond: true});

    expect(environment.isEmpty(emptyOperation)).toBe(true);
    expect(environment.isEmpty(nonEmptyOperation)).toBe(false);
  });

  it('skips network fetch when query is empty', () => {
    const logEvents: Array<mixed> = [];
    const environment = new RelayModernEnvironment({
      network: RelayNetwork.create(() => {
        throw new Error(
          'Network requests should not be made during this test',
        );
      }),
      log: event => {
        logEvents.push(event);
      },
    });

    const query = graphql`
      query RelayModernEnvironmentEmptyTestExecuteQuery($cond: Boolean!) {
        me @include(if: $cond) {
          id
        }
      }
    `;
    const operation = createOperationDescriptor(query, {cond: false});

    const callbacks = {
      complete: jest.fn<[], void>(),
      error: jest.fn<[Error], void>(),
      next: jest.fn<[mixed], void>(),
    };
    environment.execute({operation}).subscribe(callbacks);

    // Should emit execute.skipped log event
    expect(logEvents).toContainEqual(
      expect.objectContaining({
        name: 'execute.skipped',
        reason: 'empty',
      }),
    );

    // Observable should complete with empty data
    expect(callbacks.next).toHaveBeenCalledWith({data: {}});
    expect(callbacks.complete).toHaveBeenCalled();
    expect(callbacks.error).not.toHaveBeenCalled();
  });

  it('isEmpty respects feature flag', () => {
    const logEvents: Array<mixed> = [];
    RelayFeatureFlags.ENABLE_EMPTY_QUERY_CHECK = false;

    const environment = new RelayModernEnvironment({
      network: RelayNetwork.create(() => {
        throw new Error(
          'Network requests should not be made during this test',
        );
      }),
      log: event => {
        logEvents.push(event);
      },
    });

    const query = graphql`
      query RelayModernEnvironmentEmptyTestFeatureFlagQuery($cond: Boolean!) {
        me @include(if: $cond) {
          id
        }
      }
    `;
    const operation = createOperationDescriptor(query, {cond: false});

    // When flag is disabled, isEmpty always returns false
    expect(environment.isEmpty(operation)).toBe(false);

    // No execute.skipped logs should be emitted when checking isEmpty
    expect(
      logEvents.filter(e => (e: $FlowFixMe).name === 'execute.skipped'),
    ).toHaveLength(0);

    // When flag is enabled, isEmpty returns true for empty queries
    RelayFeatureFlags.ENABLE_EMPTY_QUERY_CHECK = true;
    expect(environment.isEmpty(operation)).toBe(true);
  });
});
