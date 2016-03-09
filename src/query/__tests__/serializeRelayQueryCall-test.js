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

const serializeRelayQueryCall = require('serializeRelayQueryCall');

describe('serializeRelayQueryCall', () => {
  it('serializes a call with a null argument', () => {
    const call = {
      name: 'me',
      value: null,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.me()');
  });

  it('serializes a call with an undefined argument', () => {
    const call = {
      name: 'me',
      value: undefined,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.me()');
  });

  it('serializes a call with a string argument', () => {
    const call = {
      name: 'first',
      value: '5',
    };
    expect(serializeRelayQueryCall(call)).toEqual('.first(5)');
  });

  it('serializes a call with a numeric argument', () => {
    const call = {
      name: 'first',
      value: 5,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.first(5)');
  });

  it('serializes a call with `true` argument', () => {
    const call = {
      name: 'if',
      value: true,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.if(true)');
  });

  it('serializes a call with `false` argument', () => {
    const call = {
      name: 'unless',
      value: false,
    };
    expect(serializeRelayQueryCall(call)).toEqual('.unless(false)');
  });

  it('serializes a call with many arguments', () => {
    const call = {
      name: 'usernames',
      value: ['glh', 'joesavona'],
    };
    expect(serializeRelayQueryCall(call)).toEqual('.usernames(glh,joesavona)');
  });

  it('sanitizes argument values', () => {
    const call = {
      name: 'checkin_search_query',
      value: JSON.stringify({query: 'Menlo Park'}),
    };
    expect(serializeRelayQueryCall(call)).toEqual(
      '.checkin_search_query({"query":"Menlo Park"})'
    );
  });

  it('serializes empty string values', () => {
    const call = {
      name: 'query',
      value: '',
    };
    expect(serializeRelayQueryCall(call)).toEqual(
      '.query()'
    );
  });

  it('serializes string values with leading/trailing whitespace', () => {
    const call = {
      name: 'query',
      value: ' ',
    };
    expect(serializeRelayQueryCall(call)).toEqual(
      '.query( )'
    );
  });
});
