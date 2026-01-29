/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<78aed588ba940d46b75c744da8f500c9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ResolverFragmentSpreadsTestUnmaskedFragment$key } from "./ResolverFragmentSpreadsTestUnmaskedFragment.graphql";
import {field_that_spreads_unmasked_fragment as queryFieldThatSpreadsUnmaskedFragmentResolverType} from "../ResolverFragmentSpreads-test.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryFieldThatSpreadsUnmaskedFragmentResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryFieldThatSpreadsUnmaskedFragmentResolverType: (
  rootKey: ResolverFragmentSpreadsTestUnmaskedFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type ResolverFragmentSpreadsTestUnmaskedQuery$variables = {||};
export type ResolverFragmentSpreadsTestUnmaskedQuery$data = {|
  +field_that_spreads_unmasked_fragment: ?string,
|};
export type ResolverFragmentSpreadsTestUnmaskedQuery = {|
  response: ResolverFragmentSpreadsTestUnmaskedQuery$data,
  variables: ResolverFragmentSpreadsTestUnmaskedQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverFragmentSpreadsTestUnmaskedQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ResolverFragmentSpreadsTestUnmaskedFragment"
        },
        "kind": "RelayResolver",
        "name": "field_that_spreads_unmasked_fragment",
        "resolverModule": require('../ResolverFragmentSpreads-test').field_that_spreads_unmasked_fragment,
        "path": "field_that_spreads_unmasked_fragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ResolverFragmentSpreadsTestUnmaskedQuery",
    "selections": [
      {
        "name": "field_that_spreads_unmasked_fragment",
        "args": null,
        "fragment": {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "me",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
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
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "width",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "height",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
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
          ],
          "type": "Query",
          "abstractKey": null
        },
        "kind": "RelayResolver",
        "storageKey": null,
        "isOutputType": true
      }
    ]
  },
  "params": {
    "cacheID": "daef30aea33879197274b528011d5f23",
    "id": null,
    "metadata": {},
    "name": "ResolverFragmentSpreadsTestUnmaskedQuery",
    "operationKind": "query",
    "text": "query ResolverFragmentSpreadsTestUnmaskedQuery {\n  ...ResolverFragmentSpreadsTestUnmaskedFragment\n}\n\nfragment ResolverFragmentSpreadsTestUnmaskedFragment on Query {\n  me {\n    name\n    profile_picture {\n      uri\n      width\n      height\n    }\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "aaf8fd0adecb2a68595ad7cb7363b237";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverFragmentSpreadsTestUnmaskedQuery$variables,
  ResolverFragmentSpreadsTestUnmaskedQuery$data,
>*/);
