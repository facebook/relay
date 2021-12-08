/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<88137405f8de7a0ced4a2af2bbf32a29>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerFlowtest_viewer2$fragmentType: FragmentType;
export type ReactRelayFragmentContainerFlowtest_viewer2$ref = ReactRelayFragmentContainerFlowtest_viewer2$fragmentType;
export type ReactRelayFragmentContainerFlowtest_viewer2$data = {|
  +actor: ?{|
    +id: string,
  |},
  +$fragmentType: ReactRelayFragmentContainerFlowtest_viewer2$fragmentType,
|};
export type ReactRelayFragmentContainerFlowtest_viewer2 = ReactRelayFragmentContainerFlowtest_viewer2$data;
export type ReactRelayFragmentContainerFlowtest_viewer2$key = {
  +$data?: ReactRelayFragmentContainerFlowtest_viewer2$data,
  +$fragmentSpreads: ReactRelayFragmentContainerFlowtest_viewer2$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayFragmentContainerFlowtest_viewer2$fragmentType,
  ReactRelayFragmentContainerFlowtest_viewer2$data,
>*/);
