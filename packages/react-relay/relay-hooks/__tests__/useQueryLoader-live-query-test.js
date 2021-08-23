/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');

const useQueryLoader = require('../useQueryLoader');

const {graphql, getRequest} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils-internal');

import type {GraphQLTaggedNode} from 'relay-runtime';

const query: GraphQLTaggedNode = graphql`
  query useQueryLoaderLiveQueryTestQuery($id: ID!)
    @live_query(polling_interval: 10000) {
    node(id: $id) {
      id
    }
  }
`;
const generatedQuery = getRequest(query);
const defaultOptions = {};

let renderCount;
let loadedQuery;
let instance;
let queryLoaderCallback;
let dispose;
let disposeQuery;

let render;
let update;
let Container;
let environment;

const loadQuery = jest.fn().mockImplementation(() => {
  dispose = jest.fn();
  return {
    dispose,
  };
});

jest.mock('../loadQuery', () => ({
  loadQuery,
  useTrackLoadQueryInRender: () => {},
}));

beforeEach(() => {
  renderCount = undefined;
  dispose = undefined;
  environment = createMockEnvironment();
  render = function(initialPreloadedQuery) {
    renderCount = 0;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        <Container initialPreloadedQuery={initialPreloadedQuery} />,
      );
    });
  };

  update = function(initialPreloadedQuery) {
    ReactTestRenderer.act(() => {
      instance.update(
        <Container initialPreloadedQuery={initialPreloadedQuery} />,
      );
    });
  };

  const Inner = function({initialPreloadedQuery}) {
    renderCount = (renderCount || 0) + 1;
    [loadedQuery, queryLoaderCallback, disposeQuery] = useQueryLoader(
      generatedQuery,
      // $FlowExpectedError[incompatible-call] it's ok to pass our fake preloaded query here
      initialPreloadedQuery,
    );
    return null;
  };

  Container = function({initialPreloadedQuery = undefined}) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <Inner initialPreloadedQuery={initialPreloadedQuery} />
      </RelayEnvironmentProvider>
    );
  };

  loadQuery.mockClear();
});

afterAll(() => {
  jest.clearAllMocks();
});

it('releases and cancels the old preloaded query and calls loadQuery anew if the callback is called again', () => {
  render();

  const variables = {id: '4'};
  ReactTestRenderer.act(() => queryLoaderCallback(variables));
  ReactTestRenderer.act(() => jest.runAllImmediates());
  expect(loadQuery).toHaveBeenCalledTimes(1);

  const currentDispose = dispose;
  expect(currentDispose).not.toHaveBeenCalled();

  ReactTestRenderer.act(() => queryLoaderCallback(variables, defaultOptions));
  expect(currentDispose).toHaveBeenCalled();

  expect(loadQuery).toHaveBeenCalledTimes(2);
  expect(loadQuery.mock.calls[1][0]).toBe(environment);
  expect(loadQuery.mock.calls[1][1]).toBe(generatedQuery);
  expect(loadQuery.mock.calls[1][2]).toBe(variables);
  expect(loadQuery.mock.calls[1][3]).toBe(defaultOptions);
});

it('releases and cancels the old preloaded query and calls loadQuery anew if the callback is called again with new variables', () => {
  render();

  const variables = {id: '4'};
  ReactTestRenderer.act(() => queryLoaderCallback(variables));
  expect(loadQuery).toHaveBeenCalledTimes(1);

  const currentDispose = dispose;
  expect(currentDispose).not.toHaveBeenCalled();

  const variables2 = {id: '5'};
  ReactTestRenderer.act(() => queryLoaderCallback(variables2, defaultOptions));

  expect(currentDispose).toHaveBeenCalled();
  expect(loadQuery).toHaveBeenCalledTimes(2);
  expect(loadQuery.mock.calls[1][0]).toBe(environment);
  expect(loadQuery.mock.calls[1][1]).toBe(generatedQuery);
  expect(loadQuery.mock.calls[1][2]).toBe(variables2);
  expect(loadQuery.mock.calls[1][3]).toBe(defaultOptions);
});

it('releases and cancels the preloaded query if the component unmounts', () => {
  render();
  const variables = {id: '4'};
  ReactTestRenderer.act(() => queryLoaderCallback(variables));
  expect(dispose).toHaveBeenCalledTimes(0);
  ReactTestRenderer.act(() => instance.unmount());
  expect(dispose).toHaveBeenCalledTimes(1);
});

