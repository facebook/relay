/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0ac08b534ad24974ccd434458a71e8af>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernSelectorTestUserFragment$fragmentType: FragmentType;
export type RelayModernSelectorTestUserFragment$ref = RelayModernSelectorTestUserFragment$fragmentType;
export type RelayModernSelectorTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +profilePicture?: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernSelectorTestUserFragment$fragmentType,
|};
export type RelayModernSelectorTestUserFragment = RelayModernSelectorTestUserFragment$data;
export type RelayModernSelectorTestUserFragment$key = {
  +$data?: RelayModernSelectorTestUserFragment$data,
  +$fragmentSpreads: RelayModernSelectorTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "cond"
    },
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernSelectorTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "condition": "cond",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": [
            {
              "kind": "Variable",
              "name": "size",
              "variableName": "size"
            }
          ],
          "concreteType": "Image",
          "kind": "LinkedField",
          "name": "profilePicture",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "uri",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e53a184895ce3ac8e27f03b268afa0e3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernSelectorTestUserFragment$fragmentType,
  RelayModernSelectorTestUserFragment$data,
>*/);
