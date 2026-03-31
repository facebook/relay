/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b0dc6944fd8571d47f9fd30502d58c96>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest68Query$variables = {||};
export type RelayMockPayloadGeneratorTest68Query$data = {|
  +node: ?{|
    +feed_unit: ?{|
      +actorCount: ?number,
    |},
    +id: string,
    +named: ?{|
      +name: ?string,
    |},
  |},
|};
export type RelayMockPayloadGeneratorTest68Query = {|
  response: RelayMockPayloadGeneratorTest68Query$data,
  variables: RelayMockPayloadGeneratorTest68Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Named",
  "abstractKey": "__isNamed"
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "actorCount",
      "storageKey": null
    }
  ],
  "type": "FeedUnit",
  "abstractKey": "__isFeedUnit"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest68Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          {
            "fragment": (v2/*:: as any*/),
            "kind": "AliasedInlineFragmentSpread",
            "name": "named"
          },
          {
            "fragment": (v3/*:: as any*/),
            "kind": "AliasedInlineFragmentSpread",
            "name": "feed_unit"
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest68Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*:: as any*/),
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
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "bd7a8357dcd4a6dd2b25c73905ee4edc",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest68Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest68Query {\n  node(id: \"my-id\") {\n    __typename\n    id\n    ... on Named {\n      __isNamed: __typename\n      name\n    }\n    ... on FeedUnit {\n      __isFeedUnit: __typename\n      actorCount\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "fa1b56c71d7ac9c1e1643d7b8ef4b02b";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayMockPayloadGeneratorTest68Query$variables,
  RelayMockPayloadGeneratorTest68Query$data,
>*/);