it('releases and cancels the query and nullifies the state when the disposeQuery callback is called', () => {
  render();
  const variables = {id: '4'};
  ReactTestRenderer.act(() => queryLoaderCallback(variables));
  expect(disposeQuery).toBeDefined();
  if (disposeQuery) {
    expect(loadedQuery).not.toBe(null);
    expect(dispose).not.toHaveBeenCalled();
    ReactTestRenderer.act(disposeQuery);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(loadedQuery).toBe(null);
  }
});

describe('when an initial preloaded query is passed', () => {
  it('releases and cancels the old preloaded query and calls loadQuery anew if the callback is called again', () => {
    const initialPreloadedQuery = loadQuery();
    loadQuery.mockClear();
    render(initialPreloadedQuery);

    const firstDispose = dispose;
    expect(firstDispose).not.toHaveBeenCalled();

    const variables = {id: '4'};
    ReactTestRenderer.act(() => queryLoaderCallback(variables));
    expect(loadQuery).toHaveBeenCalledTimes(1);
    expect(firstDispose).toHaveBeenCalled();

    const secondDispose = dispose;
    expect(secondDispose).not.toHaveBeenCalled();

    ReactTestRenderer.act(() => queryLoaderCallback(variables, defaultOptions));

    expect(loadQuery).toHaveBeenCalledTimes(2);
    expect(secondDispose).toHaveBeenCalled();
  });

  it('releases and cancels the old preloaded query if a new initial preloaded query is passed', () => {
    const initialPreloadedQuery = loadQuery();
    loadQuery.mockClear();
    render(initialPreloadedQuery);

    const firstDispose = dispose;
    expect(firstDispose).not.toHaveBeenCalled();

    const secondInitialPreloadedQuery = loadQuery();
    const secondDispose = dispose;

    update(secondInitialPreloadedQuery);

    expect(firstDispose).toHaveBeenCalled();
    expect(secondDispose).not.toHaveBeenCalled();

    const variables = {id: '4'};
    ReactTestRenderer.act(() => queryLoaderCallback(variables, defaultOptions));

    expect(secondDispose).toHaveBeenCalled();
  });

  it('releases and cancels query references after empty query references are passed', () => {
    const initialPreloadedQuery = loadQuery();
    loadQuery.mockClear();
    render(initialPreloadedQuery);

    const firstDispose = dispose;
    expect(firstDispose).not.toHaveBeenCalled();

    update(undefined);

    expect(firstDispose).toHaveBeenCalled();

    const secondInitialPreloadedQuery = loadQuery();
    const secondDispose = dispose;

    update(secondInitialPreloadedQuery);

    expect(secondDispose).not.toHaveBeenCalled();

    update(undefined);

    expect(secondDispose).toHaveBeenCalled();
  });

  it('releases and cancels the preloaded query if the component unmounts', () => {
    const initialPreloadedQuery = loadQuery();
    render(initialPreloadedQuery);

    const currentDispose = dispose;
    expect(currentDispose).not.toHaveBeenCalled();
    ReactTestRenderer.act(() => instance.unmount());
    expect(currentDispose).toHaveBeenCalled();
  });

  it('releases and cancels all preloaded queries if the component unmounts', () => {
    const firstInitialPreloadedQuery = loadQuery();
    const firstDispose = dispose;
    render(firstInitialPreloadedQuery);

    const secondInitialPreloadedQuery = loadQuery();
    const secondDispose = dispose;

    update(secondInitialPreloadedQuery);

    expect(firstDispose).toHaveBeenCalled();

    ReactTestRenderer.act(() => instance.unmount());
    expect(secondDispose).toHaveBeenCalled();
  });

  it('releases and cancels the query and nullifies the state when the disposeQuery callback is called', () => {
    const initialPreloadedQuery = loadQuery();
    render(initialPreloadedQuery);

    expect(disposeQuery).toBeDefined();
    if (disposeQuery) {
      expect(loadedQuery).toBe(initialPreloadedQuery);
      const currentDispose = dispose;
      expect(currentDispose).not.toHaveBeenCalled();
      ReactTestRenderer.act(disposeQuery);
      expect(loadedQuery).toBe(null);
      expect(currentDispose).toHaveBeenCalled();
    }
  });
});

beforeEach(() => {
  jest.mock('scheduler', () => require('scheduler/unstable_mock'));
});

