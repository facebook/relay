/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<57b19a1d8cc1bb2609198c21b5d548d6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type createFragmentSpecResolverTestTestComponent_test$fragmentType: FragmentType;
export type createFragmentSpecResolverTestTestComponent_test$data = {|
  +id: string,
  +$fragmentType: createFragmentSpecResolverTestTestComponent_test$fragmentType,
|};
export type createFragmentSpecResolverTestTestComponent_test$key = {
  +$data?: createFragmentSpecResolverTestTestComponent_test$data,
  +$fragmentSpreads: createFragmentSpecResolverTestTestComponent_test$fragmentType,
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
  (node/*: any*/).hash = "e504b83393e283bd086e4e128539b051";
}

module.exports = ((node/*: any*/)/*: Fragment<
  createFragmentSpecResolverTestTestComponent_test$fragmentType,
  createFragmentSpecResolverTestTestComponent_test$data,
>*/);
