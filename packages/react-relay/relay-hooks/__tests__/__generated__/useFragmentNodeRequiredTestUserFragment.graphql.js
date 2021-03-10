/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b316fd0f0ce77d8db7166a58b39706c3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useFragmentNodeRequiredTestUserFragment$ref: FragmentReference;
declare export opaque type useFragmentNodeRequiredTestUserFragment$fragmentType: useFragmentNodeRequiredTestUserFragment$ref;
export type useFragmentNodeRequiredTestUserFragment = ?{|
  +id: string,
  +name: string,
  +$refType: useFragmentNodeRequiredTestUserFragment$ref,
|};
export type useFragmentNodeRequiredTestUserFragment$data = useFragmentNodeRequiredTestUserFragment;
export type useFragmentNodeRequiredTestUserFragment$key = {
  +$data?: useFragmentNodeRequiredTestUserFragment$data,
  +$fragmentRefs: useFragmentNodeRequiredTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentNodeRequiredTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      "action": "NONE",
      "path": "name"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "3d50b526eae7e4293c869565c29c563d";
}

module.exports = node;
