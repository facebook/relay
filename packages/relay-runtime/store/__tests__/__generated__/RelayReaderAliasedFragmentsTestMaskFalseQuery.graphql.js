/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<20ee849e641548310cb35106c54fd734>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderAliasedFragmentsTestMaskFalseQuery$variables = {||};
export type RelayReaderAliasedFragmentsTestMaskFalseQuery$data = {|
  +me: ?{|
    +aliased_fragment: {|
      +name: ?string,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestMaskFalseQuery = {|
  response: RelayReaderAliasedFragmentsTestMaskFalseQuery$data,
  variables: RelayReaderAliasedFragmentsTestMaskFalseQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
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
    "name": "RelayReaderAliasedFragmentsTestMaskFalseQuery",
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
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                (v0/*: any*/)
              ],
              "type": "User",
              "abstractKey": null
            },
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestMaskFalseQuery",
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
    "cacheID": "d524c9913da568d97f55b2af72f09756",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestMaskFalseQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestMaskFalseQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3c9f27dfac516a9d2c68c535b4c0804f";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestMaskFalseQuery$variables,
  RelayReaderAliasedFragmentsTestMaskFalseQuery$data,
>*/);
