/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c6bb0f5cb9b8365177a207086df96137>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type getFragmentIdentifierTest1NestedUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type getFragmentIdentifierTest1UserFragmentWithArgs$ref: FragmentReference;
declare export opaque type getFragmentIdentifierTest1UserFragmentWithArgs$fragmentType: getFragmentIdentifierTest1UserFragmentWithArgs$ref;
export type getFragmentIdentifierTest1UserFragmentWithArgs = {|
  +id: string,
  +name: ?string,
  +profile_picture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: getFragmentIdentifierTest1NestedUserFragment$ref,
  +$refType: getFragmentIdentifierTest1UserFragmentWithArgs$ref,
|};
export type getFragmentIdentifierTest1UserFragmentWithArgs$data = getFragmentIdentifierTest1UserFragmentWithArgs;
export type getFragmentIdentifierTest1UserFragmentWithArgs$key = {
  +$data?: getFragmentIdentifierTest1UserFragmentWithArgs$data,
  +$fragmentRefs: getFragmentIdentifierTest1UserFragmentWithArgs$ref,
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
  (node/*: any*/).hash = "4ff79780722b7be51dec047a23d9aed6";
}

module.exports = node;
