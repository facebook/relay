/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

/* eslint-disable lint/no-value-import */
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import * as React from 'react';
/* eslint-enable lint/no-value-import */

/* eslint-disable lint/fb-fds-usage-colors */
const tag = '#aa0982';
const attribute = '#4876d6';
const value = '#c96765';
const punctuation = '#403f53';
const plainText = '#403f53';
const meta = '#aaa';
const other = '#c96765';
/* eslint-enable lint/fb-fds-usage-colors */

const theme = {
  'code[class*="language-"]': {
    whiteSpace: 'pre',
    color: plainText,
  },
  'pre[class*="language-"]': {
    whiteSpace: 'pre',
    margin: 0,
  },
  comment: {
    color: meta,
  },
  prolog: {
    color: meta,
  },
  doctype: {
    color: meta,
  },
  cdata: {
    color: meta,
  },
  punctuation: {
    color: punctuation,
  },
  property: {
    color: attribute,
  },
  tag: {
    color: tag,
  },
  boolean: {
    color: value,
  },
  number: {
    color: value,
  },
  constant: {
    color: value,
  },
  symbol: {
    color: value,
  },
  selector: {
    color: value,
  },
  'attr-name': {
    color: attribute,
  },
  string: {
    color: value,
  },
  char: {
    color: value,
  },
  builtin: {
    color: other,
  },
  operator: {
    color: other,
  },
  entity: {
    color: other,
    cursor: 'help',
  },
  url: {
    color: other,
  },
  'attr-value': {
    color: value,
  },
  keyword: {
    color: value,
  },
  regex: {
    color: other,
  },
  important: {
    color: other,
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  inserted: {
    color: 'green',
  },
  deleted: {
    color: 'red',
  },
  'class-name': {
    color: attribute,
  },
  'maybe-class-name': {
    color: attribute,
  },
  parameter: {
    color: attribute,
  },
};

const Code = ({children}) => {
  return (
    <SyntaxHighlighter language="jsx" style={theme}>
      {children}
    </SyntaxHighlighter>
  );
};

export default Code;
