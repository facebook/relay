/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

import type {ConcreteRequest} from 'relay-runtime';

const PreloadableQueryRegistry: Map<string, ConcreteRequest> = new Map();

module.exports = PreloadableQueryRegistry;
