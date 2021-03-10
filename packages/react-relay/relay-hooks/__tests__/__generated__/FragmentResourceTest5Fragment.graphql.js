/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3fbb40e94ae0beaa8625a5491349245b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceTest5Fragment$ref: FragmentReference;
declare export opaque type FragmentResourceTest5Fragment$fragmentType: FragmentResourceTest5Fragment$ref;
export type FragmentResourceTest5Fragment = {|
  +node: ?{|
    +__typename: string,
    +id: string,
    +name: ?string,
  |},
  +$refType: FragmentResourceTest5Fragment$ref,
|};
export type FragmentResourceTest5Fragment$data = FragmentResourceTest5Fragment;
export type FragmentResourceTest5Fragment$key = {
  +$data?: FragmentResourceTest5Fragment$data,
  +$fragmentRefs: FragmentResourceTest5Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "id"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceTest5Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "id"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "node",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "1128d2d9892f66bd2645c34ada2e2d76";
}

module.exports = node;
