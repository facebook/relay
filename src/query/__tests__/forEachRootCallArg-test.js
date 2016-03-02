/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */
 
const forEachRootCallArg = require('forEachRootCallArg');
const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');
 
describe('forEachRootCallArg', () => {
  const {getNode} = RelayTestUtils;
  let callback;
  beforeEach(() => {
    callback = jest.genMockFunction();
  });
  
  it('query with string arguments', () => {
    function query(args) {
      return getNode(Relay.QL`
      query {
        usernames(names:${args}) {
          firstName
        }
      }
    `);
    }
    forEachRootCallArg(query('foo'), callback);
    expect(callback).toBeCalledWith('foo');
    forEachRootCallArg(query(null), callback);
    expect(callback).toBeCalledWith(null);
  });
  
  it('query with number arguments', () => {
    function query(args) {
      return getNode(Relay.QL`
      query {
        task(number:${args}){
          dumb,
        }
      }
    `);
    }
    forEachRootCallArg(query(5), callback);
    expect(callback).toBeCalledWith(5);
    forEachRootCallArg(query(null), callback);
    expect(callback).toBeCalledWith(null);
  });
  
  it('query with complex Arguments', () => {
    function query(args) {
      return getNode(Relay.QL`
      query {
        task(number:${args}){
          dumb,
        }
      }
    `);
    }
    const args = [
      {uri: 'foo', dumbNumber:[1, 7]},
      {uri:'bar', dumbNumber:[88, 666]},
    ];
    forEachRootCallArg(query(args), callback);
    expect(callback.mock.calls[0][0]).toEqual(args[0]);
    expect(callback.mock.calls[1][0]).toEqual(args[1]);
    forEachRootCallArg(query(null), callback);
    expect(callback).toBeCalledWith(null);
  });
});