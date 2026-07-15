/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {RecordSourceJSON} from '../RelayStoreTypes';
import type {
  NormalizationOperation,
  NormalizationSelection,
} from 'relay-runtime/util/NormalizationNode';
import type {DataID, Variables} from 'relay-runtime/util/RelayRuntimeTypes';

import RelayRecordSource from '../RelayRecordSource';
import {mark} from '../RelayReferenceMarker';
import {ROOT_ID} from '../RelayStoreUtils';

// GC retention contract for the read-in-place shadow server-value arm.
//
// A shadow (`@returnFragment`) resolver returning a non-Node server VALUE type
// compiles (fixture `shadow_resolver_magic_fragment_server_value`) to an
// operation whose `me` field contains TWO things side by side:
//   1. a `ClientEdgeToClientObject` whose backing `RelayResolver` is
//      `isOutputType: true` but produces NO second normalization (ServerWeak),
//      so its output-type record set is EMPTY — the edge itself retains nothing
//      of the transplanted record; and
//   2. the PARALLEL plain transplanted `page { stats { likeCount __id } }` path,
//      which normalizes the value ONCE under `client:<parentid>:<field>`.
//
// Retention of the transplanted `client:1:stats` record therefore depends on the
// parallel plain field, NOT on the resolver edge (whose read-time traversal pushes
// a null segment and, with no output-type records, marks nothing). This test
// locks that contract: with the parallel field present the record is retained;
// with only the resolver edge it is NOT.

const TRANSPLANT_ID = 'client:1:stats';
const VARIABLES: Variables = {};

const buildSource = (): RecordSourceJSON => ({
  '1': {
    __id: '1',
    __typename: 'User',
    id: '1',
    page: {__ref: 'client:Page:1'},
  },
  'client:Page:1': {
    __id: 'client:Page:1',
    __typename: 'Page',
    id: 'page-1',
    stats: {__ref: TRANSPLANT_ID},
  },
  [TRANSPLANT_ID]: {
    __id: TRANSPLANT_ID,
    __typename: 'PageStats',
    likeCount: 42,
  },
  [ROOT_ID]: {
    __id: ROOT_ID,
    __typename: '__Root',
    me: {__ref: '1'},
  },
});

// The resolver `ClientEdgeToClientObject` edge, mirroring the operation emitted
// in the fixture: an `isOutputType: true` backing resolver with no root fragment.
const resolverEdge: NormalizationSelection = {
  kind: 'ClientEdgeToClientObject',
  backingField: {
    name: 'page_stats',
    args: null,
    kind: 'RelayResolver',
    storageKey: null,
    isOutputType: true,
    resolverInfo: {
      resolverFunction: () => ({__typename: 'PageStats', __id: TRANSPLANT_ID}),
      rootFragment: null,
    },
  },
  linkedField: {
    alias: null,
    args: null,
    concreteType: 'PageStats',
    kind: 'LinkedField',
    name: 'page_stats',
    plural: false,
    selections: [
      {
        alias: null,
        args: null,
        kind: 'ScalarField',
        name: 'likeCount',
        storageKey: null,
      },
    ],
    storageKey: null,
  },
};

// The PARALLEL plain transplanted `page { stats { __typename likeCount __id } }`
// path — the only thing that retains `client:1:stats`.
const parallelTransplantedPage: NormalizationSelection = {
  alias: null,
  args: null,
  concreteType: 'Page',
  kind: 'LinkedField',
  name: 'page',
  plural: false,
  selections: [
    {
      alias: null,
      args: null,
      concreteType: 'PageStats',
      kind: 'LinkedField',
      name: 'stats',
      plural: false,
      selections: [
        {
          alias: null,
          args: null,
          kind: 'ScalarField',
          name: '__typename',
          storageKey: null,
        },
        {
          alias: null,
          args: null,
          kind: 'ScalarField',
          name: 'likeCount',
          storageKey: null,
        },
        {
          kind: 'ClientExtension',
          selections: [
            {
              alias: null,
              args: null,
              kind: 'ScalarField',
              name: '__id',
              storageKey: null,
            },
          ],
        },
      ],
      storageKey: null,
    },
    {
      alias: null,
      args: null,
      kind: 'ScalarField',
      name: 'id',
      storageKey: null,
    },
  ],
  storageKey: null,
};

const buildOperation = (
  meSelections: ReadonlyArray<NormalizationSelection>,
): NormalizationOperation => ({
  argumentDefinitions: [],
  kind: 'Operation',
  name: 'RelayReferenceMarkerShadowResolverServerValueInlineTestQuery',
  selections: [
    {
      alias: null,
      args: null,
      concreteType: 'User',
      kind: 'LinkedField',
      name: 'me',
      plural: false,
      selections: meSelections,
      storageKey: null,
    },
  ],
});

describe('RelayReferenceMarker shadow resolver server-value read-in-place', () => {
  it('RETAINS the transplanted `client:<parentid>:<field>` record via the parallel plain field while the query is held', () => {
    const source = RelayRecordSource.create(buildSource());
    const references = new Set<DataID>();
    mark(
      source,
      {
        dataID: ROOT_ID,
        node: buildOperation([resolverEdge, parallelTransplantedPage]),
        variables: VARIABLES,
      },
      references,
    );
    // The transplanted server value is reachable (and thus GC-retained) because
    // the PARALLEL plain `page.stats` field marks it — not the resolver edge.
    expect(references.has(TRANSPLANT_ID)).toBe(true);
  });

  it('does NOT retain the transplanted record through the resolver edge alone (its output-type record set is empty for ServerWeak)', () => {
    const source = RelayRecordSource.create(buildSource());
    const references = new Set<DataID>();
    mark(
      source,
      {
        dataID: ROOT_ID,
        // Resolver edge ONLY: no parallel transplanted field. The resolver value
        // was never normalized (ServerWeak emits no normalizationNode), so the
        // edge marks nothing of `client:1:stats`.
        node: buildOperation([resolverEdge]),
        variables: VARIABLES,
      },
      references,
    );
    expect(references.has(TRANSPLANT_ID)).toBe(false);
  });
});
