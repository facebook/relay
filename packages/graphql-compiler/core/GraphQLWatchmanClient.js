/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+relay
 */
'use strict';

const watchman = require('fb-watchman');

const MAX_ATTEMPT_LIMIT = 5;

function delay(delayMs: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delayMs));
}

class GraphQLWatchmanClient {
  _client: any;
  _attemptLimit: number;

  static isAvailable(): Promise<boolean> {
    return new Promise(resolve => {
      const client = new GraphQLWatchmanClient(MAX_ATTEMPT_LIMIT);
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

  constructor(attemptLimit: number = 0) {
    this._client = new watchman.Client();
    this._attemptLimit = Math.max(Math.min(MAX_ATTEMPT_LIMIT, attemptLimit), 0);
  }

  _command(...args: Array<mixed>): Promise<any> {
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

  async command(...args: Array<mixed>): Promise<any> {
    let attempt = 0;
    while (true) {
      try {
        attempt++;
        return await this._command(...args);
      } catch (error) {
        if (attempt > this._attemptLimit) {
          throw error;
        }
        await delay(Math.pow(2, attempt) * 500);
        this._client.end();
        this._client = new watchman.Client();
      }
    }
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

module.exports = GraphQLWatchmanClient;
