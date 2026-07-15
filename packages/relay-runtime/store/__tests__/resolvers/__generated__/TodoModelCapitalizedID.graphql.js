/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c4bedb74941d30e6de3534c32c0edbe7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type TodoModelCapitalizedID$fragmentType: FragmentType;
export type TodoModelCapitalizedID$data = {
  readonly id: string,
  readonly $fragmentType: TodoModelCapitalizedID$fragmentType,
};
export type TodoModelCapitalizedID$key = {
  readonly $data?: TodoModelCapitalizedID$data,
  readonly $fragmentSpreads: TodoModelCapitalizedID$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TodoModelCapitalizedID",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "TodoModel",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "3ccdcd3cdec1ef56528d736c7f311176";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  TodoModelCapitalizedID$fragmentType,
  TodoModelCapitalizedID$data,
>*/);
