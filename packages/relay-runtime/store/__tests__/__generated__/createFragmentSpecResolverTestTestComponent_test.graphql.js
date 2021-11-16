/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<295ad11f090cca77b0af354289e9dece>>
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
export type createFragmentSpecResolverTestTestComponent_test$ref = createFragmentSpecResolverTestTestComponent_test$fragmentType;
export type createFragmentSpecResolverTestTestComponent_test$data = {|
  +id: string,
  +$refType: createFragmentSpecResolverTestTestComponent_test$fragmentType,
  +$fragmentType: createFragmentSpecResolverTestTestComponent_test$fragmentType,
|};
export type createFragmentSpecResolverTestTestComponent_test = createFragmentSpecResolverTestTestComponent_test$data;
export type createFragmentSpecResolverTestTestComponent_test$key = {
  +$data?: createFragmentSpecResolverTestTestComponent_test$data,
  +$fragmentRefs: createFragmentSpecResolverTestTestComponent_test$fragmentType,
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
