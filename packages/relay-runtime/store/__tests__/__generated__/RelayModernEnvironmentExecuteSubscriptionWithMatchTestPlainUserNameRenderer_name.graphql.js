/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b546912dc1bd23409de596c25de0d186>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$ref = RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name = RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$data;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "66782037b8711299a7b744a9ff2840c5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$data,
>*/);
