/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {ReaderFragment} from 'relay-runtime';

type ReturnType<TFragmentData: mixed> = {|
  data: TFragmentData,
  disableStoreUpdates: () => void,
  enableStoreUpdates: () => void,
  shouldUpdateGeneration: number | null,
|};

const {useMemo} = require('react');

const useFragmentNodes = require('./useFragmentNodes');

function useFragmentNode<TFragmentData: mixed>(
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
  containerDisplayName: string,
): ReturnType<TFragmentData> {
  const fragmentNodes = useMemo(() => ({result: fragmentNode}), [fragmentNode]);
  const fragmentRefs = useMemo(() => ({result: fragmentRef}), [fragmentRef]);

  const {
    data,
    disableStoreUpdates,
    enableStoreUpdates,
    shouldUpdateGeneration,
  } = useFragmentNodes<{|
    result: TFragmentData,
  |}>(fragmentNodes, fragmentRefs, containerDisplayName);

  return {
    data: data.result,
    disableStoreUpdates,
    enableStoreUpdates,
    shouldUpdateGeneration,
  };
}

module.exports = useFragmentNode;
