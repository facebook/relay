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
import type {RelayMockEnvironment} from '../../relay-test-utils/RelayModernMockEnvironment';

const RelayTestRenderer = require('../__mocks__/RelayTestRenderer');
const {
  createContainer: createFragmentContainer,
} = require('../ReactRelayFragmentContainer');
const QueryRenderer = require('../ReactRelayQueryRenderer');
const ReactRelayTestMocker = require('../ReactRelayTestMocker');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {graphql} = require('relay-runtime');
const RelayTestUtils = require('relay-test-utils-internal');

const ReactRelayTestMockerTestQuery = graphql`
  query ReactRelayTestMockerTestQuery {
    me {
      name
    }
  }
`;
const ReactRelayTestMockerTestNestedQuery = graphql`
  query ReactRelayTestMockerTestNestedQuery {
    viewer {
      actor {
        birthdate {
          month
        }
      }
    }
  }
`;
const ReactRelayTestMockerTest_meFragmentDefinition = {
  me: graphql`
    fragment ReactRelayTestMockerTest_me on User {
      name
    }
  `,
};
const ReactRelayTestMockerTestFragContainerTestQuery = graphql`
  query ReactRelayTestMockerTestFragContainerTestQuery {
    me {
      ...ReactRelayTestMockerTest_me
    }
  }
`;
const {createMockEnvironment} = RelayTestUtils;

describe('ReactRelayTestMocker', () => {
  describe('generateId', () => {
    it('gives a different id each time it is called', () => {
      const first = ReactRelayTestMocker.generateId();
      const second = ReactRelayTestMocker.generateId();
      const third = ReactRelayTestMocker.generateId();
      expect(first !== second && second !== third && first !== third).toBe(
        true,
      );
    });
  });

  describe('write', () => {
    let query, variables, writer, environment;
    const name = 'test name';
    const payload = {
      me: {
        __typename: 'User',
        id: ReactRelayTestMocker.generateId(),
        name,
      },
    };

    const updaterSetup = (env: RelayMockEnvironment) => {
      writer = new ReactRelayTestMocker(env);
      query = ReactRelayTestMockerTestQuery;

      variables = {};
    };

    beforeEach(() => {
      environment = createMockEnvironment();
      updaterSetup(environment);
    });

    it('updates properly via default values', () => {
      const testQueryDefault = {
        query: ReactRelayTestMockerTestQuery,
        payload: {data: payload},
      };

      writer.setDefault(testQueryDefault);

      const nestedQuery = ReactRelayTestMockerTestNestedQuery;

      const nestedQueryDefault = {
        query: ReactRelayTestMockerTestNestedQuery,
        payload: {
          data: {
            viewer: {
              actor: {
                __typename: 'User',
                birthdate: {
                  month: 1,
                },
                id: ReactRelayTestMocker.generateId(),
              },
            },
          },
        },
      };

      writer.setDefault(nestedQueryDefault);

      // simple component
      const NestedComponent = ({viewer}: {viewer: $FlowFixMe}) => (
        <div>{'Birth month is ' + viewer.actor.birthdate.month}</div>
      );

      // component containing a query renderer
      const Component = ({me}: {me: $FlowFixMe}) => (
        <div>
          {'My name is ' + me.name}
          <QueryRenderer
            environment={environment}
            query={nestedQuery}
            variables={{}}
            render={({error, props}) => {
              if (error) {
                return <div>{'Something went wrong: ' + error.message}</div>;
              } else if (props) {
                return <NestedComponent viewer={props.viewer} />;
              } else {
                return <div>Loading nested...</div>;
              }
            }}
          />
        </div>
      );

      const toRender = (
        <QueryRenderer
          environment={environment}
          query={query}
          variables={variables}
          render={({error, props}) => {
            if (error) {
              return <div>{'Something went wrong: ' + error.message}</div>;
            } else if (props) {
              return <Component me={props.me} />;
            } else {
              return <div>Loading outer....</div>;
            }
          }}
        />
      );

      let tree;
      ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(toRender);
      });

      expect(JSON.stringify(tree?.toJSON())).toEqual(
        expect.stringContaining('My name is ' + name),
      );

      expect(JSON.stringify(tree?.toJSON())).toEqual(
        expect.stringContaining('Birth month is 1'),
      );

      ReactTestRenderer.act(() => {
        tree.unmount();
      });
      writer.unsetDefault(testQueryDefault);
      writer.unsetDefault(nestedQueryDefault);
    });

    it('updates the store properly via network', () => {
      const Component = ({me}: {me: $FlowFixMe}) => (
        <div>{'My name is ' + me.name}</div>
      );

      const toRender = (
        <QueryRenderer
          environment={environment}
          query={query}
          variables={variables}
          render={({error, props}) => {
            if (error) {
              return <div>{'Something went wrong: ' + error.message}</div>;
            } else if (props) {
              return <Component me={props.me} />;
            } else {
              return <div>Loading....</div>;
            }
          }}
        />
      );

      let tree;
      ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(toRender);
      });
      expect(tree?.toJSON()).toMatchSnapshot();
      ReactTestRenderer.act(() => {
        writer.networkWrite({
          query: ReactRelayTestMockerTestQuery,
          payload: {data: payload},
        });
      });
      ReactTestRenderer.act(() => {
        jest.runAllTimers();
      });
      expect(JSON.stringify(tree?.toJSON())).toEqual(
        expect.stringContaining('My name is ' + name),
      );
      expect(tree?.toJSON()).toMatchSnapshot();
      ReactTestRenderer.act(() => {
        tree.unmount();
        // rerender to test error behavior
        tree = ReactTestRenderer.create(toRender);
      });
      ReactTestRenderer.act(() => {
        writer.networkWrite({
          query: ReactRelayTestMockerTestQuery,
          payload: {
            data: null,
            errors: [
              {
                message: 'Uh oh',
              },
            ],
          },
        });
      });
      ReactTestRenderer.act(() => {
        jest.runAllTimers();
      });
      expect(tree?.toJSON()).toMatchSnapshot();
      ReactTestRenderer.act(() => {
        tree.unmount();
      });
    });

    it('properly updates a component wrapped in a fragment container', () => {
      let Component = ({me}: $FlowFixMe) => (
        <div>{'My name is ' + me.name}</div>
      );
      // $FlowFixMe[incompatible-type]
      Component = createFragmentContainer(
        Component,
        ReactRelayTestMockerTest_meFragmentDefinition,
      );

      const q = ReactRelayTestMockerTestFragContainerTestQuery;

      writer.dataWrite({
        query: ReactRelayTestMockerTestFragContainerTestQuery,
        payload: {data: payload},
        variables,
      });

      let tree;
      ReactTestRenderer.act(() => {
        tree = ReactTestRenderer.create(
          <RelayTestRenderer
            environment={environment}
            query={q}
            variables={variables}>
            <Component />
          </RelayTestRenderer>,
        );
      });

      expect(tree?.toJSON()).toMatchSnapshot();

      const newPayload = {
        me: {
          __typename: 'User',
          id: ReactRelayTestMocker.generateId(),
          name: 'new name',
        },
      };
      ReactTestRenderer.act(() => {
        writer.dataWrite({
          query: ReactRelayTestMockerTestFragContainerTestQuery,
          payload: {data: newPayload},
          variables,
        });
      });
      expect(tree?.toJSON()).toMatchSnapshot();
    });
  });
});
