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

const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayQueryIndexPath = require('RelayQueryIndexPath');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryIndexPath', () => {
  const {getNode} = RelayTestUtils;

  const traverseRecursive = (indexPath, node, callback) => {
    indexPath.traverse(node, (child, index, children) => {
      if (child.isGenerated()) {
        return;
      }
      callback(child, index, children);
      traverseRecursive(indexPath, child, callback);
    });
  };

  const getIndexPathForAlias = (alias, node) => {
    const indexPath = new RelayQueryIndexPath();
    let targetIndexPath;
    traverseRecursive(indexPath, node, child => {
      if (!targetIndexPath &&
          child instanceof RelayQuery.Field &&
          child.getApplicationName() === alias) {
        targetIndexPath = indexPath.clone();
      }
    });
    if (!targetIndexPath) {
      throw new Error(
        'getIndexPathForAlias(): Supplied `node` is missing a field with ' +
        'alias, "target".'
      );
    }
    return targetIndexPath;
  };

  beforeEach(() => {
    jest.resetModuleRegistry();
    jasmine.addMatchers({
      toCreateSerializationKeys() {
        return {
          compare(node, expected) {
            const indexPath = new RelayQueryIndexPath();
            const results = [];
            traverseRecursive(indexPath, node, child => {
              results.push(indexPath.getSerializationKey());
            });
            return {
              pass: jasmine.matchersUtil.equals(results, expected),
            };
          },
        };
      },
    });
  });

  it('creates compact serialization keys', () => {
    const node = getNode(Relay.QL`
      query {
        me {
          _00:id _01:id _02:id _03:id _04:id _05:id _06:id _07:id _08:id _09:id
          _10:id _11:id _12:id _13:id _14:id _15:id _16:id _17:id _18:id _19:id
          _20:id _21:id _22:id _23:id _24:id _25:id _26:id _27:id _28:id _29:id
          _30:id _31:id _32:id _33:id _34:id _35:id _36:id _37:id _38:id _39:id
          _40:id _41:id _42:id _43:id _44:id _45:id _46:id _47:id _48:id _49:id
          _50:id _51:id _52:id _53:id _54:id _55:id _56:id _57:id _58:id _59:id
          _60:id _61:id _62:id
        }
      }
    `);
    expect(node).toCreateSerializationKeys([
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
      'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
      'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
      'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
      'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
      'Y', 'Z', '_10_',
    ]);
  });

  it('resets indexes across fields', () => {
    const node = getNode(Relay.QL`
      query {
        me {
          address {
            city
            street
          }
          hometown {
            name
            address {
              city
              street
            }
          }
        }
      }
    `);
    expect(node).toCreateSerializationKeys([
      '0',   // address
      '00',  // address.city
      '01',  // address.street
      '1',   // hometown
      '10',  // hometown.name
      '11',  // hometown.address
      '110', // hometown.address.city
      '111', // hometown.address.street
    ]);
  });

  it('accumulates indexes across fragments', () => {
    const node = getNode(Relay.QL`
      query {
        node(id: "123") {
          id
          __typename
          ... on Node {
            id
            __typename
          }
          ... on Node {
            id
            __typename
            ... on Node {
              id
              __typename
            }
          }
        }
      }
    `);
    expect(node).toCreateSerializationKeys([
      '0',   // id
      '1',   // __typename
      '2',   // Node
      '20',  // Node(id)
      '21',  // Node(__typename)
      '3',   // Node
      '30',  // Node(id)
      '31',  // Node(__typename)
      '32',  // Node
      '320', // Node(id)
      '321', // Node(__typename)
    ]);
  });

  it('iterates over every index', () => {
    const node = getNode(Relay.QL`
      query {
        viewer {
          actor {
            ... on Node {
              target: id
            }
          }
        }
      }
    `);
    const keys = [];
    getIndexPathForAlias('target', node).forEach(indexPath => {
      keys.push(indexPath.getSerializationKey());
    });
    expect(keys).toEqual([
      '0',   // actor
      '020', // actor.Node(id)
    ]);
  });

  it('pops paths off the stack', () => {
    const node = getNode(Relay.QL`
      query {
        viewer {
          actor {
            ... on Node {
              target: id
            }
          }
        }
      }
    `);
    const indexPath = getIndexPathForAlias('target', node);

    const keys = [];
    indexPath.pop().forEach(indexPath => {
      keys.push(indexPath.getSerializationKey());
    });
    expect(keys).toEqual([
      '0',  // actor
    ]);

    expect(() => {
      indexPath.pop().pop();
    }).toThrowError(
      'RelayQueryIndexPath.pop(): Cannot pop last path off the stack.'
    );
  });
});
