/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

jest.mock('warning');

var GraphQL = require('GraphQL');
var Relay = require('Relay');
var RelayFragmentReference = require('RelayFragmentReference');
var RelayMetaRoute = require('RelayMetaRoute');

describe('RelayFragmentReference', () => {
  var route;

  beforeEach(() => {
    jest.resetModuleRegistry();

    route = new RelayMetaRoute('');
    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('creates fragments with default variables', () => {
    var node = Relay.QL`
      fragment on User {
        profilePicture(size:$size) {
          uri,
        },
      }
    `;
    // equivalent to `getQuery('foo')` without variables
    var reference = new RelayFragmentReference(
      () => node,
      {
        size: 'default',
      }
    );
    var variables = {size: 'ignored'};
    expect(reference instanceof RelayFragmentReference).toBe(true);
    // size ignored because no variables are passed into the fragment
    expect(reference.getFragment(variables)).toBe(node);
    expect(reference.getVariables(route, variables)).toEqual({
      size: 'default',
    });
  });

  it('creates fragments with a variable mapping', () => {
    var node = Relay.QL`
      fragment on User {
        profilePicture(size:$size) {
          uri,
        },
      }
    `;
    // equivalent to `getQuery('foo', {size: variables.outerSize})`
    var reference = new RelayFragmentReference(
      () => node,
      {
        size: 'default',
      },
      {
        size: new GraphQL.CallVariable('outerSize'),
      }
    );
    // no outer variable, default is used
    var variables = {};
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
    var node = Relay.QL`fragment on Node{id}`;
    var reference = new RelayFragmentReference(() => node, {});
    reference.defer();

    // fragment is the original node, unchanged and not deferred
    expect(reference.getFragment({})).toBe(node);
    // but the reference is marked as deferred
    expect(reference.isDeferred()).toBe(true);
  });

  it('creates fragments with if/unless conditions', () => {
    var node = Relay.QL`fragment on Node{id}`;
    var reference = new RelayFragmentReference(() => node, {});
    reference.if(new GraphQL.CallVariable('if'));
    reference.unless(new GraphQL.CallVariable('unless'));

    var fragment = reference.getFragment({if: true, unless: false});
    expect(fragment).toBe(node);

    fragment = reference.getFragment({if: false, unless: false});
    expect(fragment).toBe(null);

    fragment = reference.getFragment({if: true, unless: true});
    expect(fragment).toBe(null);

    fragment = reference.getFragment({if: false, unless: true});
    expect(fragment).toBe(null);
  });

  it('processes variables using the route', () => {
    var node = Relay.QL`fragment on Node{id}`;
    var prepareVariables = jest.genMockFunction();
    var reference = new RelayFragmentReference(
      () => node,
      {
        size: 'default',
      },
      {},
      prepareVariables
    );

    var customVariables = {
      size: 'override',
      other: 'custom',
    };
    prepareVariables.mockImplementation(() => customVariables);

    var variables = {size: 'default'};
    expect(reference.getFragment(variables)).toBe(node);
    expect(reference.getVariables(route, variables)).toEqual(customVariables);
    expect(prepareVariables).toBeCalledWith({size: 'default'}, route);
  });

  it('warns if a variable is undefined', () => {
    var node = Relay.QL`fragment on Node{id}`;
    var reference = new RelayFragmentReference(
      () => node,
      {},
      {
        dynamic: new GraphQL.CallVariable('dynamic'),
        static: undefined,
      }
    );
    var variables = {};
    expect(reference.getFragment(variables)).toBe(node);
    expect(reference.getVariables(route, variables)).toEqual({});
    expect([
      'RelayFragmentReference: Variable `%s` is undefined in fragment `%s`.',
      'static',
      node.name
    ]).toBeWarnedNTimes(1);
    expect([
      'RelayFragmentReference: Variable `%s` is undefined in fragment `%s`.',
      'dynamic',
      node.name
    ]).toBeWarnedNTimes(1);
  });
});
