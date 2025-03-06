/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<17361854e373c12d33a96056beaa4b09>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest20Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest20Fragment.graphql";
export type RelayMockPayloadGeneratorTest17Query$variables = {||};
export type RelayMockPayloadGeneratorTest17Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest20Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest17Query = {|
  response: RelayMockPayloadGeneratorTest17Query$data,
  variables: RelayMockPayloadGeneratorTest17Query$variables,
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
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest17Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest20Fragment"
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
    "name": "RelayMockPayloadGeneratorTest17Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Text",
                "kind": "LinkedField",
                "name": "body",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "text",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v3/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": "myActor",
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": "pageName",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      }
                    ],
                    "type": "Page",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              },
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
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
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "f650620f2370783134ce97a6e17e3790",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest17Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest17Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest20Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest17Fragment on Page {\n  id\n  pageName: name\n}\n\nfragment RelayMockPayloadGeneratorTest18Fragment on User {\n  id\n  name\n  username\n}\n\nfragment RelayMockPayloadGeneratorTest19Fragment on User {\n  ...RelayMockPayloadGeneratorTest18Fragment\n  profile_picture {\n    uri\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest20Fragment on User {\n  body {\n    text\n  }\n  actor {\n    __typename\n    name\n    id\n  }\n  myActor: actor {\n    __typename\n    ...RelayMockPayloadGeneratorTest17Fragment\n    id\n  }\n  ...RelayMockPayloadGeneratorTest18Fragment\n  ...RelayMockPayloadGeneratorTest19Fragment\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "79bdb355184ef7ba8e17b34fc383b66b";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest17Query$variables,
  RelayMockPayloadGeneratorTest17Query$data,
>*/);
