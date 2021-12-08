/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f4df11ae77e5540ef9647808b81d9185>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$ref = RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name = RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "3b4f75a178532b5d5523c34ef49b4184";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name$data,
>*/);
