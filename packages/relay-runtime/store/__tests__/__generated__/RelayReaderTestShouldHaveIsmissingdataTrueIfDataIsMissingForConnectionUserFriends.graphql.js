/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fbea34b23837f532f6ffc0a3f07ad84a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForConnectionUserFriends$fragmentType: FragmentType;
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForConnectionUserFriends$data = {
  readonly friends: ?{
    readonly edges: ?ReadonlyArray<?{
      readonly cursor: ?string,
      readonly node: ?{
        readonly id: string,
      },
    }>,
  },
  readonly id: string,
  readonly $fragmentType: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForConnectionUserFriends$fragmentType,
};
export type RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForConnectionUserFriends$key = {
  readonly $data?: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForConnectionUserFriends$data,
  readonly $fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForConnectionUserFriends$fragmentType,
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
  "name": "RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForConnectionUserFriends",
  "selections": [
    (v0/*:: as any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 2
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
                (v0/*:: as any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "friends(first:2)"
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "625e19cee19d26adab058c5138c3ce33";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForConnectionUserFriends$fragmentType,
  RelayReaderTestShouldHaveIsmissingdataTrueIfDataIsMissingForConnectionUserFriends$data,
>*/);