afterEach(() => {
  jest.dontMock('scheduler');
});

it('does not release or cancel the query before the new component tree unsuspends in concurrent mode', () => {
  if (typeof React.startTransition === 'function') {
    let resolve;
    let resolved = false;
    const suspensePromise = new Promise(
      _resolve =>
        (resolve = () => {
          resolved = true;
          _resolve();
        }),
    );

    function ComponentThatSuspends() {
      if (resolved) {
        return null;
      }
      throw suspensePromise;
    }

    function ComponentWithQuery() {
      [, queryLoaderCallback] = useQueryLoader(generatedQuery);
      return null;
    }

    function concurrentRender() {
      ReactTestRenderer.act(() => {
        instance = ReactTestRenderer.create(
          <RelayEnvironmentProvider environment={environment}>
            <ConcurrentWrapper />
          </RelayEnvironmentProvider>,
          // $FlowFixMe[prop-missing] - error revealed when flow-typing ReactTestRenderer
          {unstable_isConcurrent: true},
        );
      });
    }

    let transitionToSecondRoute;
    function ConcurrentWrapper() {
      const [route, setRoute] = React.useState('FIRST');

      transitionToSecondRoute = () =>
        React.startTransition(() => setRoute('SECOND'));

      return (
        <React.Suspense fallback="fallback">
          <Router route={route} />
        </React.Suspense>
      );
    }

    function Router({route}) {
      if (route === 'FIRST') {
        return <ComponentWithQuery />;
      } else {
        return <ComponentThatSuspends />;
      }
    }

    concurrentRender();

    ReactTestRenderer.act(() => queryLoaderCallback({id: '4'}));
    const currentDispose = dispose;

    ReactTestRenderer.act(() => transitionToSecondRoute());

    // currentDispose will have been called in non-concurrent mode
    expect(currentDispose).not.toHaveBeenCalled();

    ReactTestRenderer.act(() => {
      resolve && resolve();
      jest.runAllImmediates();
    });

    expect(currentDispose).toHaveBeenCalled();
  }
});

it('releases and cancels query references associated with previous suspensions when multiple state changes trigger suspense and the final suspension concludes', () => {
  // Three state changes and calls to loadQuery: A, B, C, each causing suspense
  // When C unsuspends, A and B's queries are disposed.

  if (typeof React.startTransition === 'function') {
    let resolve;
    let resolved = false;
    const resolvableSuspensePromise = new Promise(
      _resolve =>
        (resolve = () => {
          resolved = true;
          _resolve();
        }),
    );

    const unresolvablePromise = new Promise(() => {});
    const unresolvablePromise2 = new Promise(() => {});

    function concurrentRender() {
      ReactTestRenderer.act(() => {
        instance = ReactTestRenderer.create(
          <RelayEnvironmentProvider environment={environment}>
            <ConcurrentWrapper />
          </RelayEnvironmentProvider>,
          // $FlowFixMe[prop-missing] - error revealed when flow-typing ReactTestRenderer
          {unstable_isConcurrent: true},
        );
      });
    }

    let triggerStateChange: any;
    function ConcurrentWrapper() {
      const [promise, setPromise] = React.useState(null);

      triggerStateChange = (newPromise, newName) =>
        React.startTransition(() => {
          queryLoaderCallback({});
          setPromise(newPromise);
        });

      return (
        <React.Suspense fallback="fallback">
          <InnerConcurrent promise={promise} />
        </React.Suspense>
      );
    }

    function InnerConcurrent({promise}) {
      [, queryLoaderCallback] = useQueryLoader(generatedQuery);
      if (
        promise == null ||
        (promise === resolvableSuspensePromise && resolved)
      ) {
        return null;
      }
      throw promise;
    }

    concurrentRender();
    expect(instance.toJSON()).toEqual(null);

    const initialStateChange: any = triggerStateChange;

    ReactTestRenderer.act(() => {
      initialStateChange(unresolvablePromise);
    });
    jest.runOnlyPendingTimers(); // Trigger transition.
    expect(loadQuery).toHaveBeenCalledTimes(1);
    const firstDispose = dispose;

    ReactTestRenderer.act(() => {
      initialStateChange(unresolvablePromise2);
    });
    jest.runOnlyPendingTimers(); // Trigger transition.
    expect(loadQuery).toHaveBeenCalledTimes(2);
    const secondDispose = dispose;

    ReactTestRenderer.act(() => {
      initialStateChange(resolvableSuspensePromise);
    });
    jest.runOnlyPendingTimers(); // Trigger transition.
    expect(loadQuery).toHaveBeenCalledTimes(3);
    const thirdDispose = dispose;

    expect(firstDispose).not.toHaveBeenCalled();
    expect(secondDispose).not.toHaveBeenCalled();

    ReactTestRenderer.act(() => {
      resolve();
      jest.runAllImmediates();
    });
    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(secondDispose).toHaveBeenCalledTimes(1);
    expect(thirdDispose).not.toHaveBeenCalled();
  }
});

