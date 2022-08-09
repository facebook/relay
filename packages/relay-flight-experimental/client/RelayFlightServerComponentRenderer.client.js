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

import type {ReactFlightClientResponse} from 'relay-runtime';

import * as React from 'react';
import warning from 'warning';

type Props = $ReadOnly<{
  component: ReactFlightClientResponse,
}>;

function ServerComponentRenderer(props: Props): React.MixedElement | null {
  const {component} = props;
  if (
    component == null ||
    typeof component !== 'object' ||
    typeof component.readRoot !== 'function'
  ) {
    warning(
      false,
      'ServerComponentRenderer: Expected a value returned by a React Flight field, got `%s`.',
      component,
    );
    return null;
  }
  return (component.readRoot(): $FlowFixMe);
}

export default (React.memo(
  ServerComponentRenderer,
): React$ComponentType<Props>);
