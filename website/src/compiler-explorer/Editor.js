/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

/* eslint-disable lint/no-value-import */
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import 'monaco-editor/esm/vs/editor/contrib/hover/hover.js';
import 'monaco-editor/esm/vs/basic-languages/graphql/graphql.contribution.js';

import useThemeContext from '@theme/hooks/useThemeContext';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import * as React from 'react';
/* eslint-enable lint/no-value-import */

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
  const themeContext = useThemeContext();
  const editorTheme = themeContext.isDarkTheme ? 'vs-dark' : 'vs';

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
    editor.setValue(text);
  }, [editor, text]);

  useLayoutEffect(() => {
    if (editor == null) {
      return;
    }
    const model = editor.getModel();
    if (model == null) {
      return;
    }

    const markers = (diagnostics ?? []).map((diagnostic) => {
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
