/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8069d66e7f9ea5a29a69bdf19c3090e9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends$ref: FragmentReference;
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends$fragmentType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends$ref;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends = {|
  +id: string,
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
        +username: ?string,
      |},
    |}>,
  |},
  +$refType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends$ref,
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends$data = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends$data,
  +$fragmentRefs: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingInTheNodeUserFriends",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 3
        }
      ],
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "friends",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "FriendsEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "username",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "friends(first:3)"
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "09943f83d1729f2b5dba55f1ff5a68b0";
}

module.exports = node;
