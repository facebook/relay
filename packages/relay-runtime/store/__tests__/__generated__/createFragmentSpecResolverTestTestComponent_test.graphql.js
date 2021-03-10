/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<82ad5def5cba5aa86e165a7257356441>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type createFragmentSpecResolverTestTestComponent_test$ref: FragmentReference;
declare export opaque type createFragmentSpecResolverTestTestComponent_test$fragmentType: createFragmentSpecResolverTestTestComponent_test$ref;
export type createFragmentSpecResolverTestTestComponent_test = {|
  +id: string,
  +$refType: createFragmentSpecResolverTestTestComponent_test$ref,
|};
export type createFragmentSpecResolverTestTestComponent_test$data = createFragmentSpecResolverTestTestComponent_test;
export type createFragmentSpecResolverTestTestComponent_test$key = {
  +$data?: createFragmentSpecResolverTestTestComponent_test$data,
  +$fragmentRefs: createFragmentSpecResolverTestTestComponent_test$ref,
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

module.exports = node;
