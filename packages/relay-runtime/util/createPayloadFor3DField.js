/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

import type {JSResourceReference} from 'JSResourceReference';
import type {NormalizationSplitOperation} from './NormalizationNode';

const {
  getModuleComponentKey,
  getModuleOperationKey,
} = require('../store/RelayStoreUtils');

export opaque type Local3DPayload<
  +DocumentName: string,
  +Response: {...},
> = Response;

function createPayloadFor3DField<+DocumentName: string, +Response: {...}>(
  name: DocumentName,
  operation: JSResourceReference<NormalizationSplitOperation>,
  component: JSResourceReference<mixed>,
  response: Response,
): Local3DPayload<DocumentName, Response> {
  const data = {
    ...response,
  };
  data[getModuleComponentKey(name)] = component;
  data[getModuleOperationKey(name)] = operation;
  return data;
}

module.exports = createPayloadFor3DField;