it('releases and cancels query references associated with subsequent suspensions when multiple state changes trigger suspense and the initial suspension concludes', () => {
  // Three state changes and calls to loadQuery: A, B, C, each causing suspense
  // When A unsuspends, B and C's queries do not get disposed.

  if (typeof React.startTransition === 'function') {
    let resolve;
    let resolved = false;
    const resolvableSuspensePromise = new Promise(
      _resolve =>
        (resolve = () => {
          resolved = true;
          _resolve();
        }),
    );

    const unresolvablePromise = new Promise(() => {});
    const unresolvablePromise2 = new Promise(() => {});

    function concurrentRender() {
      ReactTestRenderer.act(() => {
        instance = ReactTestRenderer.create(
          <ConcurrentWrapper />,
          // $FlowFixMe[prop-missing] - error revealed when flow-typing ReactTestRenderer
          {unstable_isConcurrent: true},
        );
      });
    }

    let triggerStateChange: any;
    function ConcurrentWrapper() {
      const [promise, setPromise] = React.useState(null);

      triggerStateChange = (newPromise, newName) =>
        React.startTransition(() => {
          queryLoaderCallback({});
          setPromise(newPromise);
        });

      return (
        <RelayEnvironmentProvider environment={environment}>
          <React.Suspense fallback="fallback">
            <InnerConcurrent promise={promise} />
          </React.Suspense>
        </RelayEnvironmentProvider>
      );
    }

    let innerUnsuspendedCorrectly = false;
    function InnerConcurrent({promise}) {
      [, queryLoaderCallback] = useQueryLoader(generatedQuery);
      if (
        promise == null ||
        (promise === resolvableSuspensePromise && resolved)
      ) {
        innerUnsuspendedCorrectly = true;
        return null;
      }
      throw promise;
    }

    concurrentRender();
    expect(instance.toJSON()).toEqual(null);

    const initialStateChange: any = triggerStateChange;

    ReactTestRenderer.act(() => {
      initialStateChange(resolvableSuspensePromise);
    });

    jest.runOnlyPendingTimers(); // Trigger transition.
    expect(loadQuery).toHaveBeenCalledTimes(1);
    const firstDispose = dispose;

    ReactTestRenderer.act(() => {
      initialStateChange(unresolvablePromise);
    });
    expect(loadQuery).toHaveBeenCalledTimes(2);
    const secondDispose = dispose;

    ReactTestRenderer.act(() => {
      initialStateChange(unresolvablePromise2);
    });
    const thirdDispose = dispose;

    ReactTestRenderer.act(() => {
      resolve();
      jest.runAllImmediates();
    });
    expect(innerUnsuspendedCorrectly).toEqual(true);
    expect(firstDispose).not.toHaveBeenCalled();
    expect(secondDispose).not.toHaveBeenCalled();
    expect(thirdDispose).not.toHaveBeenCalled();
  }
});

it('should release and cancel prior queries if the callback is called multiple times in the same tick', () => {
  render();
  let firstDispose;
  ReactTestRenderer.act(() => {
    queryLoaderCallback({});
    firstDispose = dispose;
    queryLoaderCallback({});
  });
  expect(loadQuery).toHaveBeenCalledTimes(2);
  expect(firstDispose).toHaveBeenCalledTimes(1);
});

