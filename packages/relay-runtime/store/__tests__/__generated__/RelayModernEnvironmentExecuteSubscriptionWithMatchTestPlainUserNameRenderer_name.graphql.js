/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8b73fa54ac515b2701f2079ff90d1b2b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$fragmentType: RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$ref;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$ref,
|};
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$data = RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name;
export type RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteSubscriptionWithMatchTestPlainUserNameRenderer_name$ref,
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

module.exports = node;
