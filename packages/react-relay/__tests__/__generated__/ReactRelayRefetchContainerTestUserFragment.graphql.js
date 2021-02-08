/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<376984b57d85d422fbddd150f144b95a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayRefetchContainerTestUserFragment$ref: FragmentReference;
declare export opaque type ReactRelayRefetchContainerTestUserFragment$fragmentType: ReactRelayRefetchContainerTestUserFragment$ref;
export type ReactRelayRefetchContainerTestUserFragment = {|
  +id: string,
  +name?: ?string,
  +$refType: ReactRelayRefetchContainerTestUserFragment$ref,
|};
export type ReactRelayRefetchContainerTestUserFragment$data = ReactRelayRefetchContainerTestUserFragment;
export type ReactRelayRefetchContainerTestUserFragment$key = {
  +$data?: ReactRelayRefetchContainerTestUserFragment$data,
  +$fragmentRefs: ReactRelayRefetchContainerTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": true,
      "kind": "LocalArgument",
      "name": "cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayRefetchContainerTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "condition": "cond",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "db69633fd7c0e2137e8cdc0d2631efea";
}

module.exports = node;
