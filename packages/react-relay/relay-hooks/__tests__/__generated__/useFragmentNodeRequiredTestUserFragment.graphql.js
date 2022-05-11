/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ef449d8ff48550df406594fad5e2f89b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentNodeRequiredTestUserFragment$fragmentType: FragmentType;
export type useFragmentNodeRequiredTestUserFragment$data = ?{|
  +id: string,
  +name: string,
  +$fragmentType: useFragmentNodeRequiredTestUserFragment$fragmentType,
|};
export type useFragmentNodeRequiredTestUserFragment$key = {
  +$data?: useFragmentNodeRequiredTestUserFragment$data,
  +$fragmentSpreads: useFragmentNodeRequiredTestUserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentNodeRequiredTestUserFragment$fragmentType,
  useFragmentNodeRequiredTestUserFragment$data,
>*/);
