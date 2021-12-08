/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<99a1a5267a3a53fc167e42042bf5ffc9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$ref = RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name = RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name$data,
>*/);
