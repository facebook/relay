/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

/* eslint-disable lint/no-value-import */
import Layout from '@theme/Layout';
import clsx from 'clsx';
import * as React from 'react';
const {useState, useEffect, useLayoutEffect, useMemo} = React;

const DEFAULT_SCHEMA = `
type User {
  name: String
  age: Int
  best_friend: User
}

type Query {
  me: User
}
 `.trim();

const DEFAULT_DOCUMENT = `
query MyQuery {
  me {
    name
    ...AgeFragment
    best_friend {
      ...AgeFragment
    }
  }
}

fragment AgeFragment on User {
  age
}
 `.trim();

export default function App() {
  return (
    <Layout title="Compiler Playground">
      <FillRemainingHeight minHeight={600}>
        <CompilerPlayground />
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

function CompilerPlayground() {
  const [schemaText, setSchemaText] = useState(DEFAULT_SCHEMA);
  const [documentText, setDocumentText] = useState(DEFAULT_DOCUMENT);
  const [outputType, setOutputType] = useState('operation');
  const results = useResults({schemaText, documentText, outputType});
  const output = results.Ok ?? '';
  const schemaDiagnostics = results.Err?.SchemaDiagnostics;
  const documentDiagnostics = results.Err?.DocumentDiagnostics;
  const padding = 20;
  const Editor = useMemo(() => {
    // Loading the Editor component causes Docusaurus' build time pre-rendering to
    // crash, so we initializie it lazily.
    return require('../compiler-playground/Editor').default;
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
          <PlaygroundHeading>Schema</PlaygroundHeading>
        </div>
        <div style={{width: '50%'}}>
          <Tabs
            values={[
              {value: 'operation', label: 'Transformed Operation'},
              {value: 'ast', label: 'GraphQL Ast'},
              {value: 'ir', label: 'IR'},
              {value: 'reader', label: 'Reader AST'},
            ]}
            selectedValue={outputType}
            setSelectedValue={selected => setOutputType(selected)}
          />
        </div>
      </div>
      <div style={{display: 'flex', flexGrow: 1, columnGap: padding}}>
        <div style={{width: '50%', display: 'flex', flexDirection: 'column'}}>
          <Editor
            text={schemaText}
            onDidChange={setSchemaText}
            style={{flexGrow: 1}}
            // We don't actually track spans when we parse the schema, so the
            // locations here are bogus. :(
            diagnostics={schemaDiagnostics}
          />
          <PlaygroundHeading>Document</PlaygroundHeading>
          <Editor
            text={documentText}
            onDidChange={setDocumentText}
            style={{flexGrow: 3}}
            diagnostics={documentDiagnostics}
          />
        </div>
        <div style={{width: '50%', display: 'flex'}}>
          <div style={{flexGrow: 1, display: 'flex'}}>
            <Editor text={output} style={{flexGrow: 1}} />
          </div>
        </div>
      </div>
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
function PlaygroundHeading({children}) {
  const padding =
    'var(--ifm-tabs-padding-vertical) var(--ifm-tabs-padding-horizontal)';
  return <h3 style={{margin: 0, padding}}>{children}</h3>;
}

function useResults({schemaText, documentText, outputType}) {
  const wasm = useWasm();
  return useMemo(() => {
    if (wasm == null) {
      // Ideally this might suspend.
      return 'Loading...';
    }
    switch (outputType) {
      case 'ast': {
        // TODO: Should you be able to see the Schema AST?
        return JSON.parse(wasm.parse_to_ast(documentText));
      }
      case 'ir': {
        return JSON.parse(wasm.parse_to_ir(schemaText, documentText));
      }
      case 'reader': {
        return JSON.parse(wasm.parse_to_reader_ast(schemaText, documentText));
      }
      case 'operation': {
        return JSON.parse(wasm.transform(schemaText, documentText));
      }
      default:
        throw new Error(`Unknown output type ${outputType}`);
    }
  }, [schemaText, documentText, outputType, wasm]);
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
