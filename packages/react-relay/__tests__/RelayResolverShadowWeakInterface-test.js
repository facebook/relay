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

const React = require('react');
const {RelayEnvironmentProvider, useLazyLoadQuery} = require('react-relay');
const TestRenderer = require('react-test-renderer');
const {RecordSource} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const RelayModernStore = require('relay-runtime/store/RelayModernStore.js');
const {
  disallowConsoleErrors,
  disallowWarnings,
  expectConsoleErrorWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

// End-to-end coverage for a "magic fragment" (`@returnFragment` shadow resolver)
// whose return INTERFACE is implemented ONLY by `@weak` client models
// (`ShadowWeakAlpha`, `ShadowWeakBeta`) -- the pure interface-weak case (no
// server-value member, so no `serverWeakTypes`). The return is
// abstract (`concreteType == null`), so the resolver returns a per-`__typename`
// discriminated `{__typename, __relay_model_instance}` value. This reads the REAL
// compiled artifact end-to-end: without the `_normalizeOutputTypeValue` fix the
// runtime stored the whole wrapper as the model instance, so the model's field
// resolver read `undefined` and the arm rendered blank.

function EnvironmentWrapper({
  children,
  environment,
}: {
  children: React.Node,
  environment: RelayModernEnvironment,
}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Loading...">{children}</React.Suspense>
    </RelayEnvironmentProvider>
  );
}

let environment;
beforeEach(() => {
  // Seed the server data the shadow resolver's root fragment reads
  // (`me { address { city } }`); the weak models derive their `label` from it.
  const store = new RelayModernStore(
    new RecordSource({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        address: {__ref: 'client:1:address'},
      },
      'client:1:address': {
        __id: 'client:1:address',
        __typename: 'StreetAddress',
        city: 'Menlo Park',
      },
    }),
    {},
  );
  environment = new RelayModernEnvironment({
    network: RelayNetwork.create(jest.fn()),
    store,
  });
  // See RelayResolverShadowMagicFragment-test for why this dev hash-staleness
  // warning fires for magic-fragment root fragments; harmless, declared optional.
  expectConsoleErrorWillFire(
    "The definition of 'ShadowWeakDuoResolver_RootFragment' appears to have changed.",
    {optional: true},
  );
});

test('reads the ShadowWeakAlpha arm off __relay_model_instance', () => {
  function RootComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query RelayResolverShadowWeakInterfaceTestAlphaQuery {
          shadow_weak_duo(pick_beta: false) {
            label
          }
        }
      `,
      {},
      {fetchPolicy: 'store-only'},
    );
    return data.shadow_weak_duo?.label;
  }
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <RootComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('alpha from Menlo Park');
});

test('reads the ShadowWeakBeta arm off __relay_model_instance', () => {
  function RootComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query RelayResolverShadowWeakInterfaceTestBetaQuery {
          shadow_weak_duo(pick_beta: true) {
            label
          }
        }
      `,
      {},
      {fetchPolicy: 'store-only'},
    );
    return data.shadow_weak_duo?.label;
  }
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <RootComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('beta from Menlo Park');
});
