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

const RelayClassic = require('RelayClassic');
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
          message:
            'Expected `' +
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
    expect(RelayClassic.QL`query{viewer{actor{id}}}`).toContainRootCall(
      RelayClassic.QL`query{viewer{actor{id}}}`,
    );
    expect(RelayClassic.QL`query{me{id}}`).toContainRootCall(
      RelayClassic.QL`query{me{id}}`,
    );
    expect(RelayClassic.QL`query{me{id}}`).not.toContainRootCall(
      RelayClassic.QL`query{viewer{actor{id}}}`,
    );
  });

  it('compares root calls with single arguments', () => {
    expect(RelayClassic.QL`query{node(id:"1038750002"){id}}`).toContainRootCall(
      RelayClassic.QL`query{node(id:"1038750002"){id}}`,
    );
    expect(
      RelayClassic.QL`query{node(id:"1038750002"){id}}`,
    ).not.toContainRootCall(RelayClassic.QL`query{node(id:"4808495"){id}}`);
  });

  it('compares root calls with variable arguments', () => {
    expect(
      RelayClassic.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    ).toContainRootCall(RelayClassic.QL`query{nodes(ids:"1038750002"){id}}`);
    expect(
      RelayClassic.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    ).toContainRootCall(
      RelayClassic.QL`query{nodes(ids:["1038750002","1819001144"]){id}}`,
    );
    expect(
      RelayClassic.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    ).toContainRootCall(
      RelayClassic.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    );
    expect(
      RelayClassic.QL`query{nodes(ids:["1038750002","4808495"]){id}}`,
    ).not.toContainRootCall(
      RelayClassic.QL`query{nodes(ids:["1038750002","4808495","1819001144"]){id}}`,
    );
    expect(
      RelayClassic.QL`query{nodes(ids:"1038750002"){id}}`,
    ).not.toContainRootCall(
      RelayClassic.QL`query{nodes(ids:["1038750002","4808495"]){id}}`,
    );
    // Hypothetical queries.
    expect(
      RelayClassic.QL`query{nodes(ids:"1038750002"){id}}`,
    ).not.toContainRootCall(RelayClassic.QL`query{nodes{id}}`);
    expect(RelayClassic.QL`query{nodes{id}}`).not.toContainRootCall(
      RelayClassic.QL`query{nodes(ids:"1038750002"){id}}`,
    );
  });

  it('compares root calls sharing a canonical name', () => {
    expect(
      RelayClassic.QL`query{nodes(ids:"1038750002"){id}}`,
    ).toContainRootCall(RelayClassic.QL`query{node(id:"1038750002"){id}}`);
    expect(RelayClassic.QL`query{node(id:"1038750002"){id}}`).toContainRootCall(
      RelayClassic.QL`query{nodes(ids:"1038750002"){id}}`,
    );
    expect(
      RelayClassic.QL`query{node(id:"1038750002"){id}}`,
    ).not.toContainRootCall(RelayClassic.QL`query{nodes(ids:"4808495"){id}}`);
    expect(
      RelayClassic.QL`query{nodes(ids:"1038750002"){id}}`,
    ).not.toContainRootCall(RelayClassic.QL`query{node(id:"4808495"){id}}`);
  });
});
