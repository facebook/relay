/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a43de9009dcfb794907816511f90cbf3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { getFragmentIdentifierTest1NestedUserFragment$fragmentType } from "./getFragmentIdentifierTest1NestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType: FragmentType;
export type getFragmentIdentifierTest1UserFragmentWithArgs$data = {
  readonly id: string,
  readonly name: ?string,
  readonly profile_picture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentSpreads: getFragmentIdentifierTest1NestedUserFragment$fragmentType,
  readonly $fragmentType: getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType,
};
export type getFragmentIdentifierTest1UserFragmentWithArgs$key = {
  readonly $data?: getFragmentIdentifierTest1UserFragmentWithArgs$data,
  readonly $fragmentSpreads: getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scaleLocal"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "getFragmentIdentifierTest1UserFragmentWithArgs",
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
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "scaleLocal"
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profile_picture",
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "getFragmentIdentifierTest1NestedUserFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "4ff79780722b7be51dec047a23d9aed6";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType,
  getFragmentIdentifierTest1UserFragmentWithArgs$data,
>*/);
