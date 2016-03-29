/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayVariable
 * @typechecks
 * @flow
 */

'use strict';

class RelayVariable {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  equals(other: mixed): boolean {
    return (
      other instanceof RelayVariable &&
      other.getName() === this.name
    );
  }

  getName(): string {
    return this.name;
  }
}

module.exports = RelayVariable;
