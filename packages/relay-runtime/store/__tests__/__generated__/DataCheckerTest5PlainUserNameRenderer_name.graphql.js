/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5cd5b257c12121572bbc69ef6f03e66b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTest5PlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type DataCheckerTest5PlainUserNameRenderer_name$fragmentType: DataCheckerTest5PlainUserNameRenderer_name$ref;
export type DataCheckerTest5PlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: DataCheckerTest5PlainUserNameRenderer_name$ref,
|};
export type DataCheckerTest5PlainUserNameRenderer_name$data = DataCheckerTest5PlainUserNameRenderer_name;
export type DataCheckerTest5PlainUserNameRenderer_name$key = {
  +$data?: DataCheckerTest5PlainUserNameRenderer_name$data,
  +$fragmentRefs: DataCheckerTest5PlainUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest5PlainUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "ac8ff6d1542a39373dd84ad4f75d4898";
}

module.exports = node;
