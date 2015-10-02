/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* eslint-disable no-unused-vars, no-eval */

import './RelayPlayground.css';
import 'codemirror/mode/javascript/javascript';

import Codemirror from 'react-codemirror';
import React from 'react';
import ReactDOM from 'react/lib/ReactDOM';
import Relay from 'react-relay'; window.Relay = Relay;
import RelayLocalSchema from 'relay-local-schema';

import babel from 'babel-core/browser';
import babelRelayPlaygroundPlugin from './babelRelayPlaygroundPlugin';
import debounce from 'lodash.debounce';
import defer from 'lodash.defer';
import errorCatcher from 'babel-plugin-react-error-catcher/error-catcher';
import errorCatcherPlugin from 'babel-plugin-react-error-catcher';
import evalSchema from './evalSchema';
import getBabelRelayPlugin from 'babel-relay-plugin';
import {introspectionQuery} from 'graphql/utilities';
import {graphql} from 'graphql';

var {PropTypes} = React;

const CODE_EDITOR_OPTIONS = {
  extraKeys: {
    Tab(cm) {
      // Insert spaces when the tab key is pressed
      var spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
      cm.replaceSelection(spaces);
    },
  },
  indentWithTabs: false,
  lineNumbers: true,
  mode: 'javascript',
  tabSize: 2,
  theme: 'solarized light',
};
const ERROR_TYPES = {
  graphql: 'GraphQL Validation',
  query: 'Query',
  runtime: 'Runtime',
  schema: 'Schema',
  syntax: 'Syntax',
};
const RENDER_STEP_EXAMPLE_CODE =
`ReactDOM.render(
  <Relay.RootContainer
  Component={MyRelayContainer}
  route={new MyHomeRoute()}
  />,
  mountNode
);`;

function errorFromGraphQLResultAndQuery(errors, request) {
  var queryString = request.getQueryString();
  var variables = request.getVariables();
  var errorText = `
${errors.map(e => e.message).join('\n')}

Query: ${queryString}
`;
  if (variables) {
    errorText += `Variables: ${JSON.stringify(variables)}`;
  }
  return {stack: errorText.trim()};
}

class PlaygroundRenderer extends React.Component {
  componentDidMount() {
    this._container = document.createElement('div');
    this.refs.mountPoint.appendChild(this._container);
    this._updateTimeoutId = defer(this._update);
  }
  componentDidUpdate(prevProps) {
    if (this._updateTimeoutId != null) {
      clearTimeout(this._updateTimeoutId);
    }
    this._updateTimeoutId = defer(this._update);
  }
  componentWillUnmount() {
    if (this._updateTimeoutId != null) {
      clearTimeout(this._updateTimeoutId);
    }
    try {
      ReactDOM.unmountComponentAtNode(this._container);
    } catch (e) {}
  }
  _update = () => {
    ReactDOM.render(React.Children.only(this.props.children), this._container);
  }
  render() {
    return <div ref="mountPoint" />;
  }
}

