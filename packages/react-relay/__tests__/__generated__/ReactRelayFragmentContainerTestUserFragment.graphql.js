/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c881efb15ad2ba7a3ce2d530274de63e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerTestUserFragment$fragmentType: FragmentType;
export type ReactRelayFragmentContainerTestUserFragment$ref = ReactRelayFragmentContainerTestUserFragment$fragmentType;
export type ReactRelayFragmentContainerTestUserFragment$data = {|
  +id: string,
  +name?: ?string,
  +$fragmentType: ReactRelayFragmentContainerTestUserFragment$fragmentType,
|};
export type ReactRelayFragmentContainerTestUserFragment = ReactRelayFragmentContainerTestUserFragment$data;
export type ReactRelayFragmentContainerTestUserFragment$key = {
  +$data?: ReactRelayFragmentContainerTestUserFragment$data,
  +$fragmentSpreads: ReactRelayFragmentContainerTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": true,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayFragmentContainerTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "cond",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "ca03eeae7ce7ae5acb7539decc004c17";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayFragmentContainerTestUserFragment$fragmentType,
  ReactRelayFragmentContainerTestUserFragment$data,
>*/);
