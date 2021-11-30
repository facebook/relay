/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0a439655f7e783e8510cc20d4a012380>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type readUpdatableQueryEXPERIMENTALTest_user$fragmentType = any;
export type readUpdatableQueryEXPERIMENTALTestRegularQuery$variables = {||};
export type readUpdatableQueryEXPERIMENTALTestRegularQueryVariables = readUpdatableQueryEXPERIMENTALTestRegularQuery$variables;
export type readUpdatableQueryEXPERIMENTALTestRegularQuery$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
  |},
  +node: ?{|
    +__typename: string,
    +__id: string,
    +name?: ?string,
    +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  |},
  +node2: ?{|
    +name?: ?string,
    +parents?: $ReadOnlyArray<{|
      +id: string,
      +name: ?string,
      +parents: $ReadOnlyArray<{|
        +id: string,
      |}>,
    |}>,
  |},
|};
export type readUpdatableQueryEXPERIMENTALTestRegularQueryResponse = readUpdatableQueryEXPERIMENTALTestRegularQuery$data;
export type readUpdatableQueryEXPERIMENTALTestRegularQuery = {|
  variables: readUpdatableQueryEXPERIMENTALTestRegularQueryVariables,
  response: readUpdatableQueryEXPERIMENTALTestRegularQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
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
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "User",
  "kind": "LinkedField",
  "name": "me",
  "plural": false,
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/)
  ],
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "4"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v5 = {
  "kind": "InlineFragment",
  "selections": [
    (v1/*: any*/)
  ],
  "type": "User",
  "abstractKey": null
},
v6 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "5"
  }
],
v7 = {
  "kind": "InlineFragment",
  "selections": [
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "parents",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "parents",
          "plural": true,
          "selections": [
            (v0/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryEXPERIMENTALTestRegularQuery",
    "selections": [
      (v2/*: any*/),
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "readUpdatableQueryEXPERIMENTALTest_user"
          },
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__id",
            "storageKey": null
          }
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v6/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v7/*: any*/)
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
    "name": "readUpdatableQueryEXPERIMENTALTestRegularQuery",
    "selections": [
      (v2/*: any*/),
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v0/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": "node(id:\"4\")"
      },
      {
        "alias": "node2",
        "args": (v6/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v7/*: any*/),
          (v0/*: any*/)
        ],
        "storageKey": "node(id:\"5\")"
      }
    ]
  },
  "params": {
    "cacheID": "c5c5986c67c9d62288f0dccea0cf70dd",
    "id": null,
    "metadata": {},
    "name": "readUpdatableQueryEXPERIMENTALTestRegularQuery",
    "operationKind": "query",
    "text": "query readUpdatableQueryEXPERIMENTALTestRegularQuery {\n  me {\n    id\n    name\n  }\n  node(id: \"4\") {\n    __typename\n    ...readUpdatableQueryEXPERIMENTALTest_user\n    ... on User {\n      name\n    }\n    id\n  }\n  node2: node(id: \"5\") {\n    __typename\n    ... on User {\n      name\n      parents {\n        id\n        name\n        parents {\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment readUpdatableQueryEXPERIMENTALTest_user on User {\n  __typename\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "073339c68d5b14df72cbbb2c20b5e3e8";
}

module.exports = ((node/*: any*/)/*: Query<
  readUpdatableQueryEXPERIMENTALTestRegularQuery$variables,
  readUpdatableQueryEXPERIMENTALTestRegularQuery$data,
>*/);
