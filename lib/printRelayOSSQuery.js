/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule printRelayOSSQuery
 * @typechecks
 * 
 */

'use strict';

var Map = require('fbjs/lib/Map');

var RelayProfiler = require('./RelayProfiler');
var RelayQuery = require('./RelayQuery');

var base62 = require('fbjs/lib/base62');
var invariant = require('fbjs/lib/invariant');

/**
 * @internal
 *
 * `printRelayOSSQuery(query)` returns a string representation of the query. The
 * supplied `node` must be flattened (and not contain fragments).
 */
function printRelayOSSQuery(node) {
  var fragmentTexts = [];
  var variableMap = new Map();
  var printerState = {
    fragmentCount: 0,
    fragmentNameByHash: {},
    fragmentNameByText: {},
    fragmentTexts: fragmentTexts,
    variableCount: 0,
    variableMap: variableMap
  };
  var queryText = null;
  if (node instanceof RelayQuery.Root) {
    queryText = printRoot(node, printerState);
  } else if (node instanceof RelayQuery.Mutation) {
    queryText = printMutation(node, printerState);
  } else if (node instanceof RelayQuery.Fragment) {
    queryText = printFragment(node, printerState);
  }
  !queryText ? process.env.NODE_ENV !== 'production' ? invariant(false, 'printRelayOSSQuery(): Unsupported node type.') : invariant(false) : undefined;
  var variables = {};
  variableMap.forEach(function (_ref) {
    var value = _ref.value;
    var variableID = _ref.variableID;
    return variables[variableID] = value;
  });

  return {
    text: [queryText].concat(fragmentTexts).join(' '),
    variables: variables
  };
}

function printRoot(node, printerState) {
  !!node.getBatchCall() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'printRelayOSSQuery(): Deferred queries are not supported.') : invariant(false) : undefined;
  var identifyingArg = node.getIdentifyingArg();
  var identifyingArgName = identifyingArg && identifyingArg.name || null;
  var identifyingArgType = identifyingArg && identifyingArg.type || null;
  var identifyingArgValue = identifyingArg && identifyingArg.value || null;
  var fieldName = node.getFieldName();
  if (identifyingArgValue != null) {
    !identifyingArgName ? process.env.NODE_ENV !== 'production' ? invariant(false, 'printRelayOSSQuery(): Expected an argument name for root field `%s`.', fieldName) : invariant(false) : undefined;
    var rootArgString = printArgument(identifyingArgName, identifyingArgValue, identifyingArgType, printerState);
    if (rootArgString) {
      fieldName += '(' + rootArgString + ')';
    }
  }
  // Note: children must be traversed before printing variable definitions
  var children = printChildren(node, printerState);
  var queryString = node.getName() + printVariableDefinitions(printerState);
  fieldName += printDirectives(node);

  return 'query ' + queryString + '{' + fieldName + children + '}';
}

function printMutation(node, printerState) {
  var call = node.getCall();
  var inputString = printArgument(node.getCallVariableName(), call.value, node.getInputType(), printerState);
  !inputString ? process.env.NODE_ENV !== 'production' ? invariant(false, 'printRelayOSSQuery(): Expected mutation `%s` to have a value for `%s`.', node.getName(), node.getCallVariableName()) : invariant(false) : undefined;
  // Note: children must be traversed before printing variable definitions
  var children = printChildren(node, printerState);
  var mutationString = node.getName() + printVariableDefinitions(printerState);
  var fieldName = call.name + '(' + inputString + ')';

  return 'mutation ' + mutationString + '{' + fieldName + children + '}';
}

function printVariableDefinitions(_ref2) {
  var variableMap = _ref2.variableMap;

  var argStrings = null;
  variableMap.forEach(function (_ref3) {
    var type = _ref3.type;
    var variableID = _ref3.variableID;

    argStrings = argStrings || [];
    argStrings.push('$' + variableID + ':' + type);
  });
  if (argStrings) {
    return '(' + argStrings.join(',') + ')';
  }
  return '';
}

function printFragment(node, printerState) {
  var directives = printDirectives(node);
  return 'fragment ' + node.getDebugName() + ' on ' + node.getType() + directives + printChildren(node, printerState);
}

