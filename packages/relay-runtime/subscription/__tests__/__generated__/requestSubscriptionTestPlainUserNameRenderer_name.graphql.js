/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6bc0ac3b0bbafaf054d2989b76aca13e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type requestSubscriptionTestPlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type requestSubscriptionTestPlainUserNameRenderer_name$fragmentType: requestSubscriptionTestPlainUserNameRenderer_name$ref;
export type requestSubscriptionTestPlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: requestSubscriptionTestPlainUserNameRenderer_name$ref,
|};
export type requestSubscriptionTestPlainUserNameRenderer_name$data = requestSubscriptionTestPlainUserNameRenderer_name;
export type requestSubscriptionTestPlainUserNameRenderer_name$key = {
  +$data?: requestSubscriptionTestPlainUserNameRenderer_name$data,
  +$fragmentRefs: requestSubscriptionTestPlainUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "requestSubscriptionTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "d0c83ee826e9d605ba6911852acb5085";
}

module.exports = node;
