/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9b8950991a76acfc0125abc6c1d1f3d5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCommitUpdateTestUserFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentCommitUpdateTestUserFragment$fragmentType: RelayModernEnvironmentCommitUpdateTestUserFragment$ref;
export type RelayModernEnvironmentCommitUpdateTestUserFragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayModernEnvironmentCommitUpdateTestUserFragment$ref,
|};
export type RelayModernEnvironmentCommitUpdateTestUserFragment$data = RelayModernEnvironmentCommitUpdateTestUserFragment;
export type RelayModernEnvironmentCommitUpdateTestUserFragment$key = {
  +$data?: RelayModernEnvironmentCommitUpdateTestUserFragment$data,
  +$fragmentRefs: RelayModernEnvironmentCommitUpdateTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentCommitUpdateTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b161821fe23ad015bfd2bcd62b919a9d";
}

module.exports = node;
