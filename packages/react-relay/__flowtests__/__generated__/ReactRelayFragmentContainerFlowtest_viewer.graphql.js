/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<23bcef30afc22a42d79dd52e0cfe899c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ReactRelayFragmentContainerFlowtest_viewer$fragmentType: FragmentType;
export type ReactRelayFragmentContainerFlowtest_viewer$data = {|
  +actor: ?{|
    +id: string,
  |},
  +$fragmentType: ReactRelayFragmentContainerFlowtest_viewer$fragmentType,
|};
export type ReactRelayFragmentContainerFlowtest_viewer$key = {
  +$data?: ReactRelayFragmentContainerFlowtest_viewer$data,
  +$fragmentSpreads: ReactRelayFragmentContainerFlowtest_viewer$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  ReactRelayFragmentContainerFlowtest_viewer$fragmentType,
  ReactRelayFragmentContainerFlowtest_viewer$data,
>*/);
