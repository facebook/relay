/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

'use strict';

export opaque type ActorChangePoint<TFragmentRef> = {
  __actorFragmentRef: TFragmentRef,
};

type ActorChangeProps<TFragmentRef, TOtherProps> = {
  actorChange: ActorChangePoint<TFragmentRef>,
  otherProps: TOtherProps,
};

function ActorChange<TFragmentRef, TOtherProps>(
  props: ActorChangeProps<TFragmentRef, TOtherProps>,
) {
  throw new Error('ActorChange: Not Implemented.');
}

module.exports = ActorChange;
