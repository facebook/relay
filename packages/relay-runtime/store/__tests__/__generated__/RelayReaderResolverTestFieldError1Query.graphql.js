/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fb47294f05c917fe3d3a06c85a65a906>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderResolverTestFieldError1Query$variables = {||};
export type RelayReaderResolverTestFieldError1Query$data = {|
  +me: ?{|
    +lastName: ?string,
  |},
|};
export type RelayReaderResolverTestFieldError1Query = {|
  response: RelayReaderResolverTestFieldError1Query$data,
  variables: RelayReaderResolverTestFieldError1Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTestFieldError1Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
    "name": "RelayReaderResolverTestFieldError1Query",
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
    "cacheID": "deb8521779c2aea0af0cb01a9adc85d5",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTestFieldError1Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTestFieldError1Query {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f5150685e9912be474b120b3d29b5b22";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTestFieldError1Query$variables,
  RelayReaderResolverTestFieldError1Query$data,
>*/);
