/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9da58255ddbeb66ddb9594e53b082211>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$ref: FragmentReference;
declare export opaque type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$fragmentType: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$ref;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends = {|
  +id: string,
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +$refType: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$ref,
|};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$data = RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$data,
  +$fragmentRefs: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$ref,
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
  "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends",
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
                (v0/*: any*/)
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
  (node/*: any*/).hash = "7ad43c68a307b4ff13f854acf3baeb28";
}

module.exports = node;
