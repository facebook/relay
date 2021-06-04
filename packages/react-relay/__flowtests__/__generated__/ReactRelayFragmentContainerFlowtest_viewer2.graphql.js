/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<129c19d6ef39ce94d34b7ea90fa96f32>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerFlowtest_viewer2$ref: FragmentReference;
declare export opaque type ReactRelayFragmentContainerFlowtest_viewer2$fragmentType: ReactRelayFragmentContainerFlowtest_viewer2$ref;
export type ReactRelayFragmentContainerFlowtest_viewer2 = {|
  +actor: ?{|
    +id: string,
  |},
  +$refType: ReactRelayFragmentContainerFlowtest_viewer2$ref,
|};
export type ReactRelayFragmentContainerFlowtest_viewer2$data = ReactRelayFragmentContainerFlowtest_viewer2;
export type ReactRelayFragmentContainerFlowtest_viewer2$key = {
  +$data?: ReactRelayFragmentContainerFlowtest_viewer2$data,
  +$fragmentRefs: ReactRelayFragmentContainerFlowtest_viewer2$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayFragmentContainerFlowtest_viewer2",
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
  (node/*: any*/).hash = "0f55965b7c9aca0d661ebdd96c70e384";
}

module.exports = node;
