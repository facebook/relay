/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c4b235c31075cbd364a4482fbfd41da6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type requestSubscriptionTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type requestSubscriptionTestPlainUserNameRenderer_name$data = {|
  +data: ?{|
    +text: ?string,
  |},
  +plaintext: ?string,
  +$fragmentType: requestSubscriptionTestPlainUserNameRenderer_name$fragmentType,
|};
export type requestSubscriptionTestPlainUserNameRenderer_name$key = {
  +$data?: requestSubscriptionTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: requestSubscriptionTestPlainUserNameRenderer_name$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  requestSubscriptionTestPlainUserNameRenderer_name$fragmentType,
  requestSubscriptionTestPlainUserNameRenderer_name$data,
>*/);
