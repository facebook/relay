/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

jest.mock('warning');

const QueryBuilder = require('../QueryBuilder');
const RelayClassic_DEPRECATED = require('RelayClassic_DEPRECATED');
const RelayFragmentReference = require('../RelayFragmentReference');
const RelayMetaRoute = require('../../route/RelayMetaRoute');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayFragmentReference', () => {
  let route;

  beforeEach(() => {
    jest.resetModules();

    route = new RelayMetaRoute('');
    expect.extend(RelayTestUtils.matchers);
  });

  it('creates fragments with default variables', () => {
    const node = RelayClassic_DEPRECATED.QL`
      fragment on User {
        profilePicture(size:$size) {
          uri
        }
      }
    `;
    // equivalent to `getQuery('foo')` without variables
    const reference = new RelayFragmentReference(() => node, {
      size: 'default',
    });
    const variables = {size: 'ignored'};
    expect(reference instanceof RelayFragmentReference).toBe(true);
    // size ignored because no variables are passed into the fragment
    expect(reference.getFragment(variables)).toBe(node);
    expect(reference.getVariables(route, variables)).toEqual({
      size: 'default',
    });
  });

  it('creates fragments with a variable mapping', () => {
    const node = RelayClassic_DEPRECATED.QL`
      fragment on User {
        profilePicture(size:$size) {
          uri
        }
      }
    `;
    // equivalent to `getQuery('foo', {size: variables.outerSize})`
    const reference = new RelayFragmentReference(
      () => node,
      {
        size: 'default',
      },
      {
        size: QueryBuilder.createCallVariable('outerSize'),
      },
    );
    // no outer variable, default is used
    let variables = {};
    expect(reference.getFragment(variables)).toBe(node);
    expect(reference.getVariables(route, variables)).toEqual({
      size: 'default',
    });

    // outer variable overrides inner default
    variables = {outerSize: 'override'};
    expect(reference.getFragment(variables)).toBe(node);
    expect(reference.getVariables(route, variables)).toEqual({
      size: 'override',
    });
  });

  it('creates deferred fragment references', () => {
    const node = RelayClassic_DEPRECATED.QL`fragment on Node{id}`;
    const reference = new RelayFragmentReference(() => node, {});
    reference.defer();

    // fragment is the original node, unchanged and not deferred
    expect(reference.getFragment({})).toBe(node);
    // but the reference is marked as deferred
    expect(reference.isDeferred()).toBe(true);
  });

  it('creates fragments with if/unless conditions', () => {
    const node = RelayClassic_DEPRECATED.QL`fragment on Node{id}`;
    const reference = new RelayFragmentReference(() => node, {});
    reference.if(QueryBuilder.createCallVariable('if'));
    reference.unless(QueryBuilder.createCallVariable('unless'));

    let fragment = reference.getFragment({if: true, unless: false});
    expect(fragment).toBe(node);

    fragment = reference.getFragment({if: false, unless: false});
    expect(fragment).toBe(null);

    fragment = reference.getFragment({if: true, unless: true});
    expect(fragment).toBe(null);

    fragment = reference.getFragment({if: false, unless: true});
    expect(fragment).toBe(null);
  });

  it('processes variables using the route', () => {
    const node = RelayClassic_DEPRECATED.QL`fragment on Node{id}`;
    const prepareVariables = jest.fn();
    const reference = new RelayFragmentReference(
      () => node,
      {
        size: 'default',
      },
      {},
      prepareVariables,
    );

    const customVariables = {
      size: 'override',
      other: 'custom',
    };
    prepareVariables.mockImplementation(() => customVariables);

    const variables = {size: 'default'};
    expect(reference.getFragment(variables)).toBe(node);
    expect(reference.getVariables(route, variables)).toEqual(customVariables);
    expect(prepareVariables).toBeCalledWith({size: 'default'}, route);
  });

  it('warns if a variable is undefined', () => {
    const node = RelayClassic_DEPRECATED.QL`fragment on Node{id}`;
    const reference = new RelayFragmentReference(
      () => node,
      {},
      {
        dynamic: QueryBuilder.createCallVariable('dynamic'),
        static: undefined,
      },
    );
    const variables = {};
    expect(reference.getFragment(variables)).toBe(node);
    expect(reference.getVariables(route, variables)).toEqual({});
    expect([
      'RelayFragmentReference: Variable `%s` is undefined in fragment `%s`.',
      'static',
      node.name,
    ]).toBeWarnedNTimes(1);
    expect([
      'RelayFragmentReference: Variable `%s` is undefined in fragment `%s`.',
      'dynamic',
      node.name,
    ]).toBeWarnedNTimes(1);
  });
});
