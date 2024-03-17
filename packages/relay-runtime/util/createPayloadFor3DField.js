/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {NormalizationSplitOperation} from './NormalizationNode';
import type {JSResourceReference} from 'JSResourceReference';

const {
  getModuleComponentKey,
  getModuleOperationKey,
} = require('../store/RelayStoreUtils');

export opaque type Local3DPayload<
  // eslint-disable-next-line no-unused-vars
  +DocumentName: string,
  +Response: {...},
> = Response;

// $FlowFixMe[unsupported-variance-annotation]
function createPayloadFor3DField<+DocumentName: string, +Response: {...}>(
  name: DocumentName,
  operation: JSResourceReference<NormalizationSplitOperation>,
  component: JSResourceReference<mixed>,
  response: Response,
): Local3DPayload<DocumentName, Response> {
  const data = {
    ...response,
  };
  // $FlowFixMe[prop-missing]
  data[getModuleComponentKey(name)] = component;
  // $FlowFixMe[prop-missing]
  data[getModuleOperationKey(name)] = operation;
  return data;
}

module.exports = createPayloadFor3DField;