function printChildren(node, printerState) {
  var childrenText = [];
  var children = node.getChildren();
  var fragments = undefined;
  for (var ii = 0; ii < children.length; ii++) {
    var child = children[ii];
    if (child instanceof RelayQuery.Field) {
      var fieldText = child.getSchemaName();
      var fieldCalls = child.getCallsWithValues();
      if (fieldCalls.length) {
        fieldText = child.getSerializationKey() + ':' + fieldText;
        var argTexts = [];
        for (var jj = 0; jj < fieldCalls.length; jj++) {
          var _fieldCalls$jj = fieldCalls[jj];
          var _name = _fieldCalls$jj.name;
          var _value = _fieldCalls$jj.value;

          var argText = printArgument(_name, _value, child.getCallType(_name), printerState);
          if (argText) {
            argTexts.push(argText);
          }
        }
        if (argTexts.length) {
          fieldText += '(' + argTexts.join(',') + ')';
        }
      }
      fieldText += printDirectives(child);
      if (child.getChildren().length) {
        fieldText += printChildren(child, printerState);
      }
      childrenText.push(fieldText);
    } else if (child instanceof RelayQuery.Fragment) {
      if (child.getChildren().length) {
        var _fragmentNameByHash = printerState.fragmentNameByHash;
        var _fragmentNameByText = printerState.fragmentNameByText;
        var _fragmentTexts = printerState.fragmentTexts;

        // Avoid walking fragments if we have printed the same one before.
        var _fragmentHash = child.getCompositeHash();

        var fragmentName = undefined;
        if (_fragmentNameByHash.hasOwnProperty(_fragmentHash)) {
          fragmentName = _fragmentNameByHash[_fragmentHash];
        } else {
          // Avoid reprinting a fragment that is identical to another fragment.
          var _fragmentText = child.getType() + printDirectives(child) + printChildren(child, printerState);
          if (_fragmentNameByText.hasOwnProperty(_fragmentText)) {
            fragmentName = _fragmentNameByText[_fragmentText];
          } else {
            fragmentName = 'F' + base62(printerState.fragmentCount++);
            _fragmentNameByHash[_fragmentHash] = fragmentName;
            _fragmentNameByText[_fragmentText] = fragmentName;
            _fragmentTexts.push('fragment ' + fragmentName + ' on ' + _fragmentText);
          }
        }
        if (!fragments || !fragments.hasOwnProperty(fragmentName)) {
          fragments = fragments || {};
          fragments[fragmentName] = true;
          childrenText.push('...' + fragmentName);
        }
      }
    } else {
      !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'printRelayOSSQuery(): Expected a field or fragment, got `%s`.', child.constructor.name) : invariant(false) : undefined;
    }
  }
  if (!childrenText) {
    return '';
  }
  return childrenText.length ? '{' + childrenText.join(',') + '}' : '';
}

function printDirectives(node) {
  var directiveStrings = undefined;
  node.getDirectives().forEach(function (directive) {
    var dirString = '@' + directive.name;
    if (directive.args.length) {
      dirString += '(' + directive.args.map(printDirective).join(',') + ')';
    }
    directiveStrings = directiveStrings || [];
    directiveStrings.push(dirString);
  });
  if (!directiveStrings) {
    return '';
  }
  return ' ' + directiveStrings.join(' ');
}

function printDirective(_ref4) {
  var name = _ref4.name;
  var value = _ref4.value;

  !(typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'printRelayOSSQuery(): Relay only supports directives with scalar values ' + '(boolean, number, or string), got `%s: %s`.', name, value) : invariant(false) : undefined;
  return name + ':' + JSON.stringify(value);
}

function printArgument(name, value, type, printerState) {
  if (value == null) {
    return value;
  }
  var stringValue = undefined;
  if (type != null) {
    var _variableID = createVariable(name, value, type, printerState);
    stringValue = '$' + _variableID;
  } else {
    stringValue = JSON.stringify(value);
  }
  return name + ':' + stringValue;
}

function createVariable(name, value, type, printerState) {
  var valueKey = JSON.stringify(value);
  var existingVariable = printerState.variableMap.get(valueKey);
  if (existingVariable) {
    return existingVariable.variableID;
  } else {
    var _variableID2 = name + '_' + base62(printerState.variableCount++);
    printerState.variableMap.set(valueKey, {
      type: type,
      value: value,
      variableID: _variableID2
    });
    return _variableID2;
  }
}

module.exports = RelayProfiler.instrument('printRelayQuery', printRelayOSSQuery);