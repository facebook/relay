/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {
  useExplorerState,
  useSerializedFeatureFlags,
} from '../compiler-explorer/ExplorerState';
import {FEATURE_FLAGS} from '../compiler-explorer/ExplorerStateConstants';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import * as React from 'react';

const {useState, useEffect, useLayoutEffect, useMemo} = React;

export default function App() {
  return (
    <Layout title="Compiler Explorer">
      <FillRemainingHeight minHeight={600}>
        <CompilerExplorer />
      </FillRemainingHeight>
    </Layout>
  );
}

// On mount, measures the window height and current vertical offset, and
// renders children into a div that stretches to the bottom of the viewport.
function FillRemainingHeight({children, minHeight}) {
  const [containerRef, setContainerRef] = useState(null);
  const [height, setHeight] = useState(null);
  useLayoutEffect(() => {
    if (containerRef == null) {
      return;
    }

    const verticalOffset = containerRef.getBoundingClientRect().y;
    const avaliable = Math.max(window.innerHeight - verticalOffset, minHeight);
    setHeight(avaliable);
  }, [containerRef, minHeight]);

  return (
    <div style={{height}} ref={setContainerRef}>
      {height != null && children}
    </div>
  );
}

function CompilerExplorer() {
  const {
    state,
    setOutputType,
    setDocumentText,
    setSchemaText,
    setFeatureFlag,
    setLanguage,
  } = useExplorerState();
  const results = useResults(state);
  const output = results.Ok ?? '';
  const schemaDiagnostics = results.Err?.SchemaDiagnostics;
  const documentDiagnostics = results.Err?.DocumentDiagnostics;
  const padding = 20;
  const Editor = useMemo(() => {
    // Loading the Editor component causes Docusaurus' build time pre-rendering to
    // crash, so we initializie it lazily.
    return require('../compiler-explorer/Editor').default;
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: padding,
        rowGap: padding,
        backgroundColor: 'var(--light-bg-color)',
      }}>
      <div style={{display: 'flex', columnGap: padding}}>
        <div style={{width: '50%', alignSelf: 'flex-end'}}>
          <ExplorerHeading>Schema</ExplorerHeading>
        </div>
        <div style={{width: '50%'}}>
          <Tabs
            values={[
              {value: 'operation', label: 'Operation'},
              {value: 'ast', label: 'AST'},
              {value: 'ir', label: 'IR'},
              {value: 'normalization', label: 'Normalization AST'},
              {value: 'reader', label: 'Reader AST'},
              {value: 'types', label: 'Types'},
            ]}
            selectedValue={state.outputType}
            setSelectedValue={selected => setOutputType(selected)}
          />
        </div>
      </div>
      <div style={{display: 'flex', flexGrow: 1, columnGap: padding}}>
        <div style={{width: '50%', display: 'flex', flexDirection: 'column'}}>
          <Editor
            text={state.schemaText}
            onDidChange={setSchemaText}
            style={{flexGrow: 1}}
            // We don't actually track spans when we parse the schema, so the
            // locations here are bogus. :(
            diagnostics={schemaDiagnostics}
          />
          <ExplorerHeading>Document</ExplorerHeading>
          <Editor
            text={state.documentText}
            onDidChange={setDocumentText}
            style={{flexGrow: 3}}
            diagnostics={documentDiagnostics}
          />
          <ExplorerHeading>Feature Flags</ExplorerHeading>
          <Config
            setFeatureFlag={setFeatureFlag}
            featureFlags={state.featureFlags}
          />
          <TypegenConfig setLanguage={setLanguage} language={state.language} />
        </div>
        <div style={{width: '50%', display: 'flex'}}>
          <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
            <Editor text={output} style={{flexGrow: 1}} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Config({featureFlags, setFeatureFlag}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
      }}>
      {FEATURE_FLAGS.map(({key, label}) => {
        return (
          <label key={key} style={{display: 'block'}}>
            <input
              type="checkbox"
              checked={featureFlags[key]}
              onChange={e => setFeatureFlag(key, e.target.checked)}
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}

function TypegenConfig({setLanguage, language}) {
  return (
    <div>
      <label>
        Type Generation Language:
        <select onChange={e => setLanguage(e.target.value)} value={language}>
          <option value="flow">Flow</option>
          <option value="typescript">TypeScript</option>
        </select>
      </label>
    </div>
  );
}

// A fork of @theme/Tabs which is a controlled component
function Tabs({values, selectedValue, setSelectedValue}) {
  return (
    <div className="tabs-container">
      <ul role="tablist" aria-orientation="horizontal" className="tabs">
        {values.map(({value, label}) => {
          const selected = selectedValue === value;
          return (
            <li
              role="tab"
              tabIndex={selected ? 0 : -1}
              aria-selected={selected}
              className={clsx('tabs__item', {
                'tabs__item--active': selected,
              })}
              key={value}
              onClick={() => setSelectedValue(value)}>
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// A heading which is intended to align well with Tabs
function ExplorerHeading({children}) {
  const padding =
    'var(--ifm-tabs-padding-vertical) var(--ifm-tabs-padding-horizontal)';
  return <h3 style={{margin: 0, padding}}>{children}</h3>;
}

function useResults(state) {
  const {schemaText, documentText, language, outputType} = state;
  const featureFlags = useSerializedFeatureFlags(state);

  const wasm = useWasm();
  return useMemo(() => {
    if (wasm == null) {
      // Ideally this might suspend.
      return {Ok: 'Loading...'};
    }
    try {
      switch (outputType) {
        case 'ast': {
          // TODO: Should you be able to see the Schema AST?
          return JSON.parse(wasm.parse_to_ast(documentText));
        }
        case 'ir': {
          return JSON.parse(wasm.parse_to_ir(schemaText, documentText));
        }
        case 'reader': {
          return JSON.parse(
            wasm.parse_to_reader_ast(featureFlags, schemaText, documentText),
          );
        }
        case 'normalization': {
          return JSON.parse(
            wasm.parse_to_normalization_ast(
              featureFlags,
              schemaText,
              documentText,
            ),
          );
        }
        case 'operation': {
          return JSON.parse(
            wasm.transform(featureFlags, schemaText, documentText),
          );
        }
        case 'types': {
          const typegenConfig = JSON.stringify({language});
          return JSON.parse(
            wasm.parse_to_types(
              featureFlags,
              typegenConfig,
              schemaText,
              documentText,
            ),
          );
        }
        default:
          throw new Error(`Unknown output type ${outputType}`);
      }
    } catch (e) {
      // We want to surface this message in the output area rather than as a
      // diagnostic, so we return this as an `Ok`.
      return {Ok: `Error: The compiler crashed: ${e.message}`};
    }
  }, [schemaText, documentText, outputType, wasm, featureFlags, language]);
}

// The Wasm module must be initialized async. Return `null` until the module is ready.
function useWasm() {
  const [wasm, setWasm] = useState(null);
  useEffect(() => {
    let unmounted = false;

    // Loading the `relay-compiler-playground` module in Docusaurus' build time
    // prerender crashes, so we lazily load it here in a useEffect.
    const _wasm = require('relay-compiler-playground');
    const init = _wasm.default;

    init().then(() => {
      if (!unmounted) {
        setWasm(_wasm);
      }
    });

    return () => {
      unmounted = true;
    };
  }, []);
  return wasm;
}
