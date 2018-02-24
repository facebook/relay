/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule persistQuery
 * @flow
 * @format
 */

'use strict';

import md5 from '../util/md5';

const persistQuery = (operationText: string): Promise<string> => {
  return new Promise(resolve => resolve(md5(operationText)));
};

module.exports = persistQuery;
