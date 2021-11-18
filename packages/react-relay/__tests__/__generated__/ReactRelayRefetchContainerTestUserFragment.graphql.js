/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<eef7ac036c9c672ac93d4fda5e2e7180>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerTestUserFragment$fragmentType: FragmentType;
export type ReactRelayRefetchContainerTestUserFragment$ref = ReactRelayRefetchContainerTestUserFragment$fragmentType;
export type ReactRelayRefetchContainerTestUserFragment$data = {|
  +id: string,
  +name?: ?string,
  +$fragmentType: ReactRelayRefetchContainerTestUserFragment$fragmentType,
|};
export type ReactRelayRefetchContainerTestUserFragment = ReactRelayRefetchContainerTestUserFragment$data;
export type ReactRelayRefetchContainerTestUserFragment$key = {
  +$data?: ReactRelayRefetchContainerTestUserFragment$data,
  +$fragmentSpreads: ReactRelayRefetchContainerTestUserFragment$fragmentType,
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
  "name": "ReactRelayRefetchContainerTestUserFragment",
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
  (node/*: any*/).hash = "db69633fd7c0e2137e8cdc0d2631efea";
}

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayRefetchContainerTestUserFragment$fragmentType,
  ReactRelayRefetchContainerTestUserFragment$data,
>*/);
