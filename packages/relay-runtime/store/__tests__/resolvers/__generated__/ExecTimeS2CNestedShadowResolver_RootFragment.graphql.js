/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5514709f5527721585a6dc92f66d7f23>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { ExecTimeS2CResolvers_ClientRootFragment$key } from "./ExecTimeS2CResolvers_ClientRootFragment.graphql";
import type { ExecTimeS2CResolvers_KeyedFragment$key } from "./ExecTimeS2CResolvers_KeyedFragment.graphql";
import type { FragmentType } from "relay-runtime";
import {exec_time_s2c_client_root as queryExecTimeS2cClientRootResolverType} from "../ExecTimeS2CResolvers.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryExecTimeS2cClientRootResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryExecTimeS2cClientRootResolverType as (
  rootKey: ExecTimeS2CResolvers_ClientRootFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
import {exec_time_s2c_keyed as userExecTimeS2cKeyedResolverType} from "../ExecTimeS2CResolvers.js";
// Type assertion validating that `userExecTimeS2cKeyedResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userExecTimeS2cKeyedResolverType as (
  rootKey: ExecTimeS2CResolvers_KeyedFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type ExecTimeS2CNestedShadowResolver_RootFragment$fragmentType: FragmentType;
export type ExecTimeS2CNestedShadowResolver_RootFragment$data = {
  readonly exec_time_s2c_client_root: ?string,
  readonly me: ?{
    readonly address: ?{
      readonly __typename: "StreetAddress",
      readonly __id: string,
    },
    readonly client_nickname: ?string,
    readonly exec_time_s2c_keyed: ?string,
  },
  readonly $fragmentType: ExecTimeS2CNestedShadowResolver_RootFragment$fragmentType,
};
export type ExecTimeS2CNestedShadowResolver_RootFragment$key = {
  readonly $data?: ExecTimeS2CNestedShadowResolver_RootFragment$data,
  readonly $fragmentSpreads: ExecTimeS2CNestedShadowResolver_RootFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ExecTimeS2CNestedShadowResolver_RootFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "fragment": {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ExecTimeS2CResolvers_KeyedFragment"
          },
          "kind": "RelayResolver",
          "name": "exec_time_s2c_keyed",
          "resolverModule": require('../ExecTimeS2CResolvers').exec_time_s2c_keyed,
          "path": "me.exec_time_s2c_keyed"
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "StreetAddress",
          "kind": "LinkedField",
          "name": "address",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__typename",
              "storageKey": null
            },
            {
              "kind": "ClientExtension",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__id",
                  "storageKey": null
                }
              ]
            }
          ],
          "storageKey": null
        },
        {
          "kind": "ClientExtension",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "client_nickname",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "ExecTimeS2CResolvers_ClientRootFragment"
      },
      "kind": "RelayResolver",
      "name": "exec_time_s2c_client_root",
      "resolverModule": require('../ExecTimeS2CResolvers').exec_time_s2c_client_root,
      "path": "exec_time_s2c_client_root"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "2e1dd9bc0bc8e0a688da79d6d538d58c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ExecTimeS2CNestedShadowResolver_RootFragment$fragmentType,
  ExecTimeS2CNestedShadowResolver_RootFragment$data,
>*/);
