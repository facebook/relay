/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1ce2f82c0db506fc16437a01f7031493>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerFlowtest_viewer$ref: FragmentReference;
declare export opaque type ReactRelayFragmentContainerFlowtest_viewer$fragmentType: ReactRelayFragmentContainerFlowtest_viewer$ref;
export type ReactRelayFragmentContainerFlowtest_viewer = {|
  +actor: ?{|
    +id: string,
  |},
  +$refType: ReactRelayFragmentContainerFlowtest_viewer$ref,
|};
export type ReactRelayFragmentContainerFlowtest_viewer$data = ReactRelayFragmentContainerFlowtest_viewer;
export type ReactRelayFragmentContainerFlowtest_viewer$key = {
  +$data?: ReactRelayFragmentContainerFlowtest_viewer$data,
  +$fragmentRefs: ReactRelayFragmentContainerFlowtest_viewer$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayFragmentContainerFlowtest_viewer",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "75147ebd599fe1c406f2dfc7abb164f8";
}

module.exports = node;
