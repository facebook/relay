/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b060513953e2a098eae674ac6db297fc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$fragmentType: FragmentType;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$ref = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$fragmentType;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$data = {|
  +id: string,
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +$fragmentType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$fragmentType,
|};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends = RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$data;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$data,
  +$fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$fragmentType,
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
  "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 1
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
      "storageKey": "friends(first:1)"
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f7f1d74099a953f743e3c816127e61bc";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$fragmentType,
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForEdgeInTheConnectionUserFriends$data,
>*/);
