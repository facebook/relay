/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1412a778da2e804edd2bf7bd977bf2eb>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReferenceMarkerTest2PlainUserNameRenderer_name$data = {
  readonly data: ?{
    readonly text: ?string,
  },
  readonly plaintext: ?string,
  readonly $fragmentType: RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType,
};
export type RelayReferenceMarkerTest2PlainUserNameRenderer_name$key = {
  readonly $data?: RelayReferenceMarkerTest2PlainUserNameRenderer_name$data,
  readonly $fragmentSpreads: RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTest2PlainUserNameRenderer_name",
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
  (node/*:: as any*/).hash = "57fc559e5802e30be989ef2d66506b47";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType,
  RelayReferenceMarkerTest2PlainUserNameRenderer_name$data,
>*/);
