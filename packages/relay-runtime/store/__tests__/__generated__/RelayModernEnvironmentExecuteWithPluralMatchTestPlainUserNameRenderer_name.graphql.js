/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<887f754c5a5cce267c6febdc7940278f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$fragmentType: RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$ref;
export type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$ref,
|};
export type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$data = RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name;
export type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "9c56fbb6f29aa60f10bd7143f29214ff";
}

module.exports = node;
