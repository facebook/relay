/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule md5
 * @flow
 * @format
 */

'use strict';

import crypto from 'crypto';

const md5 = (x: string): string => {
  return crypto
    .createHash('md5')
    .update(x, 'utf8')
    .digest('hex');
};

module.exports = md5;
