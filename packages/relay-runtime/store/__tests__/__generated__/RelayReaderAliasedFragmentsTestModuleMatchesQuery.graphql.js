/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a6ed51be71b0339dad7c5301c2c90dc8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReaderAliasedFragmentsTestModuleMatchesQuery.node.aliased_fragment {"branches":{"User":{"component":"PlainUserNameRenderer.react","fragment":"RelayReaderAliasedFragmentsTestModuleMatches_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTestModuleMatches_user$fragmentType } from "./RelayReaderAliasedFragmentsTestModuleMatches_user.graphql";
export type RelayReaderAliasedFragmentsTestModuleMatchesQuery$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTestModuleMatchesQuery$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestModuleMatches_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestModuleMatchesQuery = {|
  response: RelayReaderAliasedFragmentsTestModuleMatchesQuery$data,
  variables: RelayReaderAliasedFragmentsTestModuleMatchesQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayReaderAliasedFragmentsTestModuleMatchesQuery_aliased_fragment",
      "fragmentName": "RelayReaderAliasedFragmentsTestModuleMatches_user",
      "fragmentPropName": "user",
      "kind": "ModuleImport"
    }
  ],
  "type": "User",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestModuleMatchesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "fragment": (v2/*: any*/),
            "kind": "AliasedInlineFragmentSpread",
            "name": "aliased_fragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestModuleMatchesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
          (v2/*: any*/),
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
    "cacheID": "a94a76ec6b0f3725e7fc6b6b14c4f188",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestModuleMatchesQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestModuleMatchesQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      ...RelayReaderAliasedFragmentsTestModuleMatches_user\n      __module_operation_RelayReaderAliasedFragmentsTestModuleMatchesQuery_aliased_fragment: js(module: \"RelayReaderAliasedFragmentsTestModuleMatches_user$normalization.graphql\", id: \"RelayReaderAliasedFragmentsTestModuleMatchesQuery.node.aliased_fragment\")\n      __module_component_RelayReaderAliasedFragmentsTestModuleMatchesQuery_aliased_fragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayReaderAliasedFragmentsTestModuleMatchesQuery.node.aliased_fragment\")\n    }\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTestModuleMatches_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5226926e7aa02b8b824894876a2e0365";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestModuleMatchesQuery$variables,
  RelayReaderAliasedFragmentsTestModuleMatchesQuery$data,
>*/);
