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

// This must come first
import {
  patchReactCreateContext,
  patchReactCurrentDispatcher,
} from 'RelayFlightReactPolyfill.server';
import RelayFlightRendererTask from 'RelayFlightRendererTask.server';

import * as React from 'react';
import {useContext} from 'react';
import warning from 'warning';

patchReactCreateContext();

beforeEach(() => {
  jest.mock('warning');
});

function createTask(Root: () => React.Node) {
  const Wrapper = () => {
    patchReactCurrentDispatcher();
    return <Root />;
  };
  const task = new RelayFlightRendererTask(String(0), Wrapper);
  task.render();
  return task;
}

test('useContext with no provider returns default value', () => {
  const Context = React.createContext('<default>');
  function Root() {
    const value = useContext(Context);
    return value;
  }
  const task = createTask(Root);
  const output = task.poll();
  expect(JSON.stringify(output)).toContain('<default>');
  expect(warning).toBeCalledWith(
    false,
    'No value was set for this context, using the default value.',
  );
});

test('useContext returns value from provider', () => {
  const Context = React.createContext('<default>');
  function Root() {
    return (
      <Context.Provider value="<overridden>">
        <Child />
      </Context.Provider>
    );
  }
  function Child() {
    const value = useContext(Context);
    return value;
  }
  const task = createTask(Root);
  const output = task.poll();
  expect(JSON.stringify(output)).toContain('<overridden>');
});

test('useContext returns values for different contexts', () => {
  const Context = React.createContext(null);
  const OtherContext = React.createContext(null);
  function Root() {
    return (
      <Context.Provider value="hello">
        <OtherContext.Provider value={42}>
          <Child />
        </OtherContext.Provider>
      </Context.Provider>
    );
  }
  function Child() {
    const value = useContext(Context);
    const otherValue = useContext(OtherContext);
    expect(value).toBe('hello');
    expect(otherValue).toBe(42);
    return 'ok';
  }
  const task = createTask(Root);
  const output = task.poll();
  expect(JSON.stringify(output)).toContain('ok');
});

test('Nested providers for the same context throws', () => {
  const mockedConsole = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  const Context = React.createContext(null);
  function Root() {
    return (
      <Context.Provider value="hello">
        <Context.Provider value="goodbye">
          <Child />
        </Context.Provider>
      </Context.Provider>
    );
  }
  function Child() {
    // unreachable
  }
  const task = createTask(Root);
  const output = task.poll();
  expect(JSON.stringify(output)).toContain(
    'A value was already set for this context by a parent',
  );
  expect(mockedConsole).toBeCalledWith(expect.any(Error));
});
