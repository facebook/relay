/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getRelayLiteralArgumentValues
 * @flow
 */

'use strict';

const invariant = require('invariant');

import type {Argument} from 'RelayIR';
import type {Variables} from 'RelayTypes';

function getRelayLiteralArgumentValues(args: Array<Argument>): Variables {
  const values = {};
  args.forEach(arg => {
    invariant(
      arg.value.kind === 'Literal',
      'getRelayLiteralArgumentValues(): Expected all args to be literals.',
    );
    values[arg.name] = arg.value.value;
  });
  return values;
}

module.exports = getRelayLiteralArgumentValues;
