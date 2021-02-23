/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5cd943f3a209db522f23b608f4473525>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayTestMockerTest_me$ref: FragmentReference;
declare export opaque type ReactRelayTestMockerTest_me$fragmentType: ReactRelayTestMockerTest_me$ref;
export type ReactRelayTestMockerTest_me = {|
  +name: ?string,
  +$refType: ReactRelayTestMockerTest_me$ref,
|};
export type ReactRelayTestMockerTest_me$data = ReactRelayTestMockerTest_me;
export type ReactRelayTestMockerTest_me$key = {
  +$data?: ReactRelayTestMockerTest_me$data,
  +$fragmentRefs: ReactRelayTestMockerTest_me$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayTestMockerTest_me",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "759aa7a952c8cbeb8b60e6ec8e032369";
}

module.exports = node;
