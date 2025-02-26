/**
 * @generated SignedSource<<f9d29abe29de04ade0cdce76307528bf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type Welcome$data = {
  readonly user: {
    readonly name: string;
  };
  readonly " $fragmentType": "Welcome";
};
export type Welcome$key = {
  readonly " $data"?: Welcome$data;
  readonly " $fragmentSpreads": FragmentRefs<"Welcome">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "Welcome",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

(node as any).hash = "6c719b07b3ffe1f0fc2f18d759d603af";

export default node;
