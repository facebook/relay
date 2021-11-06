/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3e2fcc630bb14093d2dc4ffdf5e22370>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$ref = any;
type RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$ref = any;
type RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$ref = any;
type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$ref = any;
export type RelayModernEnvironmentTypeRefinementTestParentQueryVariables = {||};
export type RelayModernEnvironmentTypeRefinementTestParentQueryResponse = {|
  +userOrPage: ?{|
    +$fragmentRefs: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$ref & RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment$ref & RelayModernEnvironmentTypeRefinementTestAbstractActorFragment$ref & RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment$ref,
  |},
|};
export type RelayModernEnvironmentTypeRefinementTestParentQuery = {|
  variables: RelayModernEnvironmentTypeRefinementTestParentQueryVariables,
  response: RelayModernEnvironmentTypeRefinementTestParentQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "abc"
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": "missing",
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
},
v4 = [
  (v1/*: any*/),
  (v2/*: any*/),
  (v3/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentTypeRefinementTestParentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "userOrPage",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentTypeRefinementTestConcreteUserFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentTypeRefinementTestAbstractActorFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment"
          }
        ],
        "storageKey": "userOrPage(id:\"abc\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentTypeRefinementTestParentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "userOrPage",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v4/*: any*/),
            "type": "User",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "type": "Actor",
                "abstractKey": "__isActor"
              }
            ],
            "type": "Node",
            "abstractKey": "__isNode"
          },
          {
            "kind": "InlineFragment",
            "selections": (v4/*: any*/),
            "type": "Actor",
            "abstractKey": "__isActor"
          }
        ],
        "storageKey": "userOrPage(id:\"abc\")"
      }
    ]
  },
  "params": {
    "cacheID": "d4caac9c3f7ec4a53dd44f3c813dd899",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentTypeRefinementTestParentQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentTypeRefinementTestParentQuery {\n  userOrPage(id: \"abc\") {\n    __typename\n    ...RelayModernEnvironmentTypeRefinementTestConcreteUserFragment\n    ...RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment\n    ...RelayModernEnvironmentTypeRefinementTestAbstractActorFragment\n    ...RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTestAbstractActorFragment on Actor {\n  __isActor: __typename\n  id\n  name\n  missing: lastName\n}\n\nfragment RelayModernEnvironmentTypeRefinementTestAbstractInlineRefinementFragment on Node {\n  __isNode: __typename\n  ... on Actor {\n    __isActor: __typename\n    id\n    name\n    missing: lastName\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTestConcreteInlineRefinementFragment on Node {\n  __isNode: __typename\n  ... on User {\n    id\n    name\n    missing: lastName\n  }\n}\n\nfragment RelayModernEnvironmentTypeRefinementTestConcreteUserFragment on User {\n  id\n  name\n  missing: lastName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "689f4ef00bbe32b65200f7bf0b18600d";
}

module.exports = node;
