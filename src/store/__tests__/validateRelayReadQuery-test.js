/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayFragmentReference = require('RelayFragmentReference');
const RelayTestUtils = require('RelayTestUtils');

const validateRelayReadQuery = require('validateRelayReadQuery');

describe('validateRelayReadQuery', () => {
  // Helper functions.
  const {getNode} = RelayTestUtils;

  // Other variables.
  let mockConsoleError;
  let realConsoleError;

  beforeEach(() => {
    jest.resetModuleRegistry();

    realConsoleError = console.error;
    mockConsoleError = console.error = jest.fn();

    jasmine.addMatchers({
      toLogErrorFor() {
        return {
          compare(actual, alias) {
            expect(actual).toBeCalledWith(
              '`%s` is used as an alias more than once. Please use unique ' +
              'aliases.',
              alias
            );
            return {
              pass: true,
            };
          },
        };
      },
    });
  });

  afterEach(() => {
    console.error = realConsoleError;
  });

  it('logs an error if fragment and containing query have no aliases', () => {
    const fragment = Relay.QL`
      fragment on Node {
        profilePicture(size:"100") {
          height
        }
      }
    `;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          profilePicture(size:"50") {
            height
          }
          ${fragment}
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).toLogErrorFor('profilePicture');
  });

  it('logs an error for two local fragments without aliases', () => {
    const fragment = Relay.QL`
      fragment on Node {
        profilePicture(size:"100") {
          height
        }
      }
    `;
    const otherFragment = Relay.QL`
      fragment on Node {
        profilePicture(size:"50") {
          height
        }
      }
    `;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          ${fragment}
          ${otherFragment}
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).toLogErrorFor('profilePicture');
  });

  it('logs an error for local fragments containing linked fields', () => {
    const nestedFragment = Relay.QL`
      fragment on Viewer {
        actor {
          profilePicture(size:"100") {
            height
          }
        }
      }
    `;
    const fragment = Relay.QL`
      fragment on Viewer {
        actor {
          profilePicture(size:"50") {
            height
          }
        }
        ${nestedFragment}
      }
    `;
    const query = getNode(Relay.QL`
      query {
        viewer {
          ${fragment}
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).toLogErrorFor('profilePicture');
  });

  it('logs an error for colliding fields within the same query', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          profilePicture(size:"50") {
            height
          }
          profilePicture(size:"100") {
            height
          }
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).toLogErrorFor('profilePicture');
  });

  it('logs an error if both fields have aliases but they collide', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          pic: profilePicture(size:"50") {
            height
          }
          pic: profilePicture(size:"100") {
            height
          }
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).toLogErrorFor('pic');
  });

  it('logs an error for two different fields with colliding aliases', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          special: profilePicture(size:"50") {
            height
          }
          special: name
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).toLogErrorFor('special');
  });

  it('logs an error when a collision occurs within pageInfo', () => {
    // We test this separately because we traverse pageInfo as though it were a
    // linked field.
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          friends(first:"1") {
            pageInfo {
              my_cursor: startCursor
              my_cursor: endCursor
            }
          }
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).toLogErrorFor('my_cursor');
  });

  it('logs no error when alias is the same as a connection subfield', () => {
    const query = getNode(Relay.QL`
      fragment on User {
        count: friends {
          count
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).not.toBeCalled();
  });

  it('logs no error if containing query has a distinguishing alias ', () => {
    const fragment = Relay.QL`
      fragment on Node {
        profilePicture(size:"100") {
          height
        }
      }
    `;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          medium_profile: profilePicture(size:"50") {
            height
          }
          ${fragment}
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).not.toBeCalled();
  });

  it('logs no error if fragment has a distinguishing alias', () => {
    const fragment = Relay.QL`
      fragment on Node {
        large_profile: profilePicture(size:"100") {
          height
        }
      }
    `;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          profilePicture(size:"50") {
            height
          }
          ${fragment}
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).not.toBeCalled();
  });

  it('logs no error when both fragment and query have aliases', () => {
    const fragment = Relay.QL`
      fragment on Node {
        large_profile: profilePicture(size:"100") {
          height
        }
      }
    `;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          medium_profile: profilePicture(size:"50") {
            height
          }
          ${fragment}
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).not.toBeCalled();
  });

  it('logs no error when one of two fields in a query has an alias', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          medium_profile: profilePicture(size:"50") {
            height
          }
          profilePicture(size:"100") {
            height
          }
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).not.toBeCalled();
  });

  it('logs no error when two fields in a query both have aliases', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          medium_profile: profilePicture(size:"50") {
            height
          }
          large_profile: profilePicture(size:"100") {
            height
          }
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).not.toBeCalled();
  });

  it('logs no error for a non-local fragment which would collide', () => {
    const fragment = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on User {profilePicture(size:"100"){height}}`,
      {}
    );
    const query = getNode(Relay.QL`
      fragment on User {
        profilePicture(size:"50") {
          height
        }
        ${fragment}
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).not.toBeCalled();
  });

  it('logs no error for fields at different levels', () => {
    const query = getNode(Relay.QL`
      fragment on User {
        profilePicture(size:"50") {
          height
        }
        friends(first:"1") {
          edges {
            node {
              profilePicture(size:"100") {
                height
              }
            }
          }
        }
      }
    `);
    validateRelayReadQuery(query);
    expect(mockConsoleError).not.toBeCalled();
  });
});
