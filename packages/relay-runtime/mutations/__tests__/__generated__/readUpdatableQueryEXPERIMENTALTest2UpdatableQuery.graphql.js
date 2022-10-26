/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a96ea72c4633964f0114941cdf83ab0d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { UpdatableQuery, ConcreteUpdatableQuery } from 'relay-runtime';
export type readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$variables = {|
  id: string,
|};
export type readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$data = {|
  get node(): ?{|
    +__typename: string,
  |},
  set node(value: null | void): void,
|};
export type readUpdatableQueryEXPERIMENTALTest2UpdatableQuery = {|
  response: readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$data,
  variables: readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$variables,
|};
*/

var node/*: ConcreteUpdatableQuery*/ = {
  "fragment": {
    "argumentDefinitions": [
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "id"
      }
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableQueryEXPERIMENTALTest2UpdatableQuery",
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "id"
          }
        ],
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
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "UpdatableQuery"
};

if (__DEV__) {
  (node/*: any*/).hash = "3351f181d26cbfcea5d107d3103ffd55";
}

module.exports = ((node/*: any*/)/*: UpdatableQuery<
  readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$variables,
  readUpdatableQueryEXPERIMENTALTest2UpdatableQuery$data,
>*/);
