/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

export interface GraphQLReporter {
  reportMessage(message: string): void;
  reportTime(name: string, ms: number): void;
  reportError(caughtLocation: string, error: Error): void;
}