export default class RelayPlayground extends React.Component {
  static defaultProps = {
    autoExecute: false,
  };
  static propTypes = {
    autoExecute: PropTypes.bool.isRequired,
    initialAppSource: PropTypes.string,
    initialSchemaSource: PropTypes.string,
    onAppSourceChange: PropTypes.func,
    onSchemaSourceChange: PropTypes.func,
  };
  state = {
    appElement: null,
    appSource: this.props.initialAppSource,
    busy: false,
    editTarget: 'app',
    error: null,
    schemaSource: this.props.initialSchemaSource,
    shouldExecuteCode: this.props.autoExecute,
  };
  componentDidMount() {
    // Hijack console.warn to collect GraphQL validation warnings (we hope)
    this._originalConsoleWarn = console.warn;
    var collectedWarnings = [];
    console.warn = (...args) => {
      collectedWarnings.push([Date.now(), args]);
      this._originalConsoleWarn.apply(console, args);
    };
    // Hijack window.onerror to catch any stray fatals
    this._originalWindowOnerror = window.onerror;
    window.onerror = (message, url, lineNumber, something, error) => {
      // GraphQL validation warnings are followed closely by a thrown exception.
      // Console warnings that appear too far before this exception are probably
      // not related to GraphQL. Throw those out.
      if (/GraphQL validation error/.test(message)) {
        var recentWarnings = collectedWarnings
          .filter(([createdAt, args]) => Date.now() - createdAt <= 500)
          .reduce((memo, [createdAt, args]) => memo.concat(args), []);
        this.setState({
          error: {stack: recentWarnings.join('\n')},
          errorType: ERROR_TYPES.graphql,
        });
      } else {
        this.setState({error, errorType: ERROR_TYPES.runtime});
      }
      collectedWarnings = [];
      return false;
    };
    if (this.state.shouldExecuteCode) {
      this._updateSchema(this.state.schemaSource, this.state.appSource);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    var recentlyEnabledCodeExecution =
      !prevState.shouldExecuteCode && this.state.shouldExecuteCode;
    var appChanged = this.state.appSource !== prevState.appSource;
    var schemaChanged = this.state.schemaSource !== prevState.schemaSource;
    if (
      this.state.shouldExecuteCode &&
      (recentlyEnabledCodeExecution || appChanged || schemaChanged)
    ) {
      this.setState({busy: true});
      this._handleSourceCodeChange(
        this.state.appSource,
        recentlyEnabledCodeExecution || schemaChanged
          ? this.state.schemaSource
          : null,
      );
    }
  }
  componentWillUnmount() {
    clearTimeout(this._errorReporterTimeout);
    clearTimeout(this._warningScrubberTimeout);
    this._handleSourceCodeChange.cancel();
    console.warn = this._originalConsoleWarn;
    window.onerror = this._originalWindowOnerror;
  }
  _handleExecuteClick = () => {
    this.setState({shouldExecuteCode: true});
  }
  _handleSourceCodeChange = debounce((appSource, schemaSource) => {
    if (schemaSource != null) {
      this._updateSchema(schemaSource, appSource);
    } else {
      this._updateApp(appSource);
    }
  }, 300, {trailing: true})
  _updateApp = (appSource) => {
    clearTimeout(this._errorReporterTimeout);
    // We're running in a browser. Create a require() shim to catch any imports.
    var require = (path) => {
      switch (path) {
        // The errorCatcherPlugin injects a series of import statements into the
        // program body. Return locally bound variables in these three cases:
        case '//error-catcher.js':
          return (React, filename, displayName, reporter) => {
            // When it fatals, render an empty <span /> in place of the app.
            return errorCatcher(React, filename, <span />, reporter);
          };
        case 'react':
          return React;
        case 'reporterProxy':
          return (error, instance, filename, displayName) => {
            this._errorReporterTimeout = defer(
              this.setState.bind(this),
              {error, errorType: ERROR_TYPES.runtime}
            );
          };

        default: throw new Error(`Cannot find module "${path}"`);
      }
    };
    try {
      var {code} = babel.transform(appSource, {
        filename: 'RelayPlayground',
        plugins : [
          babelRelayPlaygroundPlugin,
          this._babelRelayPlugin,
          errorCatcherPlugin('reporterProxy'),
        ],
        retainLines: true,
        sourceMaps: 'inline',
        stage: 0,
      });
      var result = eval(code);
      if (
        React.isValidElement(result) &&
        result.type.name === 'RelayRootContainer'
      ) {
        this.setState({
          appElement: React.cloneElement(result, {forceFetch: true}),
        });
      } else {
        this.setState({
          appElement: (
            <div>
              <h2>
                Render a Relay.RootContainer into <code>mountNode</code> to get
                started.
              </h2>
              <p>
                Example:
              </p>
              <pre>{RENDER_STEP_EXAMPLE_CODE}</pre>
            </div>
          ),
        });
      }
      this.setState({error: null});
    } catch (error) {
      this.setState({error, errorType: ERROR_TYPES.syntax});
    }
    this.setState({busy: false});
  }
  _updateCode = (newSource) => {
    var sourceStorageKey = `${this.state.editTarget}Source`;
    this.setState({[sourceStorageKey]: newSource});
    if (this.state.editTarget === 'app' && this.props.onAppSourceChange) {
      this.props.onAppSourceChange(newSource);
    }
    if (this.state.editTarget === 'schema' && this.props.onSchemaSourceChange) {
      this.props.onSchemaSourceChange(newSource);
    }
  }
  _updateEditTarget = (editTarget) => {
    this.setState({editTarget});
  }
  _updateSchema = (schemaSource, appSource) => {
    try {
      var Schema = evalSchema(schemaSource);
    } catch (error) {
      this.setState({error, errorType: ERROR_TYPES.schema});
      return;
    }
    graphql(Schema, introspectionQuery).then((result) => {
      if (
        this.state.schemaSource !== schemaSource ||
        this.state.appSource !== appSource
      ) {
        // This version of the code is stale. Bail out.
        return;
      }
      this._babelRelayPlugin = getBabelRelayPlugin(result.data);
      Relay.injectNetworkLayer(
        new RelayLocalSchema.NetworkLayer({
          schema: Schema,
          onError: (errors, request) => {
            this.setState({
              error: errorFromGraphQLResultAndQuery(errors, request),
              errorType: ERROR_TYPES.query,
            });
          },
        })
      );
      this._updateApp(appSource);
    });
  }
  renderApp() {
    if (!this.state.shouldExecuteCode) {
      return (
        <div className="rpExecutionGuard">
          <div className="rpExecutionGuardMessage">
            <h2>For your security, this playground did not auto-execute</h2>
            <p>
              Clicking <strong>execute</strong> will run the code in the two
              tabs to the left.
            </p>
            <button onClick={this._handleExecuteClick}>Execute</button>
          </div>
        </div>
      );
    } else if (this.state.error) {
      return (
        <div className="rpError">
          <h1>{this.state.errorType} Error</h1>
          <pre className="rpErrorStack">{this.state.error.stack}</pre>
        </div>
      );
    } else if (this.state.appElement) {
      return <PlaygroundRenderer>{this.state.appElement}</PlaygroundRenderer>;
    }
    return null;
  }
  render() {
    var sourceCode = this.state.editTarget === 'schema'
      ? this.state.schemaSource
      : this.state.appSource;
    return (
      <div className="rpShell">
        <section className="rpCodeEditor">
          <nav className="rpCodeEditorNav">
            <button
              className={this.state.editTarget === 'app' && 'rpButtonActive'}
              onClick={this._updateEditTarget.bind(this, 'app')}>
              Code
            </button>
            <button
              className={this.state.editTarget === 'schema' && 'rpButtonActive'}
              onClick={this._updateEditTarget.bind(this, 'schema')}>
              Schema
            </button>
          </nav>
          {/* What is going on with the choice of key in Codemirror?
            * https://github.com/JedWatson/react-codemirror/issues/12
            */}
          <Codemirror
            key={`${this.state.editTarget}-${this.state.shouldExecuteCode}`}
            onChange={this._updateCode}
            options={{
              ...CODE_EDITOR_OPTIONS,
              readOnly: !this.state.shouldExecuteCode,
            }}
            value={sourceCode}
          />
        </section>
        <section className="rpResult">
          <h1 className="rpResultHeader">
            Relay Playground
            <span className={
              'rpActivity' + (this.state.busy ? ' rpActivityBusy' : '')
            } />
          </h1>
          <div className="rpResultOutput">
            {this.renderApp()}
          </div>
        </section>
      </div>
    );
  }
}
