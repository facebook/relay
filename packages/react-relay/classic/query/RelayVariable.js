/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

class RelayVariable {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  equals(other: mixed): boolean {
    return other instanceof RelayVariable && other.getName() === this.name;
  }

  getName(): string {
    return this.name;
  }
}

module.exports = RelayVariable;
