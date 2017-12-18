/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const Map = require('Map');

const diff = require('jest-diff');

jest.dontMock('react-test-renderer').mock('../../route/RelayRoute');
const ReactTestRenderer = require('react-test-renderer');

/**
 * Utility methods (eg. for unmocking Relay internals) and custom Jasmine
 * matchers.
 */
const RelayTestUtils = {
  /**
   * Returns true if `query` contains a node that equals the `target` node
   */
  containsNode(query, target) {
    function find(node) {
      if (node.equals(target)) {
        return true;
      }
      const children = node.getChildren();
      return children.length > 0 && children.some(find);
    }
    return find(query);
  },

  createRenderer(container) {
    const React = require('React');
    const ReactDOM = require('ReactDOM');
    const RelayEnvironment = require('../../store/RelayEnvironment');
    const RelayPropTypes = require('../../container/RelayPropTypes');
    const RelayRoute = require('../../route/RelayRoute');
    const invariant = require('invariant');

    class ContextSetter extends React.Component {
      getChildContext() {
        return this.props.context;
      }
      render() {
        return this.props.render();
      }
    }
    ContextSetter.childContextTypes = {
      relay: RelayPropTypes.ClassicRelay,
      route: RelayPropTypes.QueryConfig.isRequired,
    };

    class MockPointer {
      constructor(dataID) {
        this.dataID = dataID;
      }
    }

    container = container || ReactTestRenderer.create();

    let prevEnvironment;
    let relay;

    return {
      render(render, environment, route) {
        invariant(
          environment == null || environment instanceof RelayEnvironment,
          'render(): Expected an instance of `RelayEnvironment`.',
        );
        environment = environment || prevEnvironment || new RelayEnvironment();
        if (!relay || !prevEnvironment || prevEnvironment !== environment) {
          prevEnvironment = environment;
          relay = {
            environment,
            variables: {},
          };
        }
        route = route || RelayRoute.genMockInstance();

        let result;
        function ref(component) {
          result = component;
        }

        const node = (
          <ContextSetter
            context={{relay, route}}
            render={() => {
              const element = render(dataID => new MockPointer(dataID));
              const pointers = {};
              for (const propName in element.props) {
                const propValue = element.props[propName];
                if (propValue instanceof MockPointer) {
                  const fragmentReference = element.type.getFragment(propName);
                  if (fragmentReference == null) {
                    throw new Error(
                      'Query not found, `' +
                        element.type.displayName +
                        '.' +
                        propName +
                        '`.',
                    );
                  }
                  pointers[propName] = RelayTestUtils.getPointer(
                    propValue.dataID,
                    RelayTestUtils.getNode(fragmentReference.getFragment({})),
                  );
                }
              }
              return React.cloneElement(element, {...pointers, ref});
            }}
          />
        );

        if ('innerHTML' in container) {
          ReactDOM.render(node, container);
        } else {
          container.update(node);
        }
        return result;
      },
      unmount() {
        if ('innerHTML' in container) {
          ReactDOM.unmountComponentAtNode(container);
        } else {
          container.unmount();
        }
      },
    };
  },

  conditionOnType(fragment) {
    const QueryBuilder = require('../../query/QueryBuilder');
    const RelayFragmentReference = require('../../query/RelayFragmentReference');
    const invariant = require('invariant');

    invariant(
      !!QueryBuilder.getFragment(fragment),
      'conditionOnType(): Argument must be a GraphQL.QueryFragment.',
    );
    const reference = new RelayFragmentReference(() => fragment, {});
    reference.conditionOnType();
    return reference;
  },

  createCall(name, value, type) {
    const QueryBuilder = require('../../query/QueryBuilder');

    if (Array.isArray(value)) {
      value = value.map(QueryBuilder.createCallValue);
    } else if (value != null) {
      value = QueryBuilder.createCallValue(value);
    }
    return QueryBuilder.createCall(name, value, type);
  },

  createContainerFragment(fragment) {
    const RelayFragmentReference = require('../../query/RelayFragmentReference');
    return RelayFragmentReference.createForContainer(() => fragment, {});
  },

  defer(fragment) {
    const QueryBuilder = require('../../query/QueryBuilder');
    const RelayFragmentReference = require('../../query/RelayFragmentReference');
    const invariant = require('invariant');

    invariant(
      !!QueryBuilder.getFragment(fragment),
      'defer(): Argument must be a GraphQL.QueryFragment.',
    );
    const reference = new RelayFragmentReference(() => fragment, {});
    reference.defer();
    return reference;
  },

  findQueryNode(node, predicate) {
    const queue = [node];
    while (queue.length) {
      const test = queue.shift();
      if (predicate(test)) {
        return test;
      }
      queue.push(...test.getChildren());
    }
    return null;
  },

  getNode(node, variables, queryConfig) {
    const RelayMetaRoute = require('../../route/RelayMetaRoute');
    const RelayQuery = require('../../query/RelayQuery');

    return RelayQuery.Node.create(
      node,
      queryConfig || RelayMetaRoute.get('$RelayTestUtils'),
      variables || {},
    );
  },

  /**
   * The exact error string for an invalid token in a JSON string changed with
   * node 6. This utility generates the right string to expect in test cases.
   */
  getJSONTokenError(token, position) {
    try {
      JSON.parse('@');
    } catch (error) {
      return error.message.replace('@', token).replace('0', position);
    }

    const invariant = require('invariant');

    invariant(
      false,
      'RelayTestUtils.getJSONTokenError(): JSON.parse should have thrown.',
    );
  },

  getPointer(dataID, fragment) {
    const RelayFragmentPointer = require('../../query/RelayFragmentPointer');
    const RelayQuery = require('../../query/RelayQuery');
    const invariant = require('invariant');

    invariant(
      fragment instanceof RelayQuery.Fragment,
      'getPointer(): expected a `RelayQueryFragment`, got `%s`.',
      fragment.constructor.name,
    );

    return RelayFragmentPointer.create(dataID, fragment);
  },

  /**
   * Convenience method for turning `node` into a properly formed ref query. We
   * can't produce one of these solely with `Relay.QL`, so we use a node from
   * `Relay.QL` as a basis and attach the appropriate args and ref params.
   */
  getRefNode(node, refParam) {
    const QueryBuilder = require('../../query/QueryBuilder');
    const RelayQuery = require('../../query/RelayQuery');
    const RelayMetaRoute = require('../../route/RelayMetaRoute');

    const invariant = require('invariant');

    invariant(
      node.fieldName === 'nodes',
      'getRefNode(): Ref queries require `nodes()` roots.',
    );
    const callValue = Array.isArray(node.calls[0].value)
      ? node.calls[0].value[0]
      : node.calls[0].value;
    invariant(
      !!QueryBuilder.getCallVariable(callValue),
      'getRefNode(): Expected a batch call variable, got `%s`.',
      JSON.stringify(callValue),
    );
    const name = callValue.callVariableName;
    const match = name.match(/^ref_(q\d+)$/);
    invariant(
      match,
      'getRefNode(): Expected call variable of the form `<ref_q\\d+>`.',
    );
    // e.g. `q0`
    const id = match[1];
    // e.g. `{ref_q0: '<ref_q0>'}`
    const variables = {[name]: '<' + callValue.callVariableName + '>'};

    return RelayQuery.Root.create(
      {
        ...node,
        calls: [
          QueryBuilder.createCall(
            'id',
            QueryBuilder.createBatchCallVariable(id, refParam.path),
          ),
        ],
        isDeferred: true,
      },
      RelayMetaRoute.get('$RelayTestUtils'),
      variables,
    );
  },

  getVerbatimNode(node, variables) {
    return RelayTestUtils.filterGeneratedFields(
      RelayTestUtils.getNode(node, variables),
    );
  },

  filterGeneratedFields(query) {
    const RelayQuery = require('../../query/RelayQuery');
    const filterRelayQuery = require('../../traversal/filterRelayQuery');

    return filterRelayQuery(
      query,
      node => !(node instanceof RelayQuery.Field && node.isGenerated()),
    );
  },

  matchers: {
    /**
     * Checks if a RelayQuery.Root is `===` to another.
     */
    toBeQueryRoot(actual, expected) {
      const RelayQuery = require('../../query/RelayQuery');
      const queryType = checkQueryType(actual, expected, RelayQuery.Root);
      if (!queryType.pass) {
        return queryType;
      }
      return checkQueryEquality(actual, expected, true);
    },

    /**
     * Checks that `warning` was invoked with a falsey condition with expected
     * arguments the supplied number of times. Example usage:
     *
     *   warning(false, "format", "x", "y");
     *   warning(false, "format", "x", "z");
     *
     *   expect(["format", "x", "y"]).toBeWarnedNTimes(1);
     *   expect(["format", "x", "z"]).toBeWarnedNTimes(1);
     *   expect(["format", "x"]).toBeWarnedNTimes(2);
     *
     *   warning(false, "format", "y");
     *
     *   expect(["format", "y"]).toBeWarnedNTimes(1);
     *
     *   warning(true, "format", "z");
     *
     *   expect(["format", "z"]).toBeWarnedNTimes(0);
     *
     *   expect(["format"]).toBeWarnedNTimes(3);
     *
     */
    toBeWarnedNTimes(actual, expectedCount) {
      const warning = require('warning');
      if (!warning.mock) {
        throw new Error(
          'expect(...).toBeWarnedNTimes(): Requires ' +
            "`jest.mock('warning');`.",
        );
      }
      const expectedArgs = actual;
      if (!Array.isArray(expectedArgs)) {
        throw new Error(
          'expect(...).toBeWarnedNTimes(): Requires an array of ' +
            'warning args.',
        );
      }
      const [format, ...values] = expectedArgs;
      if (!format) {
        throw new Error(
          'expect(...).toBeWarnedNTimes(): Requires a format string.',
        );
      }

      const callsWithExpectedFormatButArgs = [];
      const callsWithExpectedArgs = warning.mock.calls.filter(args => {
        if (args[0] || args[1] !== format) {
          return false;
        }
        if (values.some((value, ii) => value !== args[ii + 2])) {
          callsWithExpectedFormatButArgs.push(args.slice(1));
          return false;
        }
        return true;
      });

      let message =
        'Expected to warn ' +
        expectedCount +
        ' time' +
        (expectedCount === 1 ? '' : 's') +
        ' with arguments: ' +
        JSON.stringify(expectedArgs) +
        '.';
      const unexpectedCount = callsWithExpectedFormatButArgs.length;
      if (unexpectedCount) {
        message +=
          ' Instead, called ' +
          unexpectedCount +
          ' time' +
          (unexpectedCount === 1 ? '' : 's') +
          ' with arguments: ' +
          JSON.stringify(callsWithExpectedFormatButArgs) +
          '.';
      }

      return {
        pass: callsWithExpectedArgs.length === expectedCount,
        message,
      };
    },

    /**
     * Checks if a query node contains a node that `equals()` another.
     */
    toContainQueryNode(actual, expected) {
      if (!RelayTestUtils.containsNode(actual, expected)) {
        return {
          pass: false,
          message: printQueryComparison(
            actual,
            expected,
            'to contain query node',
          ),
        };
      }
      return {
        pass: true,
      };
    },

    /**
     * Recursively compares two objects, ignoring missing metadata keys (such as
     * `__dataID__`).
     *
     * Handles basic objects, arrays and primitive types, but doesn't support
     * "exotic" types like Date etc.
     */
    toMatchRecord(...args) {
      return require('matchRecord')(...args);
    },

    toEqualPrintedQuery(received, expected) {
      const minifiedReceived = RelayTestUtils.minifyQueryText(received);
      const minifiedExpected = RelayTestUtils.minifyQueryText(expected);

      const pass = minifiedReceived === minifiedExpected;
      const message = pass
        ? () =>
            this.utils.matcherHint('.not.toEqualPrintedQuery') +
            '\n\n' +
            'Expected query to not be:\n' +
            `  ${this.utils.printExpected(minifiedExpected)}\n` +
            'Received:\n' +
            `  ${this.utils.printReceived(minifiedReceived)}`
        : () => {
            const diffString = diff(minifiedExpected, minifiedReceived, {
              expand: this.expand,
            });
            return (
              this.utils.matcherHint('.toEqualPrintedQuery') +
              '\n\n' +
              'Expected query to be:\n' +
              `  ${this.utils.printExpected(minifiedExpected)}\n` +
              'Received:\n' +
              `  ${this.utils.printReceived(minifiedReceived)}` +
              (diffString ? `\n\nDifference:\n\n${diffString}` : '')
            );
          };

      return {actual: minifiedReceived, message, pass};
    },

    /**
     * Checks if a RelayQuery.Node is `equals()` to another.
     */
    toEqualQueryNode(actual, expected) {
      const RelayQuery = require('../../query/RelayQuery');
      const queryType = checkQueryType(actual, expected, RelayQuery.Node);
      if (!queryType.pass) {
        return queryType;
      }
      return checkQueryEquality(actual, expected, false);
    },

    /**
     * Checks if a RelayQuery.Root is `equals()` to another.
     */
    toEqualQueryRoot(actual, expected) {
      const RelayQuery = require('../../query/RelayQuery');
      const queryType = checkQueryType(actual, expected, RelayQuery.Root);
      if (!queryType.pass) {
        return queryType;
      }
      return checkQueryEquality(actual, expected, false);
    },

    toFailInvariant(actual, expected) {
      expect(actual).toThrowError(expected);
      return {
        pass: true,
      };
    },

    toWarn(actual, expected) {
      const negative = this.isNot;

      function formatItem(item) {
        return item instanceof RegExp ? item.toString() : JSON.stringify(item);
      }

      function formatArray(array) {
        return '[' + array.map(formatItem).join(', ') + ']';
      }

      function formatExpected(args) {
        return formatArray([!!negative].concat(args));
      }

      function formatActual(calls) {
        if (calls.length) {
          return calls
            .map(args => {
              return formatArray([!!args[0]].concat(args.slice(1)));
            })
            .join(', ');
        } else {
          return '[]';
        }
      }

      const warning = require('warning');
      if (!warning.mock) {
        throw new Error("toWarn(): Requires `jest.mock('warning')`.");
      }

      const callsCount = warning.mock.calls.length;
      actual();
      const calls = warning.mock.calls.slice(callsCount);

      // Simple case: no explicit expectation.
      if (!expected) {
        const warned = calls.filter(args => !args[0]).length;
        return {
          pass: !(negative ? warned : !warned),
          message:
            `Expected ${negative ? 'not ' : ''}to warn but ` +
            '`warning` received the following calls: ' +
            `${formatActual(calls)}.`,
        };
      }

      // Custom case: explicit expectation.
      if (!Array.isArray(expected)) {
        expected = [expected];
      }
      const call = calls.find(args => {
        return (
          args.length === expected.length + 1 &&
          args.every((arg, index) => {
            if (!index) {
              return !arg;
            }
            const other = expected[index - 1];
            return other instanceof RegExp ? other.test(arg) : arg === other;
          })
        );
      });

      return {
        pass: !(negative ? call : !call),
        message:
          `Expected ${negative ? 'not ' : ''}to warn: ` +
          `${formatExpected(expected)} but ` +
          '`warning` received the following calls: ' +
          `${formatActual(calls)}.`,
      };
    },

    /**
     * Compares a query path with another path. Succeeds when the paths are of
     * the same length have equivalent (shallow-equal) roots and fields.
     */
    toMatchPath(actual, expected) {
      const QueryBuilder = require('../../query/QueryBuilder');
      const RelayMetaRoute = require('../../route/RelayMetaRoute');
      const RelayNodeInterface = require('../../interface/RelayNodeInterface');
      const RelayQuery = require('../../query/RelayQuery');
      const RelayQueryPath = require('../../query/RelayQueryPath');

      const invariant = require('invariant');
      const printRelayQuery = require('../../traversal/printRelayQuery');

      const fragment = RelayQuery.Fragment.create(
        QueryBuilder.createFragment({
          children: [
            QueryBuilder.createField({
              fieldName: '__test__',
            }),
          ],
          name: 'Test',
          type: 'Node',
        }),
        RelayMetaRoute.get('$RelayTestUtils'),
        {},
      );
      const mockStore = {
        getDataID(fieldName: string, identifyingArgValue: string): string {
          invariant(
            fieldName === RelayNodeInterface.NODE,
            'RelayTestUtils: Cannot `getDataID` for non-node root call ' +
              '`%s` with identifying argument `%s`.',
            fieldName,
            identifyingArgValue,
          );
          return identifyingArgValue;
        },
        getType() {
          return RelayNodeInterface.ANY_TYPE;
        },
      };

      const actualQuery = RelayQueryPath.getQuery(mockStore, actual, fragment);
      const expectedQuery = RelayQueryPath.getQuery(
        mockStore,
        expected,
        fragment,
      );

      if (!actualQuery.equals(expectedQuery)) {
        return {
          pass: false,
          message: [
            'Expected:',
            '  ' + printRelayQuery(actualQuery).text,
            '\ntoMatchPath:',
            '  ' + printRelayQuery(expectedQuery).text,
          ]
            .filter(token => token)
            .join('\n'),
        };
      }
      return {
        pass: true,
      };
    },
  },

  /**
   * Returns a version of the query text with extraneous whitespace removed.
   */
  minifyQueryText(queryText) {
    return queryText
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\}\(\):,])\s*/g, '$1')
      .trim();
  },

  /**
   * Prints a textual representation of the query node to the console for
   * debugging purposes.
   *
   * You don't want to commit any code that uses this helper, but it is
   * useful when developing tests.
   */
  logNode(node) {
    const RelayQuery = require('../../query/RelayQuery');
    const flattenRelayQuery = require('../../traversal/flattenRelayQuery');
    const printRelayQuery = require('../../traversal/printRelayQuery');

    if (node instanceof RelayQuery.Field) {
      // Normally can't print fields directly, so wrap it in a fake fragment.
      node = RelayQuery.Fragment.build('__PrintableFieldWrapper', '__Phony', [
        node,
      ]);
    }

    const indentSize = 2;
    const indent = indentBy.bind(null, indentSize);
    const printedQuery = printRelayQuery(flattenRelayQuery(node));
    // eslint-disable-next-line no-console
    console.log(
      'Node:\n' +
        indent(prettifyQueryString(printedQuery.text, indentSize)) +
        '\n\n' +
        'Variables:\n' +
        indent(prettyStringify(printedQuery.variables, indentSize)) +
        '\n',
    );
  },

  /**
   * Helper to write the result payload of a (root) query into a store,
   * returning created/updated ID sets. The payload is transformed before
   * writing; property keys are rewritten from application names into
   * serialization keys matching the fields in the query.
   */
  writePayload(store, writer, query, payload, queryTracker, options) {
    const transformRelayQueryPayload = require('../../traversal/transformRelayQueryPayload');

    return RelayTestUtils.writeVerbatimPayload(
      store,
      writer,
      query,
      transformRelayQueryPayload(query, payload),
      queryTracker,
      options,
    );
  },

  /**
   * Helper to write the result payload into a store. Unlike `writePayload`,
   * the payload is not transformed first.
   */
  writeVerbatimPayload(store, writer, query, payload, queryTracker, options) {
    const RelayChangeTracker = require('../../store/RelayChangeTracker');
    const RelayQueryTracker = require('../../store/RelayQueryTracker');
    const RelayQueryWriter = require('../../store/RelayQueryWriter');
    const writeRelayQueryPayload = require('../../traversal/writeRelayQueryPayload');

    queryTracker =
      queryTracker === null ? null : queryTracker || new RelayQueryTracker();
    options = options || {};
    const changeTracker = new RelayChangeTracker();
    const queryWriter = new RelayQueryWriter(
      store,
      writer,
      queryTracker,
      changeTracker,
      options,
    );
    writeRelayQueryPayload(queryWriter, query, payload);
    return changeTracker.getChangeSet();
  },
};

