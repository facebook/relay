/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8e89229d1ccf12fbd91c9cf5d9da3156>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest12Fragment$fragmentType: FragmentType;
export type RelayMockPayloadGeneratorTest12Fragment$data = {|
  +body: ?{|
    +text: ?string,
  |},
  +id: string,
  +myTown: ?{|
    +feedback: ?{|
      +comments: ?{|
        +edges: ?ReadonlyArray<?{|
          +comment: ?{|
            +id: string,
            +likeSentence: ?{|
              +text: ?string,
            |},
            +message: ?{|
              +text: ?string,
            |},
          |},
          +cursor: ?string,
        |}>,
        +pageInfo: ?{|
          +startCursor: ?string,
        |},
      |},
    |},
    +id: string,
    +name: ?string,
    +url: ?string,
  |},
  +name: ?string,
  +$fragmentType: RelayMockPayloadGeneratorTest12Fragment$fragmentType,
|};
export type RelayMockPayloadGeneratorTest12Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest12Fragment$data,
  +$fragmentSpreads: RelayMockPayloadGeneratorTest12Fragment$fragmentType,
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
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "text",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayMockPayloadGeneratorTest12Fragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "Text",
      "kind": "LinkedField",
      "name": "body",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": "myTown",
      "args": null,
      "concreteType": "Page",
      "kind": "LinkedField",
      "name": "hometown",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "Feedback",
          "kind": "LinkedField",
          "name": "feedback",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": [
                {
                  "kind": "Literal",
                  "name": "first",
                  "value": 10
                }
              ],
              "concreteType": "CommentsConnection",
              "kind": "LinkedField",
              "name": "comments",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "CommentsEdge",
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
                      "alias": "comment",
                      "args": null,
                      "concreteType": "Comment",
                      "kind": "LinkedField",
                      "name": "node",
                      "plural": false,
                      "selections": [
                        (v0/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "Text",
                          "kind": "LinkedField",
                          "name": "message",
                          "plural": false,
                          "selections": (v2/*: any*/),
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "Text",
                          "kind": "LinkedField",
                          "name": "likeSentence",
                          "plural": false,
                          "selections": (v2/*: any*/),
                          "storageKey": null
                        }
                      ],
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "PageInfo",
                  "kind": "LinkedField",
                  "name": "pageInfo",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "startCursor",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": "comments(first:10)"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Page",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a7a7b02e898e4af94210f0a1ec5dfa47";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockPayloadGeneratorTest12Fragment$fragmentType,
  RelayMockPayloadGeneratorTest12Fragment$data,
>*/);
