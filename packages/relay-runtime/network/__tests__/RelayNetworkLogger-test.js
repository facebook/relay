/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

require('configureForRelayOSS');

jest.autoMockOff();

const Deferred = require('Deferred');
const RelayModernTestUtils = require('RelayModernTestUtils');
const RelayNetwork = require('RelayNetwork');
const RelayNetworkLogger = require('RelayNetworkLogger');
const {generateAndCompile} = RelayModernTestUtils;
const prettyStringify = require('prettyStringify');

describe('RelayNetworkLogger', () => {
  let logs;
  let deferred;
  let network;
  let TestQuery;

  beforeEach(() => {
    jest.resetModuleRegistry();
    deferred = new Deferred();
    network = RelayNetworkLogger.wrap(
      RelayNetwork.create(
        jest.fn(() => deferred.getPromise())
      )
    );
    logs = [];
    global.console = {
      groupCollapsed: jest.fn(),
      groupEnd: jest.fn(),
      log: jest.fn((...args) => {
        logs.push(...args);
      }),
      time: jest.fn(),
    };
    ({TestQuery} = generateAndCompile(
      `
      query TestQuery {
        me {
          id
        }
      }
    `,
    ));
  });

  describe('request()', () => {
    it('logs responses', () => {
      const variables = {foo: 'bar'};
      const cacheConfig = {force: true};
      const data = {
        me: {
          id: '4',
        },
      };
      network.request(TestQuery, variables, cacheConfig, null, {
        onCompleted: jest.fn(),
        onError: jest.fn(),
      });
      deferred.resolve({data});
      jest.runAllTimers();
      expect(logs).toEqual([
        '[1] Relay Modern: query TestQuery',
        'Cache Config:',
        cacheConfig,
        'Variables:',
        prettyStringify(variables),
        'Response:',
        data,
      ]);
    });

    it('logs errors', () => {
      const variables = {foo: 'bar'};
      const cacheConfig = {force: true};
      const error = new Error('wtf');
      network.request(TestQuery, variables, cacheConfig, null, {
        onCompleted: jest.fn(),
        onError: jest.fn(),
      });
      deferred.reject(error);
      jest.runAllTimers();
      expect(logs).toEqual([
        '[1] Relay Modern: query TestQuery',
        'Cache Config:',
        cacheConfig,
        'Variables:',
        prettyStringify(variables),
        'Error:',
        error,
      ]);
    });
  });

  describe('requestStream()', () => {
    it('logs responses', () => {
      const variables = {foo: 'bar'};
      const cacheConfig = {force: true};
      const data = {
        me: {
          id: '4',
        },
      };
      network.requestStream(TestQuery, variables, cacheConfig, {});
      deferred.resolve({data});
      jest.runAllTimers();
      expect(logs).toEqual([
        '[1] Relay Modern: query TestQuery',
        'Cache Config:',
        cacheConfig,
        'Variables:',
        prettyStringify(variables),
        'Response:',
        data,
      ]);
    });

    it('logs errors', () => {
      const variables = {foo: 'bar'};
      const cacheConfig = {force: true};
      const error = new Error('wtf');
      network.requestStream(TestQuery, variables, cacheConfig, {});
      deferred.reject(error);
      jest.runAllTimers();
      expect(logs).toEqual([
        '[1] Relay Modern: query TestQuery',
        'Cache Config:',
        cacheConfig,
        'Variables:',
        prettyStringify(variables),
        'Error:',
        error,
      ]);
    });
  });
});
