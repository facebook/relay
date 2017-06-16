/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

const containsRelayQueryRootCall = require('containsRelayQueryRootCall');

describe('containsRelayQueryRootCall', function() {
  const {getNode} = RelayTestUtils;

  beforeEach(function() {
    expect.extend({
      toContainRootCall(thisQuery, thatQuery) {
        const pass = containsRelayQueryRootCall(
          getNode(thisQuery),
          getNode(thatQuery),
        );
        const notText = pass ? 'not ' : '';
        return {
          pass,
          message: 'Expected `' +
            thisQuery +
            '` ' +
            notText +
            'to contain root call of `' +
            thatQuery +
            '`.',
        };
      },
    });
  });

  it('compares root calls without arguments', () => {
    expect(Relay.QL`query{viewer{actor{id}}}`).toContainRootCall(
      Relay.QL`query{viewer{actor{id}}}`,
    );
    expect(Relay.QL`query{me{id}}`).toContainRootCall(Relay.QL`query{me{id}}`);
    expect(Relay.QL`query{me{id}}`).not.toContainRootCall(
      Relay.QL`query{viewer{actor{id}}}`,
    );
  });

  it('compares root calls with single arguments', () => {
    expect(Relay.QL`query{node(id:"1038750002"){id}}`).toContainRootCall(
      Relay.QL`query{node(id:"1038750002"){id}}`,
    );
    expect(Relay.QL`query{node(id:"1038750002"){id}}`).not.toContainRootCall(
      Relay.QL`query{node(id:"4808495"){id}}`,
    );
  });

  it('compares root calls with variable arguments', () => {
    expect(
      Relay.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    ).toContainRootCall(Relay.QL`query{nodes(ids:"1038750002"){id}}`);
    expect(
      Relay.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    ).toContainRootCall(
      Relay.QL`query{nodes(ids:["1038750002","1819001144"]){id}}`,
    );
    expect(
      Relay.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    ).toContainRootCall(
      Relay.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    );
    expect(
      Relay.QL`query{nodes(ids:["1038750002","4808495"]){id}}`,
    ).not.toContainRootCall(
      Relay.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    );
    expect(Relay.QL`query{nodes(ids:"1038750002"){id}}`).not.toContainRootCall(
      Relay.QL`query{nodes(ids:["1038750002","4808495"]){id}}`,
    );
    // Hypothetical queries.
    expect(Relay.QL`query{nodes(ids:"1038750002"){id}}`).not.toContainRootCall(
      Relay.QL`query{nodes{id}}`,
    );
    expect(Relay.QL`query{nodes{id}}`).not.toContainRootCall(
      Relay.QL`query{nodes(ids:"1038750002"){id}}`,
    );
  });

  it('compares root calls sharing a canonical name', () => {
    expect(Relay.QL`query{nodes(ids:"1038750002"){id}}`).toContainRootCall(
      Relay.QL`query{node(id:"1038750002"){id}}`,
    );
    expect(Relay.QL`query{node(id:"1038750002"){id}}`).toContainRootCall(
      Relay.QL`query{nodes(ids:"1038750002"){id}}`,
    );
    expect(Relay.QL`query{node(id:"1038750002"){id}}`).not.toContainRootCall(
      Relay.QL`query{nodes(ids:"4808495"){id}}`,
    );
    expect(Relay.QL`query{nodes(ids:"1038750002"){id}}`).not.toContainRootCall(
      Relay.QL`query{node(id:"4808495"){id}}`,
    );
  });
});
