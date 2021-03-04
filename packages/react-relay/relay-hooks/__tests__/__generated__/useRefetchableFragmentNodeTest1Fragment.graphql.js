/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<821a445a461ed1a561f9fcb78ffacf07>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
type useRefetchableFragmentNodeTest1Fragment$ref = any;
type useRefetchableFragmentNodeTest1Fragment$fragmentType = any;
export type { useRefetchableFragmentNodeTest1Fragment$ref, useRefetchableFragmentNodeTest1Fragment$fragmentType };
export type useRefetchableFragmentNodeTest1Fragment = {|
  +actor: ?{|
    +name: ?string,
  |},
  +fetch_id: string,
  +__token: string,
  +$refType: useRefetchableFragmentNodeTest1Fragment$ref,
|};
export type useRefetchableFragmentNodeTest1Fragment$data = useRefetchableFragmentNodeTest1Fragment;
export type useRefetchableFragmentNodeTest1Fragment$key = {
  +$data?: useRefetchableFragmentNodeTest1Fragment$data,
  +$fragmentRefs: useRefetchableFragmentNodeTest1Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "fetch__NonNodeStory"
      ],
      "operation": require('./useRefetchableFragmentNodeTest1FragmentRefetchQuery.graphql'),
      "identifierField": "fetch_id"
    }
  },
  "name": "useRefetchableFragmentNodeTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fetch_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__token",
      "storageKey": null
    }
  ],
  "type": "NonNodeStory",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5edfb0ad9be0c72a1ba5d714bff331ae";
}

module.exports = node;
