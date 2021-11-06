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
const RelayTestRenderer = require('../__mocks__/RelayTestRenderer');
const {
  createContainer: createFragmentContainer,
} = require('../ReactRelayFragmentContainer');
const QueryRenderer = require('../ReactRelayQueryRenderer');
const ReactRelayTestMocker = require('../ReactRelayTestMocker');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {getRequest, graphql} = require('relay-runtime');
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

    const updaterSetup = env => {
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
        query: getRequest(ReactRelayTestMockerTestQuery),
        payload: {data: payload},
      };

      writer.setDefault(testQueryDefault);

      const nestedQuery = ReactRelayTestMockerTestNestedQuery;

      const nestedQueryDefault = {
        query: getRequest(ReactRelayTestMockerTestNestedQuery),
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
      const NestedComponent = ({viewer}) => (
        <div>{'Birth month is ' + viewer.actor.birthdate.month}</div>
      );

      // component containing a query renderer
      const Component = ({me}) => (
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

      const tree = ReactTestRenderer.create(toRender);

      expect(JSON.stringify(tree.toJSON())).toEqual(
        expect.stringContaining('My name is ' + name),
      );

      expect(JSON.stringify(tree.toJSON())).toEqual(
        expect.stringContaining('Birth month is 1'),
      );

      tree.unmount();
      writer.unsetDefault(testQueryDefault);
      writer.unsetDefault(nestedQueryDefault);
    });

    it('updates the store properly via network', () => {
      const Component = ({me}) => <div>{'My name is ' + me.name}</div>;

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

      let tree = ReactTestRenderer.create(toRender);
      expect(tree.toJSON()).toMatchSnapshot();

      writer.networkWrite({
        query: getRequest(ReactRelayTestMockerTestQuery),
        payload: {data: payload},
      });
      jest.runAllTimers();
      expect(JSON.stringify(tree.toJSON())).toEqual(
        expect.stringContaining('My name is ' + name),
      );
      expect(tree.toJSON()).toMatchSnapshot();
      tree.unmount();

      // rerender to test error behavior
      tree = ReactTestRenderer.create(toRender);

      writer.networkWrite({
        query: getRequest(ReactRelayTestMockerTestQuery),
        payload: {
          data: null,
          errors: [
            {
              message: 'Uh oh',
            },
          ],
        },
      });
      jest.runAllTimers();
      expect(tree.toJSON()).toMatchSnapshot();
      tree.unmount();
    });

    it('properly updates a component wrapped in a fragment container', () => {
      let Component = ({me}) => <div>{'My name is ' + me.name}</div>;
      Component = createFragmentContainer(
        Component,
        ReactRelayTestMockerTest_meFragmentDefinition,
      );

      const q = ReactRelayTestMockerTestFragContainerTestQuery;

      writer.dataWrite({
        query: getRequest(ReactRelayTestMockerTestFragContainerTestQuery),
        payload: {data: payload},
        variables,
      });

      const tree = ReactTestRenderer.create(
        <RelayTestRenderer
          environment={environment}
          query={q}
          variables={variables}>
          <Component />
        </RelayTestRenderer>,
      );

      expect(tree.toJSON()).toMatchSnapshot();

      const newPayload = {
        me: {
          __typename: 'User',
          id: ReactRelayTestMocker.generateId(),
          name: 'new name',
        },
      };

      writer.dataWrite({
        query: getRequest(ReactRelayTestMockerTestFragContainerTestQuery),
        payload: {data: newPayload},
        variables,
      });

      expect(tree.toJSON()).toMatchSnapshot();
    });
  });
});
