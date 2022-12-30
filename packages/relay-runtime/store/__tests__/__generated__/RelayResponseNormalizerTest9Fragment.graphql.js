/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<256c88aba37b01218b5f4b95fedb060f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest9Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest9Fragment$data = {|
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +id: string,
  +$fragmentType: RelayResponseNormalizerTest9Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest9Fragment$key = {
  +$data?: RelayResponseNormalizerTest9Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest9Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest9Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "Stream",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "actors",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e68a7a0e11732e81ccde8c426917c262";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest9Fragment$fragmentType,
  RelayResponseNormalizerTest9Fragment$data,
>*/);
