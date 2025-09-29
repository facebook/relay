/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d1f3468d4f5acae77e5d1b85829d7baa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ResolverFragmentSpreadsTestInlineFragment$key } from "./ResolverFragmentSpreadsTestInlineFragment.graphql";
import {field_that_spreads_inline_fragment as queryFieldThatSpreadsInlineFragmentResolverType} from "../ResolverFragmentSpreads-test.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryFieldThatSpreadsInlineFragmentResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryFieldThatSpreadsInlineFragmentResolverType: (
  rootKey: ResolverFragmentSpreadsTestInlineFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type ResolverFragmentSpreadsTestQuery$variables = {||};
export type ResolverFragmentSpreadsTestQuery$data = {|
  +field_that_spreads_inline_fragment: ?string,
|};
export type ResolverFragmentSpreadsTestQuery = {|
  response: ResolverFragmentSpreadsTestQuery$data,
  variables: ResolverFragmentSpreadsTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResolverFragmentSpreadsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ResolverFragmentSpreadsTestInlineFragment"
        },
        "kind": "RelayResolver",
        "name": "field_that_spreads_inline_fragment",
        "resolverModule": require('../ResolverFragmentSpreads-test').field_that_spreads_inline_fragment,
        "path": "field_that_spreads_inline_fragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ResolverFragmentSpreadsTestQuery",
    "selections": [
      {
        "name": "field_that_spreads_inline_fragment",
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
                  "concreteType": "StreetAddress",
                  "kind": "LinkedField",
                  "name": "address",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "street",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "city",
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
    "cacheID": "d706cc304a81c40165a198fe50c5da53",
    "id": null,
    "metadata": {},
    "name": "ResolverFragmentSpreadsTestQuery",
    "operationKind": "query",
    "text": "query ResolverFragmentSpreadsTestQuery {\n  ...ResolverFragmentSpreadsTestInlineFragment\n}\n\nfragment ResolverFragmentSpreadsTestInlineFragment on Query {\n  me {\n    name\n    ...ResolverFragmentSpreadsTestInlineFragmentSpread\n    id\n  }\n}\n\nfragment ResolverFragmentSpreadsTestInlineFragmentSpread on User {\n  address {\n    street\n    city\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "86e47c6e4a231533a62152d17b3028a2";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverFragmentSpreadsTestQuery$variables,
  ResolverFragmentSpreadsTestQuery$data,
>*/);