/**
 * @private
 */
function checkQueryType(actual, expected, ExpectedClass) {
  const expectedType = ExpectedClass.name;
  if (!(expected && expected instanceof ExpectedClass)) {
    throw new Error('expect(...): Requires a `' + expectedType + '`.');
  }
  if (!(actual instanceof ExpectedClass)) {
    let actualType = actual;
    if (actual && actual.constructor) {
      actualType = actual.constructor.name;
    }
    return {
      pass: false,
      message: 'Expected a `' + expectedType + '`, got `' + actualType + '`.',
    };
  }
  return {
    pass: true,
  };
}

/**
 * @private
 */
function checkQueryEquality(actual, expected, toBe) {
  const flatActual = sortRelayQuery(actual);
  const flatExpected = sortRelayQuery(expected);

  if (toBe ? actual !== expected : !flatActual.equals(flatExpected)) {
    return {
      pass: false,
      message: printQueryComparison(
        actual,
        expected,
        toBe ? 'to be query' : 'to equal query',
      ),
    };
  }

  return {
    pass: true,
  };
}

/**
 * @private
 */
function printQueryComparison(actual, expected, message) {
  const printRelayQuery = require('../../traversal/printRelayQuery');

  const formatRefParam = node =>
    node.hasRefParam && node.hasRefParam()
      ? '  [ref param: ' + JSON.stringify(node.getRefParam()) + ']'
      : null;

  return [
    'Expected:',
    '  ' + printRelayQuery(actual).text,
    formatRefParam(actual),
    message + ':',
    '  ' + printRelayQuery(expected).text,
    formatRefParam(expected),
  ]
    .filter(line => !!line)
    .join('\n');
}

