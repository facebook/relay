/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ae19bad3d01547a1e2897c80dfc5711b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferTestUserFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithDeferTestUserFragment$fragmentType: RelayModernEnvironmentExecuteWithDeferTestUserFragment$ref;
export type RelayModernEnvironmentExecuteWithDeferTestUserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayModernEnvironmentExecuteWithDeferTestUserFragment$ref,
|};
export type RelayModernEnvironmentExecuteWithDeferTestUserFragment$data = RelayModernEnvironmentExecuteWithDeferTestUserFragment;
export type RelayModernEnvironmentExecuteWithDeferTestUserFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferTestUserFragment$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithDeferTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": "name",
      "args": null,
      "kind": "ScalarField",
      "name": "__name_name_handler",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "eed70db622188a89bf789b59e251237f";
}

module.exports = node;
