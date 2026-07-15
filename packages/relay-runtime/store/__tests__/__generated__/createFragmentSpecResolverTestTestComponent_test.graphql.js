/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1447a217e0664155056291d40d19ac9d>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type createFragmentSpecResolverTestTestComponent_test$fragmentType: FragmentType;
export type createFragmentSpecResolverTestTestComponent_test$data = {
  readonly id: string,
  readonly $fragmentType: createFragmentSpecResolverTestTestComponent_test$fragmentType,
};
export type createFragmentSpecResolverTestTestComponent_test$key = {
  readonly $data?: createFragmentSpecResolverTestTestComponent_test$data,
  readonly $fragmentSpreads: createFragmentSpecResolverTestTestComponent_test$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "createFragmentSpecResolverTestTestComponent_test",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "e504b83393e283bd086e4e128539b051";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  createFragmentSpecResolverTestTestComponent_test$fragmentType,
  createFragmentSpecResolverTestTestComponent_test$data,
>*/);
