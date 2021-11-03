/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {Variables} from 'relay-runtime';

const areEqual = require('areEqual');
const React = require('react');

const {useMemo, useRef, useState} = React;

function useMemoVariables<TVariables: Variables | null>(
  variables: TVariables,
): [TVariables, number] {
  // The value of this ref is a counter that should be incremented when
  // variables change. This allows us to use the counter as a
  // memoization value to indicate if the computation for useMemo
  // should be re-executed.
  const variablesChangedGenerationRef = useRef(0);

  // We mirror the variables to check if they have changed between renders
  const [mirroredVariables, setMirroredVariables] = useState<Variables | null>(
    variables,
  );

  const variablesChanged = !areEqual(variables, mirroredVariables);
  if (variablesChanged) {
    variablesChangedGenerationRef.current =
      (variablesChangedGenerationRef.current ?? 0) + 1;
    setMirroredVariables(variables);
  }

  // NOTE: We disable react-hooks-deps warning because we explicitly
  // don't want to memoize on object identity
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoVariables = useMemo(
    () => variables,
    [variablesChangedGenerationRef.current],
  );
  return [memoVariables, variablesChangedGenerationRef.current ?? 0];
}

module.exports = useMemoVariables;
