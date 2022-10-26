/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fe82e7411965bd392dbb48b670e7c688>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest31Query$variables = {||};
export type RelayResponseNormalizerTest31Query$data = {|
  +me: ?{|
    +actors: ?$ReadOnlyArray<?{|
      +id: string,
    |}>,
  |},
|};
export type RelayResponseNormalizerTest31Query = {|
  response: RelayResponseNormalizerTest31Query$data,
  variables: RelayResponseNormalizerTest31Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest31Query",
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
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actors",
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest31Query",
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
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actors",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v0/*: any*/)
            ],
            "storageKey": null
          },
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a3004c7b62314faeaad323061e8dd037",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest31Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest31Query {\n  me {\n    actors {\n      __typename\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "26c7124e297d6fd6bcb59cba366c0f6c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest31Query$variables,
  RelayResponseNormalizerTest31Query$data,
>*/);
