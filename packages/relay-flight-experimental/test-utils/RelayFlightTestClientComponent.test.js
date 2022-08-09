/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import type {ClientQuery} from 'RelayFlight.server';
import type {RelayFlightTestClientComponentQuery} from 'RelayFlightTestClientComponentQuery.graphql';

import {graphql, useQueryFromServer} from 'RelayFlight.client';

import * as React from 'react';

type Props = $ReadOnly<{
  query: ClientQuery<RelayFlightTestClientComponentQuery>,
}>;

const query = graphql`
  query RelayFlightTestClientComponentQuery($id: ID!)
  # WARNING: The query currently requires
  # @preloadable(hackPreloader: true) to mark the query as "root" for
  # Haste and produce the ...$Preloader.js module.
  @preloadable(hackPreloader: true) {
    user: node(id: $id) {
      ... on User {
        name
      }
    }
  }
`;

export default function RelayFlightTestClientComponent(
  props: Props,
): React.Element<'div'> {
  const data = useQueryFromServer<RelayFlightTestClientComponentQuery>(
    query,
    props.query,
  );
  return <div>{data.user?.name}</div>;
}
