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
  const [featureFlags, setFeatureFlags] = useState('{}');
  const [typegenConfig, setTypegenConfig] = useState('{}');
  const [schemaText, setSchemaText] = useState(DEFAULT_SCHEMA);
  const [documentText, setDocumentText] = useState(DEFAULT_DOCUMENT);
  const [outputType, setOutputType] = useState('operation');
  const results = useResults({
    schemaText,
    documentText,
    outputType,
    featureFlags,
    typegenConfig,
  });
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
            selectedValue={outputType}
            setSelectedValue={(selected) => setOutputType(selected)}
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
          <ExplorerHeading>Document</ExplorerHeading>
          <Editor
            text={documentText}
            onDidChange={setDocumentText}
            style={{flexGrow: 3}}
            diagnostics={documentDiagnostics}
          />
          <ExplorerHeading>Feature Flags</ExplorerHeading>
          <Config onFeatureFlagsChanged={setFeatureFlags} />
          <TypegenConfig onTypegenConfigChanged={setTypegenConfig} />
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

function Config({onFeatureFlagsChanged}) {
  const [required, setRequired] = useState(true);
  const [flight, setFlight] = useState(true);
  const [hashArgs, setHashArgs] = useState(true);
  const [noInline, setNoInline] = useState(true);
  const [threeDBranchArg, set3DBranchArg] = useState(true);
  const [actorChangeSupport, setActorChangeSupport] = useState(true);
  const [textArtifacts, setTextArtifacts] = useState(true);
  const [clientEdges, setClientEdges] = useState(true);

  useEffect(() => {
    onFeatureFlagsChanged(
      JSON.stringify({
        enable_flight_transform: flight,
        enable_required_transform: required,
        hash_supported_argument: {kind: hashArgs ? 'enabled' : 'disabled'},
        no_inline: {kind: noInline ? 'enabled' : 'disabled'},
        enable_3d_branch_arg_generation: threeDBranchArg,
        actor_change_support: {
          kind: actorChangeSupport ? 'enabled' : 'disabled',
        },
        text_artifacts: {kind: textArtifacts ? 'enabled' : 'disabled'},
        enable_client_edges: {kind: clientEdges ? 'enabled' : 'disabled'},
      }),
    );
  }, [
    required,
    flight,
    hashArgs,
    noInline,
    threeDBranchArg,
    actorChangeSupport,
    textArtifacts,
    clientEdges,
    onFeatureFlagsChanged,
  ]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
      }}>
      <ConfigOption checked={flight} set={setFlight}>
        Flight Transform
      </ConfigOption>
      <ConfigOption checked={required} set={setRequired}>
        @required
      </ConfigOption>
      <ConfigOption checked={hashArgs} set={setHashArgs}>
        Hash Supported Arguments
      </ConfigOption>
      <ConfigOption checked={noInline} set={setNoInline}>
        @no_inline
      </ConfigOption>
      <ConfigOption checked={threeDBranchArg} set={set3DBranchArg}>
        3D Branch Arg Generation
      </ConfigOption>
      <ConfigOption checked={actorChangeSupport} set={setActorChangeSupport}>
        Actor Change Support
      </ConfigOption>
      <ConfigOption checked={textArtifacts} set={setTextArtifacts}>
        Text Artifacts
      </ConfigOption>
      <ConfigOption checked={clientEdges} set={setClientEdges}>
        Client Edges
      </ConfigOption>
    </div>
  );
}

function TypegenConfig({onTypegenConfigChanged}) {
  const [language, setLangauge] = useState('flow');
  useEffect(() => {
    onTypegenConfigChanged(
      JSON.stringify({
        language,
      }),
    );
  }, [language, onTypegenConfigChanged]);

  return (
    <div>
      <label>
        Type Generation Language:
        <select onChange={(e) => setLangauge(e.target.value)}>
          <option value="flow">Flow</option>
          <option value="typescript">TypeScript</option>
        </select>
      </label>
    </div>
  );
}

function ConfigOption({checked, set, children}) {
  return (
    <label style={{display: 'block'}}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => set(e.target.checked)}
      />
      {children}
    </label>
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

function useResults({
  schemaText,
  documentText,
  outputType,
  featureFlags,
  typegenConfig,
}) {
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
  }, [schemaText, documentText, outputType, wasm, featureFlags, typegenConfig]);
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
