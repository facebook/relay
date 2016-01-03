// @generated
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @fullSyntaxTransform
 */

'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var path = require('path');

function babelAdapter(Plugin, t, name, visitorsBuilder) {
  if (Plugin == null) {
    var _ret = (function () {
      // Babel 6.

      var _visitorsBuilder = visitorsBuilder(t);

      var _visitorsBuilder$visitor = _visitorsBuilder.visitor;
      var _Program = _visitorsBuilder$visitor.Program;
      var _TaggedTemplateExpression = _visitorsBuilder$visitor.TaggedTemplateExpression;

      var taggedTemplateExpressionVisitor = {
        TaggedTemplateExpression: function TaggedTemplateExpression(path) {
          _TaggedTemplateExpression(path, this);
        }
      };

      /**
       * Run both transforms on Program to make sure that they run before other plugins.
       */
      return {
        v: {
          visitor: {
            Program: function Program(path, state) {
              _Program(path, state);
              path.traverse(taggedTemplateExpressionVisitor, state);
            }
          }
        }
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  }
  // Babel 5.
  var legacyT = _extends({}, t, {
    nullLiteral: function nullLiteral() {
      return t.literal(null);
    },
    valueToNode: function valueToNode(value) {
      return t.literal(value);
    },
    objectProperty: function objectProperty(ident, value) {
      return t.property('init', ident, value);
    }
  });

  var visitors = visitorsBuilder(legacyT).visitor;
  var legacyVisitors = {};
  Object.keys(visitors).forEach(function (key) {
    legacyVisitors[key] = function (node, parent, scope, state) {
      var _this = this;

      var compatPath = {
        get: function get() {
          return _this.get.apply(_this, arguments);
        },
        node: node,
        parent: parent
      };
      var compatState = state.opts.compatState;
      if (!compatState) {
        var filename = state.opts.filename;
        state.opts.compatState = compatState = {
          file: {
            opts: {
              basename: path.basename(filename, path.extname(filename)),
              filename: filename
            }
          },
          isLegacyState: true
        };
      }
      return visitors[key](compatPath, compatState);
    };
  });
  return new Plugin(name, { visitor: legacyVisitors });
}

module.exports = babelAdapter;