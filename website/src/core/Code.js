/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

/* eslint-disable lint/no-value-import */
import useThemeContext from '@theme/hooks/useThemeContext';
import * as React from 'react';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
/* eslint-enable lint/no-value-import */

// Light theme

/* eslint-disable lint/fb-fds-usage-colors */
const tag = '#6a0352';
const attribute = '#081686';
const value = '#590000';
const punctuation = '#403f53';
const plainText = '#403f53';
const meta = '#444';
const other = '#793735';
/* eslint-enable lint/fb-fds-usage-colors */

const lightTheme = {
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

// Dark theme

/* eslint-disable lint/fb-fds-usage-colors */
const darkTag = '#da39b2';
const darkAttribute = '#8889e6';
const darkValue = '#e98785';
const darkPunctuation = '#908fa3';
const darkPlainText = '#eee';
const darkMeta = '#ccc';
const darkOther = '#c96765';
/* eslint-enable lint/fb-fds-usage-colors */

const darkTheme = {
  'code[class*="language-"]': {
    whiteSpace: 'pre',
    color: darkPlainText,
  },
  'pre[class*="language-"]': {
    whiteSpace: 'pre',
    margin: 0,
  },
  comment: {
    color: darkMeta,
  },
  prolog: {
    color: darkMeta,
  },
  doctype: {
    color: darkMeta,
  },
  cdata: {
    color: darkMeta,
  },
  punctuation: {
    color: darkPunctuation,
  },
  property: {
    color: darkAttribute,
  },
  tag: {
    color: darkTag,
  },
  boolean: {
    color: darkValue,
  },
  number: {
    color: darkValue,
  },
  constant: {
    color: darkValue,
  },
  symbol: {
    color: darkValue,
  },
  selector: {
    color: darkValue,
  },
  'attr-name': {
    color: darkAttribute,
  },
  string: {
    color: darkValue,
  },
  char: {
    color: darkValue,
  },
  builtin: {
    color: darkOther,
  },
  operator: {
    color: darkOther,
  },
  entity: {
    color: darkOther,
    cursor: 'help',
  },
  url: {
    color: darkOther,
  },
  'attr-value': {
    color: darkValue,
  },
  keyword: {
    color: darkValue,
  },
  regex: {
    color: darkOther,
  },
  important: {
    color: darkOther,
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
    color: darkAttribute,
  },
  'maybe-class-name': {
    color: darkAttribute,
  },
  parameter: {
    color: darkAttribute,
  },
};

const Code = ({children}) => {
  const {isDarkTheme} = useThemeContext();
  return (
    <SyntaxHighlighter
      language="jsx"
      style={isDarkTheme ? darkTheme : lightTheme}>
      {children}
    </SyntaxHighlighter>
  );
};

export default Code;
