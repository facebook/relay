/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1761d7f749dde7bc81485659701c8912>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ResolverFragmentSpreadsTestUnmaskedFragment$fragmentType: FragmentType;
export type ResolverFragmentSpreadsTestUnmaskedFragment$data = {|
  +me: {|
    +name: string,
    +profile_picture: ?{|
      +height: ?number,
      +uri: ?string,
      +width: ?number,
    |},
  |},
  +$fragmentType: ResolverFragmentSpreadsTestUnmaskedFragment$fragmentType,
|};
export type ResolverFragmentSpreadsTestUnmaskedFragment$key = {
  +$data?: ResolverFragmentSpreadsTestUnmaskedFragment$data,
  +$fragmentSpreads: ResolverFragmentSpreadsTestUnmaskedFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResolverFragmentSpreadsTestUnmaskedFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            },
            "action": "THROW"
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Image",
            "kind": "LinkedField",
            "name": "profile_picture",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "uri",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "width",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "height",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "0c5aa8d2523e4697b17cefb1aeec2183";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ResolverFragmentSpreadsTestUnmaskedFragment$fragmentType,
  ResolverFragmentSpreadsTestUnmaskedFragment$data,
>*/);
