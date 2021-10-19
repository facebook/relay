/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4841d352213a15c196d0c869aabf6d99>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType: RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$ref;
export type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$ref,
|};
export type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$data = RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name;
export type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "101296fb740d1eaff68fffbae7e2ed82";
}

module.exports = node;
