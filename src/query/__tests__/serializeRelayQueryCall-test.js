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

const serializeRelayQueryCall = require('serializeRelayQueryCall');

describe('serializeRelayQueryCall', () => {
  it('serializes a call with a null argument', () => {
    var call = {
      name: 'me',
      value: null,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.me()');
  });

  it('serializes a call with an undefined argument', () => {
    var call = {
      name: 'me',
      value: undefined,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.me()');
  });

  it('serializes a call with a string argument', () => {
    var call = {
      name: 'first',
      value: '5',
    };
    expect(serializeRelayQueryCall(call)).toEqual('.first(5)');
  });

  it('serializes a call with a numeric argument', () => {
    var call = {
      name: 'first',
      value: 5,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.first(5)');
  });

  it('serializes a call with `true` argument', () => {
    var call = {
      name: 'if',
      value: true,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.if(true)');
  });

  it('serializes a call with `false` argument', () => {
    var call = {
      name: 'unless',
      value: false,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.unless(false)');
  });

  it('serializes a call with many arguments', () => {
    var call = {
      name: 'usernames',
      value: ['glh', 'joesavona'],
    };
    expect(serializeRelayQueryCall(call)).toEqual('.usernames(glh,joesavona)');
  });

  it('sanitizes argument values', () => {
    var call = {
      name: 'checkin_search_query',
      value: JSON.stringify({query: 'Menlo Park'}),
    };
    expect(serializeRelayQueryCall(call)).toEqual(
      '.checkin_search_query(\\{"query":"Menlo Park"\\})'
    );
  });

  it('serializes empty string values', () => {
    var call = {
      name: 'query',
      value: '',
    };
    expect(serializeRelayQueryCall(call)).toEqual(
      '.query(\ )'
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
      'x y': 'x y',
    };
    Object.keys(values).forEach(value => {
      var call = {
        name: 'node',
        value,
      };
      var expected = values[value];
      expect(serializeRelayQueryCall(call)).toEqual('.node(' + expected + ')');
    });
  });
});
