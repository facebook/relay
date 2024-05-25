/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import 'monaco-editor/esm/vs/editor/contrib/hover/hover.js';
import 'monaco-editor/esm/vs/basic-languages/graphql/graphql.contribution.js';

import {useThemeConfig} from '@docusaurus/theme-common';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import * as React from 'react';

const {useMemo, useState, useLayoutEffect, useEffect} = React;

const editorOptions = {
  // https://stackoverflow.com/a/53448744/1263117
  glyphMargin: false,
  folding: false,
  // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 0,
  language: 'graphql',
  minimap: {
    enabled: false,
  },
  lineNumbers: 'off',
  automaticLayout: true,
  fontSize: '16px',
  scrollBeyondLastLine: false,
  // highlightActiveIndentGuide: false,
  renderIndentGuides: false,
  renderLineHighlight: 'none',
  tabSize: 2,
};

export default function Editor({text, onDidChange, diagnostics, style}) {
  const [ref, setRef] = useState(null);
  const isDarkMode = useIsDarkMode();
  const editorTheme = isDarkMode ? 'vs-dark' : 'vs';

  const editor = useMemo(() => {
    if (ref == null) {
      return null;
    }
    return monaco.editor.create(ref, editorOptions);
  }, [ref]);

  useLayoutEffect(() => {
    if (editor == null) {
      return;
    }

    // Calling setValue breaks undo, so we try not to do it if we don't need to.
    if (editor.getValue() !== text) {
      editor.setValue(text);
    }
  }, [editor, text]);

  useLayoutEffect(() => {
    if (editor == null) {
      return;
    }
    const model = editor.getModel();
    if (model == null) {
      return;
    }

    const markers = (diagnostics ?? []).map(diagnostic => {
      return {
        severity: 8, // Error
        message: diagnostic.message,
        startLineNumber: diagnostic.line_start + 1,
        startColumn: diagnostic.column_start + 1,
        endLineNumber: diagnostic.line_end + 1,
        endColumn: diagnostic.column_end + 1,
      };
    });
    monaco.editor.setModelMarkers(model, 'relay', markers);
  }, [editor, diagnostics]);

  useLayoutEffect(() => {
    monaco.editor.setTheme(editorTheme);
  }, [editorTheme]);

  useEffect(() => {
    if (editor == null || onDidChange == null) {
      return;
    }
    const disposable = editor.onDidChangeModelContent(() => {
      onDidChange(editor.getValue());
    });
    return () => {
      disposable.dispose();
    };
  }, [editor, onDidChange]);

  return <div ref={setRef} style={style}></div>;
}

function getIsDarkMode() {
  return document.documentElement.dataset.theme === 'dark';
}

// Docusaurus does not provide a hook for this, so we listen for the data
// attribute on the HTML element to change.
function useIsDarkMode() {
  const [mode, setMode] = useState(() => getIsDarkMode());
  useEffect(() => {
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          setMode(getIsDarkMode());
        }
      }
    });

    // Configuration of the observer
    const config = {attributes: true};

    // Start observing the target node
    observer.observe(document.documentElement, config);
    return () => {
      observer.disconnect();
    };
  }, []);
  return mode;
}
