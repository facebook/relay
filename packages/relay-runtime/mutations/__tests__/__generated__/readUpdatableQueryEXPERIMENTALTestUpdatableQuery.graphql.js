/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8ec73e9c617ca34a5f5f5bcee320bab1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type readUpdatableQueryEXPERIMENTALTest_user$fragmentType = any;
export type readUpdatableQueryEXPERIMENTALTestUpdatableQuery$variables = {||};
export type readUpdatableQueryEXPERIMENTALTestUpdatableQueryVariables = readUpdatableQueryEXPERIMENTALTestUpdatableQuery$variables;
export type readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data = {|
  get me(): ?{|
    +__typename: string,
    +id: string,
    name: ?string,
  |},
  set me(value: ?{
    +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
    ...
  }): void,
  +node: ?({|
    +__typename: "User",
    name: ?string,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
  +node2: ?({|
    +__typename: "User",
    name: ?string,
    get parents(): $ReadOnlyArray<{|
      name: ?string,
      +parents: $ReadOnlyArray<{|
        name: ?string,
      |}>,
    |}>,
    set parents(value: $ReadOnlyArray<{
      +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
      ...
    }>): void,
  |} | {|
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    +__typename: "%other",
  |}),
|};
export type readUpdatableQueryEXPERIMENTALTestUpdatableQueryResponse = readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data;
export type readUpdatableQueryEXPERIMENTALTestUpdatableQuery = {|
  variables: readUpdatableQueryEXPERIMENTALTestUpdatableQueryVariables,
  response: readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "readUpdatableQueryEXPERIMENTALTest_user"
},
v4 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "4"
  }
],
v5 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "5"
  }
],
v6 = [
  (v2/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryEXPERIMENTALTestUpdatableQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v0/*: any*/),
              (v2/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v0/*: any*/),
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "parents",
                "plural": true,
                "selections": [
                  (v3/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "parents",
                    "plural": true,
                    "selections": (v6/*: any*/),
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
        "storageKey": "node(id:\"5\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "readUpdatableQueryEXPERIMENTALTestUpdatableQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": (v6/*: any*/),
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "parents",
                "plural": true,
                "selections": [
                  (v0/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "parents",
                    "plural": true,
                    "selections": [
                      (v2/*: any*/),
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v1/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"5\")"
      }
    ]
  },
  "params": {
    "cacheID": "20b8dcf30e1226c701ed0bf7cadaf240",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryEXPERIMENTALTestUpdatableQuery",
    "operationKind": "query",
    "text": "query readUpdatableQueryEXPERIMENTALTestUpdatableQuery {\n  me {\n    __typename\n    id\n    name\n    ...readUpdatableQueryEXPERIMENTALTest_user\n  }\n  node(id: \"4\") {\n    __typename\n    ... on User {\n      __typename\n      name\n    }\n    id\n  }\n  node2: node(id: \"5\") {\n    __typename\n    ... on User {\n      __typename\n      name\n      parents {\n        ...readUpdatableQueryEXPERIMENTALTest_user\n        name\n        parents {\n          name\n          id\n        }\n        id\n      }\n    }\n    id\n  }\n}\n\nfragment readUpdatableQueryEXPERIMENTALTest_user on User {\n  __typename\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e8ba045866b060831b5fa883781d5241";
}

module.exports = ((node/*: any*/)/*: Query<
  readUpdatableQueryEXPERIMENTALTestUpdatableQuery$variables,
  readUpdatableQueryEXPERIMENTALTestUpdatableQuery$data,
>*/);
