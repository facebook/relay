/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<34ee674459516e2709f06159012da4ff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$ref;
export type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$ref,
|};
export type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$data = FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name;
export type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$key = {
  +$data?: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$data,
  +$fragmentRefs: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "aa92095fcf2c3db87d7a7db7efd439d9";
}

module.exports = node;
