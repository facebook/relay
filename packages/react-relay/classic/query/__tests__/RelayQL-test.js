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

const QueryBuilder = require('../QueryBuilder');
const RelayClassic = require('../../RelayPublic');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQL', () => {
  beforeEach(() => {
    jest.resetModules();

    expect.extend(RelayTestUtils.matchers);
  });

  it('throws if not transformed', () => {
    const badQL = RelayClassic.QL;
    expect(() => {
      // Transform cannot find this call site.
      badQL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `;
    }).toFailInvariant(
      'RelayQL: Unexpected invocation at runtime. Either the Babel transform ' +
        'was not set up, or it failed to identify this call site. Make sure it ' +
        'is being used verbatim as `Relay.QL`.',
    );
  });

  it('does not throw if transformed', () => {
    expect(() => {
      RelayClassic.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `;
    }).not.toThrowError();
  });

  it('permits valid variable substitutions', () => {
    const SIZE = 42;
    expect(() => {
      RelayClassic.QL`
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
    }).not.toThrowError();
  });

  it('wraps variable substituted values in concrete call values', () => {
    const SIZE = 42;
    expect(RelayClassic.QL.__var(SIZE)).toEqual({
      kind: 'CallValue',
      callValue: SIZE,
    });
  });

  it('throws for illegal variable substitutions', () => {
    const variables = {
      size: QueryBuilder.createCallVariable('size'),
    };
    expect(() => {
      RelayClassic.QL`
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
    }).toFailInvariant(
      'RelayQL: Invalid argument `size` supplied via template substitution. ' +
        'Instead, use an inline variable (e.g. `comments(count: $count)`).',
    );
  });

  it('permits fragment substitutions', () => {
    const fragment = QueryBuilder.createFragment({
      name: 'Foo',
      type: 'Bar',
    });
    expect(() => {
      RelayClassic.QL`
        query {
          viewer {
            ${fragment}
          }
        }
      `;
    }).not.toThrow();
  });

  it('permits an array of fragment substitutions', () => {
    const fragment = QueryBuilder.createFragment({
      name: 'Foo',
      type: 'Bar',
    });
    expect(() => {
      RelayClassic.QL`
        query {
          viewer {
            ${[fragment]}
          }
        }
      `;
    }).not.toThrow();
  });

  it('throws for invalid fragment substitutions', () => {
    expect(() => {
      RelayClassic.QL`
        query {
          viewer {
            ${'foo'}
          }
        }
      `;
    }).toFailInvariant(
      'RelayQL: Invalid fragment composition, use ' +
        "`${Child.getFragment('name')}`.",
    );

    expect(() => {
      RelayClassic.QL`
        query {
          viewer {
            ${['foo']}
          }
        }
      `;
    }).toFailInvariant(
      'RelayQL: Invalid fragment composition, use ' +
        "`${Child.getFragment('name')}`.",
    );

    const fragment = QueryBuilder.createFragment({
      name: 'Foo',
      type: 'Bar',
    });
    expect(() => {
      RelayClassic.QL`
        query {
          viewer {
            ${[[fragment]]}
          }
        }
      `;
    }).toFailInvariant(
      'RelayQL: Invalid fragment composition, use ' +
        "`${Child.getFragment('name')}`.",
    );
  });

  it('generates unique concrete fragment IDs', () => {
    const getFragment = () => RelayClassic.QL`
      fragment on Node {
        id
      }
    `;
    const nodeA = getFragment();
    const nodeB = getFragment();
    expect(nodeA).not.toBe(nodeB);
    expect(nodeA.id).not.toBe(nodeB.id);
  });
});
