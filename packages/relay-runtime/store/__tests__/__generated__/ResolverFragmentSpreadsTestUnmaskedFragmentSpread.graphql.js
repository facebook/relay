/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1d3252f337cb1feed86dd48cd8382ac5>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ResolverFragmentSpreadsTestUnmaskedFragmentSpread$fragmentType: FragmentType;
export type ResolverFragmentSpreadsTestUnmaskedFragmentSpread$data = {|
  +profile_picture: ?{|
    +height: ?number,
    +uri: ?string,
    +width: ?number,
  |},
  +$fragmentType: ResolverFragmentSpreadsTestUnmaskedFragmentSpread$fragmentType,
|};
export type ResolverFragmentSpreadsTestUnmaskedFragmentSpread$key = {
  +$data?: ResolverFragmentSpreadsTestUnmaskedFragmentSpread$data,
  +$fragmentSpreads: ResolverFragmentSpreadsTestUnmaskedFragmentSpread$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResolverFragmentSpreadsTestUnmaskedFragmentSpread",
  "selections": [
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
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "99fc210b82e2855e50b7243a69ed2d7f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ResolverFragmentSpreadsTestUnmaskedFragmentSpread$fragmentType,
  ResolverFragmentSpreadsTestUnmaskedFragmentSpread$data,
>*/);
