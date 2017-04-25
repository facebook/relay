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

jest.autoMockOff();

const React = require('React');
const RelayCompatFragmentContainer = require('RelayCompatContainer');
const RelayModernTestUtils = require('RelayModernTestUtils');

describe('RelayCompatFragmentContainer', () => {
  beforeEach(() => {
    jasmine.addMatchers(RelayModernTestUtils.matchers);
  });

  it('throws for invalid fragments', () => {
    expect(() => {
      const TestComponent = () => <div />;
      RelayCompatFragmentContainer.createContainer(TestComponent, {
        foo: null,
      });
    }).toFailInvariant(
      'Could not create Relay Container for `TestComponent`. ' +
      'The value of fragment `foo` was expected to be a fragment, ' +
      'got `null` instead.'
    );
  });
});
