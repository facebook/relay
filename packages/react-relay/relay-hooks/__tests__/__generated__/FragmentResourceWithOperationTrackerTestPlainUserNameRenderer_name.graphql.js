/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<46f6c902b3faffa86b3ad621c5fde513>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$ref = FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType;
export type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType,
|};
export type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name = FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$data;
export type FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$key = {
  +$data?: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType,
  FragmentResourceWithOperationTrackerTestPlainUserNameRenderer_name$data,
>*/);
