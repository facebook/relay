import './RelayPlayground.css';
import 'codemirror/mode/javascript/javascript';

import Codemirror from 'react-codemirror';
import React from 'react';
import ReactDOM from 'react/lib/ReactDOM';
import Relay from 'react-relay'; window.Relay = Relay;

import babel from 'babel-core/browser';
import babelRelayPlaygroundPlugin from './babelRelayPlaygroundPlugin';
import debounce from 'lodash.debounce';
import defer from 'lodash.defer';
import delay from 'lodash.delay';
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
    } catch(e) {}
  }
  _update = () => {
    ReactDOM.render(React.Children.only(this.props.children), this._container);
  }
  render() {
    return <div ref="mountPoint" />;
  }
}

export default class RelayPlayground extends React.Component {
  static propTypes = {
    initialAppSource: PropTypes.string,
    initialSchemaSource: PropTypes.string,
  };
  state = {
    appElement: null,
    appSource: this.props.initialAppSource,
    busy: false,
    editTarget: 'app',
    error: null,
    schemaSource: this.props.initialSchemaSource,
  };
  componentDidMount() {
    // Hijack console.warn to collect GraphQL validation warnings (we hope)
    this._originalConsoleWarn = console.warn;
    var collectedWarnings = [];
    console.warn = (...args) => {
      collectedWarnings.push([Date.now(), args]);
      this._originalConsoleWarn.apply(console, args);
    }
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
    this._updateSchema(this.state.schemaSource, this.state.appSource);
  }
  componentDidUpdate(prevProps, prevState) {
    var appChanged = this.state.appSource !== prevState.appSource;
    var schemaChanged = this.state.schemaSource !== prevState.schemaSource;
    if (appChanged || schemaChanged) {
      this.setState({busy: true});
      this._handleSourceCodeChange(
        this.state.appSource,
        schemaChanged ? this.state.schemaSource : null,
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
    } catch(error) {
      this.setState({error, errorType: ERROR_TYPES.syntax});
    }
    this.setState({busy: false});
  }
  _updateCode = (newSource) => {
    var sourceStorageKey = `${this.state.editTarget}Source`;
    this.setState({[sourceStorageKey]: newSource});
  }
  _updateEditTarget = (editTarget) => {
    this.setState({editTarget});
  }
  _updateSchema = (schemaSource, appSource) => {
    try {
      var Schema = evalSchema(schemaSource);
    } catch(error) {
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
      Relay.injectNetworkLayer({
        sendMutation: (mutationRequest) => {
          var graphQLQuery = mutationRequest.getQueryString();
          var variables = mutationRequest.getVariables();
          graphql(Schema, graphQLQuery, null, variables).then(result => {
            if (result.errors) {
              mutationRequest.reject(new Error(result.errors));
            } else {
              mutationRequest.resolve({response: result.data});
            }
          });
        },
        sendQueries: (queryRequests) => {
          return Promise.all(queryRequests.map(queryRequest => {
            var graphQLQuery = queryRequest.getQueryString();
            graphql(Schema, graphQLQuery).then(result => {
              if (result.errors) {
                queryRequest.reject(new Error(result.errors));
              } else {
                queryRequest.resolve({response: result.data});
              }
            });
          }));
        },
        supports: () => false,
      });
      this._updateApp(appSource);
    });
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
          <Codemirror
            onChange={this._updateCode}
            options={CODE_EDITOR_OPTIONS}
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
            {this.state.error
              ? <div className="rpError">
                  <h1>{this.state.errorType} Error</h1>
                  <pre className="rpErrorStack">{this.state.error.stack}</pre>
                </div>
              : <PlaygroundRenderer>{this.state.appElement}</PlaygroundRenderer>
            }
          </div>
        </section>
      </div>
    );
  }
}
