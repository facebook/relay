/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFlowGenerator
 * @flow
 */

'use strict';

const RelayIRVisitor = require('RelayIRVisitor');

const babelGenerator = require('babel-generator').default;
const invariant = require('invariant');
const t = require('babel-types');

const {
  GraphQLEnumType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType,
} = require('graphql');
const {isAbstractType} = require('RelaySchemaUtils');

import type {
  Fragment,
  Root,
} from 'RelayIR';

const printBabel = ast => babelGenerator(ast).code;

function generate(node: Root | Fragment): string {
  const babelAST = RelayIRVisitor.visit(node, RelayCodeGenVisitor);
  return printBabel(babelAST);
}

function makeProp({key, schemaName, value, conditional, nodeType, nodeSelections}, concreteType) {
  if (nodeType) {
    value = transformScalarField(nodeType, selectionsToBabel([nodeSelections.values()]));
  }
  if (schemaName === '__typename' && concreteType) {
    value = stringLiteralTypeAnnotation(concreteType);
  }
  const typeProperty = t.objectTypeProperty(t.identifier(key), value);
  if (conditional) {
    typeProperty.optional = true;
  }
  return typeProperty;
}

const isTypenameSelection = selection => selection.schemaName === '__typename';
const hasTypenameSelection = (selections: $FlowIssue) => selections.some(isTypenameSelection);
const onlySelectsTypename = selections => selections.every(isTypenameSelection);

function selectionsToBabel(selections) {
  const baseFields = [];
  const byConcreteType = {};

  flattenArray(selections).forEach(selection => {
    const {concreteType} = selection;
    if (concreteType) {
      byConcreteType[concreteType] = byConcreteType[concreteType] || [];
      byConcreteType[concreteType].push(selection);
    } else {
      baseFields.push(selection);
    }
  });

  const types = [];

  if (
    Object.keys(byConcreteType).length &&
    onlySelectsTypename(baseFields) &&
    (
      hasTypenameSelection(baseFields) ||
      Object.values(byConcreteType).every(hasTypenameSelection)
    )
  ) {
    for (const concreteType in byConcreteType) {
      types.push(
        t.objectTypeAnnotation([
          ...baseFields.map(selection => makeProp(selection, concreteType)),
          ...byConcreteType[concreteType].map(
            selection => makeProp(selection, concreteType)
          ),
        ])
      );
    }
    // It might be some other type then the listed concrete types. Ideally, we
    // would set the type to diff(string, set of listed concrete types), but
    // this doesn't exist in Flow at the time.
    const otherProp = t.objectTypeProperty(
      t.identifier('__typename'),
      stringLiteralTypeAnnotation('%other'),
    );
    otherProp.leadingComments = lineComments(
      'This will never be \'%other\', but we need some',
      'value in case none of the concrete values match.'
    );
    types.push(t.objectTypeAnnotation([otherProp]));
  } else {
    const props = {};
    baseFields.forEach(selection => {
      props[selection.key] = makeProp(selection);
    });
    let selectionMap = selectionsToMap(baseFields);
    for (const concreteType in byConcreteType) {
      selectionMap = mergeSelections(
        selectionMap,
        selectionsToMap(byConcreteType[concreteType])
      );
    }
    types.push(t.objectTypeAnnotation(
      [...selectionMap.values()].map(sel => makeProp(sel))
    ));
  }

  if (!types.length) {
    return t.objectTypeAnnotation([]);
  }

  return types.length > 1 ? t.unionTypeAnnotation(types) : types[0];
}

function lineComments(...lines: Array<string>) {
  return lines.map(line => (
    {type: 'CommentLine', value: ' ' + line}
  ));
}

function stringLiteralTypeAnnotation(value) {
  const annotation = t.stringLiteralTypeAnnotation();
  annotation.value = value;
  return annotation;
}

function mergeSelection(a, b) {
  if (!a) {
    return {
      ...b,
      conditional: true,
    };
  }
  if (a.nodeSelections) {
    invariant(b.nodeSelections, 'xx');
    return {
      ...a,
      nodeSelections: mergeSelections(a.nodeSelections, b.nodeSelections),
      conditional: a.conditional || b.conditional,
    };
  }
  return a;
}

function mergeSelections(a, b) {
  const merged = new Map();
  for (const [key, value] of a.entries()) {
    merged.set(key, value);
  }
  for (const [key, value] of b.entries()) {
    merged.set(key, mergeSelection(a.get(key), value));
  }
  return merged;
}

const RelayCodeGenVisitor = {
  leave: {
    Root(node) {
      return t.exportNamedDeclaration(
        t.typeAlias(
          t.identifier(node.name),
          null,
          selectionsToBabel(node.selections)
        ),
        [],
        null
      );
    },

    Fragment(node) {
      return t.exportNamedDeclaration(
        t.typeAlias(
          t.identifier(node.name),
          null,
          selectionsToBabel(node.selections)
        ),
        [],
        null
      );
    },

    InlineFragment(node) {
      const typeCondition = node.typeCondition;
      return flattenArray(node.selections).map(typeSelection => {
        return isAbstractType(typeCondition) ? {
          ...typeSelection,
          conditional: true,
        } : {
          ...typeSelection,
          concreteType: typeCondition.toString(),
        };
      });
    },
    Condition(node) {
      return flattenArray(node.selections).map(selection => {
        return {
          ...selection,
          conditional: true,
        };
      });
    },
    ScalarField(node) {
      return [
        {
          key: node.alias || node.name,
          schemaName: node.name,
          value: transformScalarField(node.type),
        },
      ];
    },
    LinkedField(node) {
      return [
        {
          key: node.alias || node.name,
          schemaName: node.name,
          nodeType: node.type,
          nodeSelections: selectionsToMap(flattenArray(node.selections)),
        },
      ];
    },
    FragmentSpread(node) {
      return [];
    },
  },
};

function selectionsToMap(selections) {
  const map = new Map();
  selections.forEach(selection => {
    invariant(
      !map.has(selection.key),
      'RelayFlowGenerator: Duplicate key: `%s`.',
      selection.key
    );
    map.set(selection.key, selection);
  });
  return map;
}

function flattenArray<T>(arrayOfArrays: Array<Array<T>>): Array<T> {
  const result = [];
  arrayOfArrays.forEach(array => result.push(...array));
  return result;
}

function transformScalarField(type, objectProps) {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableScalarField(type.ofType, objectProps);
  } else {
    return t.nullableTypeAnnotation(
      transformNonNullableScalarField(type, objectProps)
    );
  }
}

function arrayOfType(thing) {
  return t.genericTypeAnnotation(
    t.identifier('Array'),
    t.typeParameterInstantiation([thing])
  );
}

function transformNonNullableScalarField(type: GraphQLType, objectProps) {
  if (type instanceof GraphQLList) {
    return arrayOfType(transformScalarField(type.ofType, objectProps));
  } else if (
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLUnionType ||
    type instanceof GraphQLInterfaceType
  ) {
    return objectProps;
  } else if (type instanceof GraphQLScalarType) {
    switch (type.name) {
      case 'ID':
      case 'String':
      case 'Url':
        return t.stringTypeAnnotation();
      case 'Float':
      case 'Int':
        return t.numberTypeAnnotation();
      case 'Boolean':
        return t.booleanTypeAnnotation();
      default:
        return t.anyTypeAnnotation();
    }
  } else if (type instanceof GraphQLEnumType) {
    // TODO create a flow type for enums
    return t.unionTypeAnnotation(
      type.getValues().map(({value}) => stringLiteralTypeAnnotation(value))
    );
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

module.exports = {generate};
