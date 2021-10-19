/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ab3e4fe43c2770e570e997666af828a9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type requestSubscriptionTestExtraFragment$ref: FragmentReference;
declare export opaque type requestSubscriptionTestExtraFragment$fragmentType: requestSubscriptionTestExtraFragment$ref;
export type requestSubscriptionTestExtraFragment = {|
  +isEnabled: ?boolean,
  +$refType: requestSubscriptionTestExtraFragment$ref,
|};
export type requestSubscriptionTestExtraFragment$data = requestSubscriptionTestExtraFragment;
export type requestSubscriptionTestExtraFragment$key = {
  +$data?: requestSubscriptionTestExtraFragment$data,
  +$fragmentRefs: requestSubscriptionTestExtraFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "requestSubscriptionTestExtraFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isEnabled",
      "storageKey": null
    }
  ],
  "type": "Config",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "93722b56e12ad71765eb789731338c25";
}

module.exports = node;
