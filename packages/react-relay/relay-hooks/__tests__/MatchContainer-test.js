/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {MatchPointer} from '../MatchContainer';

const MatchContainer = require('../MatchContainer');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const {FRAGMENT_OWNER_KEY, FRAGMENTS_KEY, ID_KEY} = require('relay-runtime');

function createMatchPointer({
  id,
  fragment,
  variables,
  propName,
  module,
}: {
  fragment: {name: string},
  id: string,
  module: string,
  propName: string,
  variables: any,
}): MatchPointer {
  const pointer = {
    $fragmentSpreads: {},
    [ID_KEY]: id,
    [FRAGMENTS_KEY]: ({}: {[string]: {...}}),
    [FRAGMENT_OWNER_KEY]: null,
    __fragmentPropName: propName,
    __module_component: module,
  };
  if (fragment != null && variables != null) {
    pointer[FRAGMENTS_KEY][fragment.name] = variables;
  }
  return pointer;
}

describe('MatchContainer', () => {
  let ActorComponent;
  let UserComponent;
  let loader;

  beforeEach(() => {
    jest.resetModules();

    loader = jest.fn<
      [mixed],
      React.AbstractComponent<any | {otherProp: string}, any>,
    >();
    // $FlowFixMe[missing-local-annot] error found when enabling Flow LTI mode
    UserComponent = jest.fn(props => (
      <div>
        <h1>User</h1>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </div>
    ));
    // $FlowFixMe[missing-local-annot] error found when enabling Flow LTI mode
    ActorComponent = jest.fn(props => (
      <div>
        <h1>Actor</h1>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </div>
    ));
  });

  it('throws when match prop is null', async () => {
    // This prevents console.error output in the test, which is expected
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await expect(async () => {
      await TestRenderer.act(() => {
        TestRenderer.create(
          <MatchContainer loader={loader} match={(42: $FlowFixMe)} />,
        );
      });
    }).rejects.toThrow(
      'MatchContainer: Expected `match` value to be an object or null/undefined.',
    );
  });

  it('loads and renders dynamic components', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const match = createMatchPointer({
      id: '4',
      fragment: {name: 'UserFragment'},
      variables: {},
      propName: 'user',
      module: 'UserContainer.react',
    });
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer
          loader={loader}
          match={match}
          props={{otherProp: 'hello!'}}
        />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(1);
    expect(UserComponent).toBeCalledTimes(1);
  });

  it('reloads if new props have a different component', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const match = createMatchPointer({
      id: '4',
      fragment: {name: 'UserFragment'},
      variables: {},
      propName: 'user',
      module: 'UserContainer.react',
    });
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer
          loader={loader}
          match={match}
          props={{otherProp: 'hello!'}}
        />,
      );
    });
    loader.mockReturnValue(React.memo((ActorComponent: $FlowFixMe)));
    const match2 = createMatchPointer({
      id: '4',
      fragment: {name: 'ActorFragment'},
      variables: {},
      propName: 'actor',
      module: 'ActorContainer.react',
    });
    TestRenderer.act(() => {
      renderer.update(
        <MatchContainer
          loader={loader}
          match={match2}
          props={{otherProp: 'hello!'}}
        />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(2);
    expect(UserComponent).toBeCalledTimes(1);
    expect(ActorComponent).toBeCalledTimes(1);
  });

  it('calls load again when re-rendered, even with the same component', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const match = createMatchPointer({
      id: '4',
      fragment: {name: 'UserFragment'},
      variables: {},
      propName: 'user',
      module: 'UserContainer.react',
    });
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer
          loader={loader}
          match={match}
          props={{otherProp: 'hello!'}}
        />,
      );
    });
    const match2 = {...match, __id: '0'};
    TestRenderer.act(() => {
      renderer.update(
        <MatchContainer
          loader={loader}
          match={match2}
          props={{otherProp: 'hello!'}}
        />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    // We expect loader to already be caching module results
    expect(loader).toBeCalledTimes(2);
    expect(UserComponent).toBeCalledTimes(2);
    expect(ActorComponent).toBeCalledTimes(0);
  });

  it('passes the same child props when the match values does not change', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const match = createMatchPointer({
      id: '4',
      fragment: {name: 'UserFragment'},
      variables: {},
      propName: 'user',
      module: 'UserContainer.react',
    });
    const otherProps = {otherProp: 'hello!'};
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer loader={loader} match={match} props={otherProps} />,
      );
    });
    const match2 = {...match};
    TestRenderer.act(() => {
      renderer.update(
        <MatchContainer loader={loader} match={match2} props={otherProps} />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(2);
    expect(UserComponent).toBeCalledTimes(1);
  });

  it('renders the fallback if the match object is empty', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const otherProps = {otherProp: 'hello!'};
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer
          loader={loader}
          match={({}: $FlowFixMe)} // intentionally empty
          props={otherProps}
          fallback={(<Fallback />: $FlowFixMe)}
        />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(0);
    expect(UserComponent).toBeCalledTimes(0);
    expect(ActorComponent).toBeCalledTimes(0);
    expect(Fallback).toBeCalledTimes(1);
  });

  it('renders the fallback if the match object is missing expected fields', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const otherProps = {otherProp: 'hello!'};
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer
          loader={loader}
          match={
            ({
              __id: null,
              __fragments: null,
              __fragmentPropName: null,
              __fragmentOwner: null,
              __module_component: null,
            }: $FlowFixMe)
          } // intentionally all null
          props={otherProps}
          fallback={(<Fallback />: $FlowFixMe)}
        />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(0);
    expect(UserComponent).toBeCalledTimes(0);
    expect(ActorComponent).toBeCalledTimes(0);
    expect(Fallback).toBeCalledTimes(1);
  });

  it('throws if the match object is invalid (__id)', async () => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const otherProps = {otherProp: 'hello!'};
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    await expect(async () => {
      await TestRenderer.act(() => {
        TestRenderer.create(
          <MatchContainer
            loader={loader}
            match={
              ({
                __id: 42, // not a string
                __fragments: null,
                __fragmentPropName: null,
                __fragmentOwner: null,
                __module_component: null,
              }: $FlowFixMe)
            } // intentionally all null
            props={otherProps}
            fallback={(<Fallback />: $FlowFixMe)}
          />,
        );
      });
    }).rejects.toThrow(
      "MatchContainer: Invalid 'match' value, expected an object that has a '...SomeFragment' spread.",
    );
  });

  it('throws if the match object is invalid (__fragments)', async () => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const otherProps = {otherProp: 'hello!'};
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    await expect(async () => {
      await TestRenderer.act(() => {
        TestRenderer.create(
          <MatchContainer
            loader={loader}
            match={
              ({
                __id: null,
                __fragments: 42, // not an object
                __fragmentPropName: null,
                __fragmentOwner: null,
                __module_component: null,
              }: $FlowFixMe)
            } // intentionally all null
            props={otherProps}
            fallback={(<Fallback />: $FlowFixMe)}
          />,
        );
      });
    }).rejects.toThrow(
      "MatchContainer: Invalid 'match' value, expected an object that has a '...SomeFragment' spread.",
    );
  });

  it('throws if the match object is invalid (__fragmentOwner)', async () => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const otherProps = {otherProp: 'hello!'};
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    await expect(async () => {
      await TestRenderer.act(() => {
        TestRenderer.create(
          <MatchContainer
            loader={loader}
            match={
              ({
                __id: null,
                __fragments: null,
                __fragmentPropName: null,
                __fragmentOwner: 42, // not an object
                __module_component: null,
              }: $FlowFixMe)
            } // intentionally all null
            props={otherProps}
            fallback={(<Fallback />: $FlowFixMe)}
          />,
        );
      });
    }).rejects.toThrow(
      "MatchContainer: Invalid 'match' value, expected an object that has a '...SomeFragment' spread.",
    );
  });

  it('throws if the match object is invalid (__fragmentPropName)', async () => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const otherProps = {otherProp: 'hello!'};
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    await expect(async () => {
      await TestRenderer.act(() => {
        TestRenderer.create(
          <MatchContainer
            loader={loader}
            match={
              ({
                __id: null,
                __fragments: null,
                __fragmentPropName: 42, // not a string
                __fragmentOwner: null,
                __module_component: null,
              }: $FlowFixMe)
            } // intentionally all null
            props={otherProps}
            fallback={(<Fallback />: $FlowFixMe)}
          />,
        );
      });
    }).rejects.toThrow(
      "MatchContainer: Invalid 'match' value, expected an object that has a '...SomeFragment' spread.",
    );
  });

  it('renders the fallback if the match value is null', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const otherProps = {otherProp: 'hello!'};
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer
          loader={loader}
          match={null}
          props={otherProps}
          fallback={(<Fallback />: $FlowFixMe)}
        />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(0);
    expect(UserComponent).toBeCalledTimes(0);
    expect(ActorComponent).toBeCalledTimes(0);
    expect(Fallback).toBeCalledTimes(1);
  });

  it('renders null if the match value is null and no fallback is provided', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const otherProps = {otherProp: 'hello!'};
    const renderer = TestRenderer.create(
      <MatchContainer loader={loader} match={null} props={otherProps} />,
    );
    expect(renderer.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(0);
    expect(UserComponent).toBeCalledTimes(0);
    expect(ActorComponent).toBeCalledTimes(0);
  });

  it('renders the fallback if the match value is undefined', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const otherProps = {otherProp: 'hello!'};
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer
          loader={loader}
          match={undefined}
          props={otherProps}
          fallback={(<Fallback />: $FlowFixMe)}
        />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(0);
    expect(UserComponent).toBeCalledTimes(0);
    expect(ActorComponent).toBeCalledTimes(0);
    expect(Fallback).toBeCalledTimes(1);
  });

  it('transitions from fallback when new props have a component', () => {
    loader.mockReturnValue(React.memo((UserComponent: $FlowFixMe)));
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer
          loader={loader}
          match={({}: $FlowFixMe)} // intentionally empty
          props={{otherProp: 'hello!'}}
          fallback={<Fallback />}
        />,
      );
    });
    expect(Fallback).toBeCalledTimes(1);
    loader.mockReturnValue(React.memo((ActorComponent: $FlowFixMe)));
    const match2 = createMatchPointer({
      id: '4',
      fragment: {name: 'ActorFragment'},
      variables: {},
      propName: 'actor',
      module: 'ActorContainer.react',
    });

    TestRenderer.act(() => {
      renderer.update(
        <MatchContainer
          loader={loader}
          match={match2}
          props={{otherProp: 'hello!'}}
          fallback={<Fallback />}
        />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(1);
    expect(UserComponent).toBeCalledTimes(0);
    expect(ActorComponent).toBeCalledTimes(1);
  });

  it('transitions to fallback when new props have a null component', () => {
    loader.mockReturnValue(React.memo((ActorComponent: $FlowFixMe)));
    const match = createMatchPointer({
      id: '4',
      fragment: {name: 'ActorFragment'},
      variables: {},
      propName: 'actor',
      module: 'ActorContainer.react',
    });
    const Fallback: $FlowFixMe = jest.fn(() => <div>fallback</div>);
    let renderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MatchContainer
          loader={loader}
          match={match}
          props={{otherProp: 'hello!'}}
          fallback={<Fallback />}
        />,
      );
    });
    expect(ActorComponent).toBeCalledTimes(1);
    TestRenderer.act(() => {
      renderer.update(
        <MatchContainer
          loader={loader}
          match={({}: $FlowFixMe)} // intentionally empty
          props={{otherProp: 'hello!'}}
          fallback={<Fallback />}
        />,
      );
    });
    expect(renderer?.toJSON()).toMatchSnapshot();
    expect(loader).toBeCalledTimes(1);
    expect(Fallback).toBeCalledTimes(1);
    expect(UserComponent).toBeCalledTimes(0);
  });
});
