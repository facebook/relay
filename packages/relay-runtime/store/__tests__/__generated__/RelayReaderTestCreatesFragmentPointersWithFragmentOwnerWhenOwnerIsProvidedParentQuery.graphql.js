/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f5314bfa96a49d672d254bfd0939e562>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$fragmentType = any;
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery$variables = {|
  size?: ?$ReadOnlyArray<?number>,
|};
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQueryVariables = RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery$variables;
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile$fragmentType,
  |},
|};
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQueryResponse = RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery$data;
export type RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery = {|
  variables: RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQueryVariables,
  response: RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a2e0f4af750ed00e3fb6bb151f929ba7",
    "id": null,
    "metadata": {},
    "name": "RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery",
    "operationKind": "query",
    "text": "query RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery(\n  $size: [Int]\n) {\n  me {\n    ...RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile\n    id\n  }\n}\n\nfragment RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfile on User {\n  id\n  name\n  ...RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfilePicture\n}\n\nfragment RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedUserProfilePicture on User {\n  profilePicture(size: $size) {\n    uri\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "bb0b0cb8795a7e125e63c27f416cc262";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery$variables,
  RelayReaderTestCreatesFragmentPointersWithFragmentOwnerWhenOwnerIsProvidedParentQuery$data,
>*/);