it('should release and cancel queries on unmount if the callback is called, the component suspends and then unmounts', () => {
  let shouldSuspend;
  let setShouldSuspend;
  const suspensePromise = new Promise(() => {});
  function SuspendingComponent() {
    [shouldSuspend, setShouldSuspend] = React.useState(false);
    if (shouldSuspend) {
      throw suspensePromise;
    }
    return null;
  }
  function Outer() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="fallback">
          <SuspendingComponent />
          <Container />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  const outerInstance = ReactTestRenderer.create(<Outer />);
  expect(renderCount).toEqual(1);
  ReactTestRenderer.act(() => {
    queryLoaderCallback({});
  });
  expect(renderCount).toEqual(2);
  ReactTestRenderer.act(() => {
    setShouldSuspend(true);
  });
  expect(renderCount).toEqual(2);
  expect(outerInstance.toJSON()).toEqual('fallback');
  expect(dispose).not.toHaveBeenCalled();
  ReactTestRenderer.act(() => outerInstance.unmount());
  expect(dispose).toHaveBeenCalledTimes(1);
});

it('releases and cancels all queries if a the callback is called, the component suspends, another query is called and then the component unmounts', () => {
  let shouldSuspend;
  let setShouldSuspend;
  const suspensePromise = new Promise(() => {});
  function SuspendingComponent() {
    [shouldSuspend, setShouldSuspend] = React.useState(false);
    if (shouldSuspend) {
      throw suspensePromise;
    }
    return null;
  }
  function Outer() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="fallback">
          <SuspendingComponent />
          <Container />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  const outerInstance = ReactTestRenderer.create(<Outer />);
  expect(renderCount).toEqual(1);
  ReactTestRenderer.act(() => {
    queryLoaderCallback({});
  });
  expect(renderCount).toEqual(2);
  const firstDispose = dispose;
  ReactTestRenderer.act(() => {
    setShouldSuspend(true);
  });
  expect(renderCount).toEqual(2);
  expect(firstDispose).not.toHaveBeenCalled();
  expect(outerInstance.toJSON()).toEqual('fallback');

  ReactTestRenderer.act(() => {
    queryLoaderCallback({});
  });
  const secondDispose = dispose;
  expect(renderCount).toEqual(3);
  expect(outerInstance.toJSON()).toEqual('fallback');
  expect(firstDispose).toHaveBeenCalledTimes(1);
  expect(secondDispose).not.toHaveBeenCalled();
  ReactTestRenderer.act(() => outerInstance.unmount());
  expect(secondDispose).toHaveBeenCalledTimes(1);
});

it('releases and cancels all queries if the component suspends, another query is loaded and then the component unmounts', () => {
  let shouldSuspend;
  let setShouldSuspend;
  const suspensePromise = new Promise(() => {});
  function SuspendingComponent() {
    [shouldSuspend, setShouldSuspend] = React.useState(false);
    if (shouldSuspend) {
      throw suspensePromise;
    }
    return null;
  }
  function Outer() {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="fallback">
          <SuspendingComponent />
          <Container />
        </React.Suspense>
      </RelayEnvironmentProvider>
    );
  }

  const outerInstance = ReactTestRenderer.create(<Outer />);
  expect(renderCount).toEqual(1);
  ReactTestRenderer.act(() => {
    setShouldSuspend(true);
  });
  expect(renderCount).toEqual(1);
  expect(outerInstance.toJSON()).toEqual('fallback');
  ReactTestRenderer.act(() => {
    queryLoaderCallback({});
  });

  expect(renderCount).toEqual(2);
  expect(outerInstance.toJSON()).toEqual('fallback');
  expect(dispose).not.toHaveBeenCalled();
  ReactTestRenderer.act(() => outerInstance.unmount());
  expect(dispose).toHaveBeenCalledTimes(1);
});

it('releases and cancels the query on unmount if the component unmounts and then the callback is called before rendering', () => {
  // Case 1: unmount, then loadQuery
  render();
  expect(renderCount).toEqual(1);
  ReactTestRenderer.act(() => {
    instance.unmount();
    queryLoaderCallback({});
    expect(dispose).not.toHaveBeenCalled();
  });
  expect(dispose).toHaveBeenCalledTimes(1);
  expect(renderCount).toEqual(1); // renderCount === 1 ensures that an extra commit hasn't occurred
});

it('releases and cancels the query on unmount if the callback is called and the component unmounts before rendering', () => {
  // Case 2: loadQuery, then unmount
  render();
  expect(renderCount).toEqual(1);
  ReactTestRenderer.act(() => {
    queryLoaderCallback({});
    expect(dispose).not.toHaveBeenCalled();
    instance.unmount();
  });
  expect(dispose).toHaveBeenCalledTimes(1);
  expect(renderCount).toEqual(1); // renderCount === 1 ensures that an extra commit hasn't occurred
});
