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

describe('printRelayQueryCall', () => {
  var printRelayQueryCall = require('printRelayQueryCall');

  it('prints a call with a null argument', () => {
    var call = {
      name: 'me',
      value: null
    };
    expect(printRelayQueryCall(call)).toEqual('.me()');
  });

  it('prints a call with an undefined argument', () => {
    var call = {
      name: 'me',
      value: undefined
    };
    expect(printRelayQueryCall(call)).toEqual('.me()');
  });

  it('prints a call with a string argument', () => {
    var call = {
      name: 'first',
      value: '5'
    };
    expect(printRelayQueryCall(call)).toEqual('.first(5)');
  });

  it('prints a call with a numeric argument', () => {
    var call = {
      name: 'first',
      value: 5
    };
    expect(printRelayQueryCall(call)).toEqual('.first(5)');
  });

  it('prints a call with `true` argument', () => {
    var call = {
      name: 'if',
      value: true
    };
    expect(printRelayQueryCall(call)).toEqual('.if(true)');
  });

  it('prints a call with `false` argument', () => {
    var call = {
      name: 'unless',
      value: false
    };
    expect(printRelayQueryCall(call)).toEqual('.unless(false)');
  });

  it('prints a call with many arguments', () => {
    var call = {
      name: 'usernames',
      value: ['glh', 'joesavona']
    };
    expect(printRelayQueryCall(call)).toEqual('.usernames(glh,joesavona)');
  });

  it('sanitizes argument values', () => {
    var call = {
      name: 'checkin_search_query',
      value: JSON.stringify({query: 'Menlo Park'})
    };
    expect(printRelayQueryCall(call)).toEqual(
      '.checkin_search_query(\\{"query":"Menlo Park"\\})'
    );
  });

  it('escapes leading and trailing whitespace', () => {
    // Extra trailing space is a workaround, see Task #7599025.
    var values = {
      ' ': '\\ \\ ',
      '  ': '\\ \\ \\ ',
      ' x': '\\ x',
      'x ': 'x\\ \\ ',
      ' x ': '\\ x\\ \\ ',
      'x y': 'x y'
    };
    Object.keys(values).forEach(value => {
      var call = {
        name: 'node',
        value
      };
      var expected = values[value];
      expect(printRelayQueryCall(call)).toEqual('.node(' + expected + ')');
    });
  });
});
