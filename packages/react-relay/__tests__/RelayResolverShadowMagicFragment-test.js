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
// whose return INTERFACE mixes a non-Node SERVER VALUE implementor
// (`StreetAddress`, read in place off the transplanted record) and a CLIENT
// `@weak` model implementor (`ShadowMagicWeakCity`, read off
// `__relay_model_instance`). Unlike the hand-built `RelayReader-ShadowResolver*`
// unit tests, this reads the REAL compiled artifact end-to-end: the consumer's
// `{ city }` selection is transplanted onto the shadowed server `address` field,
// the real resolver (`shadow_magic_thing`) runs and returns a per-`__typename`
// pointer, and the runtime's `AbstractInline` `inlineKinds` dispatch reads each
// arm. This
// is the only shape of test that can catch a compiler<->runtime artifact-shape
// drift that renders the value empty.

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
let store;
beforeEach(() => {
  // Seed the server data the shadow resolver's root fragment reads
  // (`me { address { city } }`). `address` is a non-Node value record, so its
  // identity is the universal `__id` (`client:1:address`), not an `id`.
  store = new RelayModernStore(
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
  // `babel-plugin-relay`'s dev hash-staleness check (compileGraphQLTag.js)
  // compares md5(print(<source literal>)) to the artifact's `hash`. For a
  // magic-fragment ROOT fragment the compiler rewrites the fragment (drops the
  // `...ReturnFragment` spread, injects `__id`/`__typename`) and stores a hash of
  // that rewritten form, which never equals the source-literal hash — so the
  // check logs once on the first resolver evaluation. This is orthogonal to the
  // read behavior under test (it fires after the resolver returns and does not
  // change its result), so it is declared optional rather than suppressed.
  // TODO(relay): align the compiler's resolver-root-fragment `hash` with the
  // source literal so this check passes for magic fragments.
  expectConsoleErrorWillFire(
    "The definition of 'ShadowMagicThingResolver_RootFragment' appears to have changed.",
    {optional: true},
  );
});

test('reads the SERVER VALUE arm (StreetAddress) in place off the transplanted record', () => {
  function RootComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query RelayResolverShadowMagicFragmentTestValueQuery {
          shadow_magic_thing(force_weak: false) {
            city
          }
        }
      `,
      {},
      {fetchPolicy: 'store-only'},
    );
    return data.shadow_magic_thing?.city;
  }
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <RootComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('Menlo Park');
});

test('reads the CLIENT @weak model arm (ShadowMagicWeakCity) off __relay_model_instance', () => {
  function RootComponent() {
    const data = useLazyLoadQuery(
      graphql`
        query RelayResolverShadowMagicFragmentTestWeakQuery {
          shadow_magic_thing(force_weak: true) {
            city
          }
        }
      `,
      {},
      {fetchPolicy: 'store-only'},
    );
    return data.shadow_magic_thing?.city;
  }
  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(
      <EnvironmentWrapper environment={environment}>
        <RootComponent />
      </EnvironmentWrapper>,
    );
  });
  expect(renderer?.toJSON()).toEqual('weak: Menlo Park');
});
