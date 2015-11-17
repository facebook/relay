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

const QueryBuilder = require('QueryBuilder');
const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQL', () => {
  beforeEach(() => {
    jest.resetModuleRegistry();

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('throws if not transformed', () => {
    const badQL = Relay.QL;
    expect(() => {
      // Transform cannot find this call site.
      badQL`
        viewer() {
          actor {
            id
          }
        }
      `;
    }).toFailInvariant(
      'RelayQL: Unexpected invocation at runtime. Either the Babel transform ' +
      'was not set up, or it failed to identify this call site. Make sure it ' +
      'is being used verbatim as `Relay.QL`.'
    );
  });

  it('does not throw if transformed', () => {
    expect(() => {
      Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `;
    }).not.toThrow();
  });

  it('permits valid variable substitutions', () => {
    const SIZE = 42;
    expect(() => {
      Relay.QL`
        query {
          viewer {
            actor {
              profilePicture(size: ${SIZE}) {
                uri
              }
            }
          }
        }
      `;
    }).not.toThrow();
  });

  it('throws for illegal variable substitutions', () => {
    const variables = {
      size: QueryBuilder.createCallVariable('size'),
    };
    expect(() => {
      Relay.QL`
        query {
          viewer {
            actor {
              profilePicture(size: ${variables.size}) {
                uri
              }
            }
          }
        }
      `;
    }).toThrow(
      'RelayQL: Invalid argument `size` supplied via template substitution. ' +
      'Instead, use an inline variable (e.g. `comments(count: $count)`).'
    );
  });
});
