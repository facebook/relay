/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayWatchmanClient
 * @flow
 * @format
 */
'use strict';

const watchman = require('fb-watchman');

class RelayWatchmanClient {
  _client: any;

  static isAvailable(): Promise<boolean> {
    return new Promise(resolve => {
      const client = new RelayWatchmanClient();
      client.on('error', () => {
        resolve(false);
        client.end();
      });
      client.hasCapability('relative_root').then(
        hasRelativeRoot => {
          resolve(hasRelativeRoot);
          client.end();
        },
        () => {
          resolve(false);
          client.end();
        },
      );
    });
  }

  constructor() {
    this._client = new watchman.Client();
  }

  command(...args: Array<mixed>): Promise<any> {
    return new Promise((resolve, reject) => {
      this._client.command(args, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async hasCapability(capability: string): Promise<boolean> {
    const resp = await this.command('list-capabilities');
    return resp.capabilities.includes(capability);
  }

  async watchProject(
    baseDir: string,
  ): Promise<{
    root: string,
    relativePath: string,
  }> {
    const resp = await this.command('watch-project', baseDir);
    if ('warning' in resp) {
      console.error('Warning:', resp.warning);
    }
    return {
      root: resp.watch,
      relativePath: resp.relative_path,
    };
  }

  on(event: string, callback: Function): void {
    this._client.on(event, callback);
  }

  end(): void {
    this._client.end();
  }
}

module.exports = RelayWatchmanClient;
