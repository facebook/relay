/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b6ee4e7a20a473bf17221231151803b3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayMockPayloadGeneratorTest12Fragment$ref: FragmentReference;
declare export opaque type RelayMockPayloadGeneratorTest12Fragment$fragmentType: RelayMockPayloadGeneratorTest12Fragment$ref;
export type RelayMockPayloadGeneratorTest12Fragment = {|
  +id: string,
  +name: ?string,
  +body: ?{|
    +text: ?string,
  |},
  +myTown: ?{|
    +id: string,
    +name: ?string,
    +url: ?string,
    +feedback: ?{|
      +comments: ?{|
        +edges: ?$ReadOnlyArray<?{|
          +cursor: ?string,
          +comment: ?{|
            +id: string,
            +message: ?{|
              +text: ?string,
            |},
            +likeSentence: ?{|
              +text: ?string,
            |},
          |},
        |}>,
        +pageInfo: ?{|
          +startCursor: ?string,
        |},
      |},
    |},
  |},
  +$refType: RelayMockPayloadGeneratorTest12Fragment$ref,
|};
export type RelayMockPayloadGeneratorTest12Fragment$data = RelayMockPayloadGeneratorTest12Fragment;
export type RelayMockPayloadGeneratorTest12Fragment$key = {
  +$data?: RelayMockPayloadGeneratorTest12Fragment$data,
  +$fragmentRefs: RelayMockPayloadGeneratorTest12Fragment$ref,
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

module.exports = node;
