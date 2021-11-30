/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ac149c7b8881ab461def0e09abd41962>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest7Fragment$fragmentType = any;
export type RelayResponseNormalizerTest11Query$variables = {|
  id: string,
  enableStream: boolean,
|};
export type RelayResponseNormalizerTest11QueryVariables = RelayResponseNormalizerTest11Query$variables;
export type RelayResponseNormalizerTest11Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayResponseNormalizerTest7Fragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest11QueryResponse = RelayResponseNormalizerTest11Query$data;
export type RelayResponseNormalizerTest11Query = {|
  variables: RelayResponseNormalizerTest11QueryVariables,
  response: RelayResponseNormalizerTest11Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enableStream"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest11Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayResponseNormalizerTest7Fragment"
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest11Query",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "if": "enableStream",
                "kind": "Stream",
                "label": "RelayResponseNormalizerTest7Fragment$stream$actors",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "actors",
                    "plural": true,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "963958d6761ae64cf40c285d67a129d3",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest11Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest11Query(\n  $id: ID!\n  $enableStream: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayResponseNormalizerTest7Fragment\n    id\n  }\n}\n\nfragment RelayResponseNormalizerTest7Fragment on Feedback {\n  id\n  actors @stream(label: \"RelayResponseNormalizerTest7Fragment$stream$actors\", if: $enableStream, initial_count: 0) {\n    __typename\n    name\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "49b6f26955af4b56db48dc9bb544abdf";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest11Query$variables,
  RelayResponseNormalizerTest11Query$data,
>*/);
