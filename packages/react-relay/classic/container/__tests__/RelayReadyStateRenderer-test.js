/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

const React = require('React');
const ReactTestUtils = require('ReactTestUtils');
const RelayClassic = require('RelayClassic');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayReadyStateRenderer = require('RelayReadyStateRenderer');

jest.dontMock('RelayStaticContainer');
const RelayStaticContainer = require('RelayStaticContainer');

jest.dontMock('pretty-format');
const prettyFormat = require('pretty-format');

jest.dontMock('react-test-renderer');
const ReactTestRenderer = require('react-test-renderer');

describe('RelayReadyStateRenderer', () => {
  /**
   * Creates an asymmetric matcher that passes for values that are container
   * props with an optionally constrained data ID and/or fragment.
   *
   *   expect(...).toEqual(anyRecord({
   *     dataID: '123',
   *     fragment: Container.getFragment('fragmentName'),
   *   }));
   *
   */
  const anyRecord = requirements => {
    const expected = {
      __dataID__: jasmine.any(String),
      __fragments__: jasmine.any(Object),
    };
    if (requirements.hasOwnProperty('dataID')) {
      expected.__dataID__ = requirements.dataID;
    }
    if (requirements.hasOwnProperty('fragment')) {
      const concreteFragmentID = requirements.fragment.getFragment({}).id;
      expected.__fragments__ = jasmine.objectContaining({
        [concreteFragmentID]: [jasmine.any(Object)],
      });
    }
    return jasmine.objectContaining(expected);
  };

  /**
   * Pretty printer that prints top-level React elements using JSX.
   */
  const ppReactElement = element => {
    if (
      !ReactTestUtils.isElement(element) ||
      !element.type ||
      !element.type.name
    ) {
      return prettyFormat(element);
    }
    const ppProps = Object.keys(element.props)
      .map(key => {
        const value = element.props[key];
        const ppValue = prettyFormat(value);
        return ` ${key}={${ppValue.length > 120 ? '...' : ppValue}}`;
      })
      .join('');
    return `<${element.type.name}${ppProps} />`;
  };

  let defaultProps;
  let defaultReadyState;

  beforeEach(() => {
    jest.resetModules();

    const TestQueryConfig = RelayQueryConfig.genMock({
      routeName: 'TestQueryConfig',
      queries: {
        node: () => RelayClassic.QL`query { node(id: "123") }`,
      },
    });

    defaultProps = {
      Container: RelayClassic.createContainer(() => <div />, {
        fragments: {
          node: () => RelayClassic.QL`fragment on Node { id }`,
        },
      }),
      environment: new RelayEnvironment(),
      queryConfig: new TestQueryConfig(),
      retry: jest.fn(),
    };
    defaultReadyState = {
      aborted: false,
      done: false,
      error: null,
      ready: false,
      stale: false,
    };
  });

  describe('arguments', () => {
    beforeEach(() => {
      expect.extend({
        toRenderWithArgs(elementOrReadyState, expected) {
          const render = jest.fn(() => <div />);
          const element = ReactTestUtils.isElement(elementOrReadyState)
            ? React.cloneElement(elementOrReadyState, {render})
            : <RelayReadyStateRenderer
                {...defaultProps}
                readyState={elementOrReadyState}
                render={render}
              />;
          ReactTestRenderer.create(element);
          const actual = render.mock.calls[0][0];
          const pass = this.equals(actual, jasmine.objectContaining(expected));
          return {
            get message() {
              const not = pass ? ' not' : '';
              return (
                `Expected ${ppReactElement(elementOrReadyState)}${not} ` +
                `to render with arguments ${prettyFormat(expected)}. ` +
                `Instead, it rendered with arguments ${prettyFormat(actual)}.`
              );
            },
            pass,
          };
        },
      });
    });

    it('renders without `props` until it is ready', () => {
      expect(defaultReadyState).toRenderWithArgs({
        props: null,
      });
      expect({...defaultReadyState, ready: true}).toRenderWithArgs({
        props: {node: anyRecord({dataID: '123'})},
      });
    });

    it('renders with a false `done` until it is done', () => {
      expect(defaultReadyState).toRenderWithArgs({
        done: false,
      });
      expect({...defaultReadyState, done: true}).toRenderWithArgs({
        done: true,
      });
    });

    it('renders with `error` when there is an error', () => {
      expect(defaultReadyState).toRenderWithArgs({
        error: null,
      });
      const error = new Error();
      expect({...defaultReadyState, error}).toRenderWithArgs({
        error,
      });
    });

    it('renders with `props` and `error` when ready with an error', () => {
      expect(defaultReadyState).toRenderWithArgs({
        error: null,
        props: null,
      });
      const error = new Error();
      expect({...defaultReadyState, error, ready: true}).toRenderWithArgs({
        error,
        props: {node: anyRecord({dataID: '123'})},
      });
    });

    it('renders with `stale` if ready and stale', () => {
      expect(defaultReadyState).toRenderWithArgs({
        props: null,
        stale: false,
      });
      expect({
        ...defaultReadyState,
        ready: true,
        stale: true,
      }).toRenderWithArgs({
        props: {node: anyRecord({dataID: '123'})},
        stale: true,
      });
    });

    it('renders with the supplied `retry` callback', () => {
      expect(defaultReadyState).toRenderWithArgs({
        retry: defaultProps.retry,
      });
    });

    it('renders with `props` including query config variables', () => {
      const AnotherQueryConfig = RelayQueryConfig.genMock();
      const anotherQueryConfig = new AnotherQueryConfig({
        foo: 123,
        bar: 456,
      });
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          queryConfig={anotherQueryConfig}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: jasmine.objectContaining({
          foo: 123,
          bar: 456,
        }),
      });
    });

    it('updates `props` when the query config changes', () => {
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {node: anyRecord({dataID: '123'})},
      });

      const AnotherQueryConfig = RelayQueryConfig.genMock({
        routeName: 'AnotherQueryConfig',
        queries: {
          node: () => RelayClassic.QL`query { node(id: "456") }`,
        },
      });
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          queryConfig={new AnotherQueryConfig()}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {node: anyRecord({dataID: '456'})},
      });
    });

    it('updates `props` when the query results change', () => {
      const AnotherQueryConfig = RelayQueryConfig.genMock({
        routeName: 'AnotherQueryConfig',
        queries: {
          me: () => RelayClassic.QL`query { me }`,
        },
      });
      const anotherQueryConfig = new AnotherQueryConfig();
      const environment = new RelayEnvironment();
      defaultProps = {
        Container: RelayClassic.createContainer(() => <div />, {
          fragments: {
            me: () => RelayClassic.QL`fragment on User { id }`,
          },
        }),
        environment,
        queryConfig: anotherQueryConfig,
        retry: jest.fn(),
      };
      environment.getStoreData().getRecordWriter().putDataID('me', null, '123');
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          queryConfig={anotherQueryConfig}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {me: anyRecord({dataID: '123'})},
      });

      environment.getStoreData().getRecordWriter().putDataID('me', null, '456');
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          queryConfig={anotherQueryConfig}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {me: anyRecord({dataID: '456'})},
      });
    });

    it('updates `props` when the query results become non-null', () => {
      const AnotherQueryConfig = RelayQueryConfig.genMock({
        routeName: 'AnotherQueryConfig',
        queries: {
          me: () => RelayClassic.QL`query { me }`,
        },
      });
      const anotherQueryConfig = new AnotherQueryConfig();
      const environment = new RelayEnvironment();
      defaultProps = {
        Container: RelayClassic.createContainer(() => <div />, {
          fragments: {
            me: () => RelayClassic.QL`fragment on User { id }`,
          },
        }),
        environment,
        queryConfig: anotherQueryConfig,
        retry: jest.fn(),
      };
      environment.getStoreData().getRecordWriter().putDataID('me', null, null);
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          queryConfig={anotherQueryConfig}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {me: null},
      });

      environment.getStoreData().getRecordWriter().putDataID('me', null, '123');
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          queryConfig={anotherQueryConfig}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {me: anyRecord({dataID: '123'})},
      });
    });

    it('updates `props` when the container changes', () => {
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {
          node: anyRecord({
            dataID: '123',
            fragment: defaultProps.Container.getFragment('node'),
          }),
        },
      });

      const AnotherContainer = RelayClassic.createContainer(() => <div />, {
        fragments: {
          node: () => RelayClassic.QL`fragment on Node { id }`,
        },
      });
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          Container={AnotherContainer}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {
          node: anyRecord({
            dataID: '123',
            fragment: AnotherContainer.getFragment('node'),
          }),
        },
      });
    });

    it('updates `props` when the environment changes', () => {
      // Declare a query that requires a lookup in the root call map.
      const AnotherQueryConfig = RelayQueryConfig.genMock({
        routeName: 'AnotherQueryConfig',
        queries: {
          node: () => RelayClassic.QL`query { me }`,
        },
      });

      defaultProps.environment
        .getStoreData()
        .getRecordWriter()
        .putDataID('me', null, '123');
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          queryConfig={new AnotherQueryConfig()}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {
          node: anyRecord({dataID: '123'}),
        },
      });

      const anotherEnvironment = new RelayEnvironment();
      anotherEnvironment
        .getStoreData()
        .getRecordWriter()
        .putDataID('me', null, '456');
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          environment={anotherEnvironment}
          queryConfig={new AnotherQueryConfig()}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderWithArgs({
        props: {
          node: anyRecord({dataID: '456'}),
        },
      });
    });
  });

  describe('children', () => {
    beforeEach(() => {
      function render(element) {
        return ReactTestUtils.findRenderedComponentWithType(
          ReactTestRenderer.create(element).getInstance(),
          RelayStaticContainer,
        );
      }

      expect.extend({
        toRenderChild(element, expected) {
          const pass = this.equals(render(element).props.children, expected);
          return {
            get message() {
              const not = pass ? ' not' : '';
              return (
                `Expected ${ppReactElement(element)}${not} ` +
                `to render child ${prettyFormat(expected)}.`
              );
            },
            pass,
          };
        },
        toUpdateChild(element) {
          const pass = render(element).props.shouldUpdate;
          return {
            get message() {
              const not = pass ? ' not' : '';
              return (
                `Expected ${ppReactElement(element)}${not} ` +
                'to update child.'
              );
            },
            pass,
          };
        },
      });
    });

    it('renders null if `readyState` is initially omitted', () => {
      expect(
        <RelayReadyStateRenderer {...defaultProps} render={() => <div />} />,
      ).toRenderChild(null);
    });

    it('renders null if not ready and `render` is initially omitted', () => {
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={defaultReadyState}
        />,
      ).toRenderChild(null);
    });

    it('renders component if ready and `render` is omitted', () => {
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={{...defaultReadyState, ready: true}}
        />,
      ).toRenderChild(jasmine.objectContaining({type: defaultProps.Container}));
    });

    it('renders null if `render` returns null', () => {
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={defaultReadyState}
          render={() => null}
        />,
      ).toRenderChild(null);
    });

    it('does not update child if `render` returns undefined', () => {
      const prevChild = <span />;
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={defaultReadyState}
          render={() => prevChild}
        />,
      ).toRenderChild(prevChild);

      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={defaultReadyState}
          render={() => undefined}
        />,
      ).not.toUpdateChild();
    });

    it('updates child if `render` returns a new view', () => {
      const prevChild = <span />;
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={defaultReadyState}
          render={() => prevChild}
        />,
      ).toRenderChild(prevChild);

      const nextChild = <div />;
      expect(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={defaultReadyState}
          render={() => nextChild}
        />,
      ).toUpdateChild(nextChild);
    });
  });

  describe('context', () => {
    it('sets environment and query config on the React context', () => {
      class TestComponent extends React.Component {
        static contextTypes = {
          relay: RelayClassic.PropTypes.RelayClassic,
          route: RelayClassic.PropTypes.QueryConfig.isRequired,
        };
        render() {
          this.props.onRenderContext(this.context);
          return null;
        }
      }

      const onRenderContext = jest.fn();
      ReactTestRenderer.create(
        <RelayReadyStateRenderer
          {...defaultProps}
          readyState={defaultReadyState}
          render={() => <TestComponent onRenderContext={onRenderContext} />}
        />,
      );
      expect(onRenderContext).toBeCalledWith({
        relay: {
          environment: defaultProps.environment,
          variables: {},
        },
        route: defaultProps.queryConfig,
      });
    });
  });
});