/**
 * @private
 *
 * Simulates sort key that existed when `getConcreteFragmentID` used to exist.
 */
const concreteFragmentSortKeys = new Map();
function createFragmentSortKey(node) {
  const stableStringify = require('../../query/stableStringify');
  const concreteNode = node.__concreteNode__;
  if (!concreteFragmentSortKeys.has(concreteNode)) {
    concreteFragmentSortKeys.set(concreteNode, concreteFragmentSortKeys.size);
  }
  return [
    concreteFragmentSortKeys.get(concreteNode),
    node.getRoute().name,
    stableStringify(node.getVariables()),
  ].join('.');
}

/**
 * @private
 *
 * Crudely transforms a query string into a "pretty" version (with
 * whitespace) for human readability.
 */
function prettifyQueryString(queryText, indentSize) {
  const regexp = /[^{},]+|[{},]/g;
  let indent = '';
  let output = '';
  let match;
  while ((match = regexp.exec(queryText))) {
    if (match[0] === '{') {
      indent += '  ';
      const padding =
        match.index && queryText[match.index - 1] !== ' ' ? ' ' : '';
      output += padding + '{\n' + indent;
    } else if (match[0] === '}') {
      indent = indent.substr(0, indent.length - 2);
      output += '\n' + indent + '}';
    } else if (match[0] === ',') {
      output += ',\n' + indent;
    } else {
      output += match[0];
    }
  }
  return output;
}

/**
 * @private
 *
 * Indents and prettifies a JSON-stringifiable input.
 */
function prettyStringify(stringifiable, indentSize) {
  return JSON.stringify(stringifiable, null, indentSize);
}

/**
 * @private
 *
 * Indents (potentially multiline) `string` by `indentSize` spaces.
 */
function indentBy(indentSize, string) {
  const indent = new Array(indentSize + 1).join(' ');
  return indent + string.replace(/\n/g, '\n' + indent);
}

/**
 * @private
 */
function sortRelayQuery(node) {
  const RelayQuery = require('../../query/RelayQuery');

  function getSortableKey(maybeFragment) {
    return maybeFragment instanceof RelayQuery.Fragment
      ? createFragmentSortKey(maybeFragment)
      : maybeFragment.getShallowHash();
  }
  function compare(a, b) {
    if (a === b) {
      return 0;
    } else if (a < b) {
      return -1;
    } else {
      return 1;
    }
  }

  return node.clone(
    node
      .getChildren()
      .sort((a, b) => {
        const aKey = getSortableKey(a);
        const bKey = getSortableKey(b);
        return compare(aKey, bKey);
      })
      .map(sortRelayQuery),
  );
}

module.exports = RelayTestUtils;
