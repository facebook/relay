/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<69ce567c6fdcad15ae3f85b493df8f16>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReaderAliasedFragmentsTestKitchenSinkQuery.node {"branches":{"User":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderAliasedFragmentsTestKitchenSink_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTestKitchenSink_user$fragmentType } from "./RelayReaderAliasedFragmentsTestKitchenSink_user.graphql";
export type RelayReaderAliasedFragmentsTestKitchenSinkQuery$variables = {|
  id: string,
  shouldDefer: boolean,
  shouldSkip: boolean,
|};
export type RelayReaderAliasedFragmentsTestKitchenSinkQuery$data = {|
  +node: ?{|
    +aliased_fragment?: ?{|
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestKitchenSink_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestKitchenSinkQuery = {|
  response: RelayReaderAliasedFragmentsTestKitchenSinkQuery$data,
  variables: RelayReaderAliasedFragmentsTestKitchenSinkQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "shouldDefer"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "shouldSkip"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v4 = [
  {
    "args": null,
    "documentName": "RelayReaderAliasedFragmentsTestKitchenSinkQuery",
    "fragmentName": "RelayReaderAliasedFragmentsTestKitchenSink_user",
    "fragmentPropName": "user",
    "kind": "ModuleImport"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestKitchenSinkQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "condition": "shouldSkip",
            "kind": "Condition",
            "passingValue": false,
            "selections": [
              {
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "kind": "Defer",
                      "selections": (v4/*: any*/)
                    }
                  ],
                  "type": "User",
                  "abstractKey": null
                },
                "kind": "AliasedInlineFragmentSpread",
                "name": "aliased_fragment"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestKitchenSinkQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
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
          {
            "condition": "shouldSkip",
            "kind": "Condition",
            "passingValue": false,
            "selections": [
              {
                "if": "shouldDefer",
                "kind": "Defer",
                "label": "RelayReaderAliasedFragmentsTestKitchenSinkQuery$defer$RelayReaderAliasedFragmentsTestKitchenSink_user",
                "selections": [
                  {
                    "kind": "InlineFragment",
                    "selections": (v4/*: any*/),
                    "type": "User",
                    "abstractKey": null
                  }
                ]
              }
            ]
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f3d045f03aa63d13ef58ad191df1355b",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestKitchenSinkQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestKitchenSinkQuery(\n  $id: ID!\n  $shouldSkip: Boolean!\n  $shouldDefer: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ... @skip(if: $shouldSkip) @defer(label: \"RelayReaderAliasedFragmentsTestKitchenSinkQuery$defer$RelayReaderAliasedFragmentsTestKitchenSink_user\", if: $shouldDefer) {\n      ... on User {\n        ...RelayReaderAliasedFragmentsTestKitchenSink_user\n        __module_operation_RelayReaderAliasedFragmentsTestKitchenSinkQuery: js(module: \"RelayReaderAliasedFragmentsTestKitchenSink_user$normalization.graphql\", id: \"RelayReaderAliasedFragmentsTestKitchenSinkQuery.node\")\n        __module_component_RelayReaderAliasedFragmentsTestKitchenSinkQuery: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReaderAliasedFragmentsTestKitchenSinkQuery.node\")\n      }\n    }\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTestKitchenSink_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6fe1b479a0d3b28e19a70f0fed540186";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestKitchenSinkQuery$variables,
  RelayReaderAliasedFragmentsTestKitchenSinkQuery$data,
>*/);
