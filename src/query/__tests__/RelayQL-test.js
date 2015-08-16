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

describe('RelayQL', () => {
  var Relay;

  beforeEach(() => {
    jest.resetModuleRegistry();

    Relay = require('Relay');

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('throws if not transformed', () => {
    var badQL = Relay.QL;
    expect(() => {
      // Transform cannot find this call site.
      badQL`viewer(){actor{id}}`;
    }).toFailInvariant(
      'RelayQL: Unexpected invocation at runtime. Either the Babel transform ' +
      'was not set up, or it failed to identify this call site. Make sure it ' +
      'is being used verbatim as `Relay.QL`.'
    );
  });

  it('does not throw if transformed', () => {
    expect(() => {
      Relay.QL`query{viewer{actor{id}}}`;
    }).not.toThrow();
  });
});
