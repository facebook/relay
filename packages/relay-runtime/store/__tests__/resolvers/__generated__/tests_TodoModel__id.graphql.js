/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e64968aa5c0ace1bb16515bebbaf5b84>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type tests_TodoModel__id$fragmentType: FragmentType;
export type tests_TodoModel__id$data = {|
  +id: string,
  +$fragmentType: tests_TodoModel__id$fragmentType,
|};
export type tests_TodoModel__id$key = {
  +$data?: tests_TodoModel__id$data,
  +$fragmentSpreads: tests_TodoModel__id$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "tests_TodoModel__id",
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

module.exports = ((node/*: any*/)/*: Fragment<
  tests_TodoModel__id$fragmentType,
  tests_TodoModel__id$data,
>*/);
