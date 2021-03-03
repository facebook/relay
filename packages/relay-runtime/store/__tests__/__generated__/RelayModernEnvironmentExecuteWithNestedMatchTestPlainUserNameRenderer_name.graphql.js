/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<90a1b14a962677b09e6cad044a289e5d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$fragmentType: RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$ref;
export type RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$ref,
|};
export type RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$data = RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name;
export type RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "dd2b6c85ca9c2117be434b42864ff560";
}

module.exports = node;
