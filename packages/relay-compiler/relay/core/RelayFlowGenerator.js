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
 * @format
 */

'use strict';

const RelayIRVisitor = require('RelayIRVisitor');

const babelGenerator = require('babel-generator').default;
const t = require('babel-types');

const {
  GraphQLEnumType,
  GraphQLInputType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType,
} = require('graphql');
const {isAbstractType} = require('RelaySchemaUtils');

import type {Fragment, Root} from 'RelayIR';

const printBabel = ast => babelGenerator(ast).code;

function generate(
  node: Root | Fragment,
  inputFieldWhiteList?: Array<string>,
): string {
  const output = [];
  if (node.kind === 'Root' && node.operation !== 'query') {
    const inputAST = generateInputVariablesType(node, inputFieldWhiteList);
    output.push(printBabel(inputAST));
  }
  const responseAST = RelayIRVisitor.visit(node, RelayCodeGenVisitor);
  output.push(printBabel(responseAST));
  return output.join('\n\n');
}

function makeProp(
  {key, schemaName, value, conditional, nodeType, nodeSelections},
  concreteType,
) {
  if (nodeType) {
    value = transformScalarField(
      nodeType,
      selectionsToBabel([Array.from(nodeSelections.values())]),
    );
  }
  if (schemaName === '__typename' && concreteType) {
    value = stringLiteralTypeAnnotation(concreteType);
  }
  const typeProperty = readOnlyObjectTypeProperty(key, value);
  if (conditional) {
    typeProperty.optional = true;
  }
  return typeProperty;
}

const isTypenameSelection = selection => selection.schemaName === '__typename';
const hasTypenameSelection = (selections: $FlowIssue) =>
  selections.some(isTypenameSelection);
const onlySelectsTypename = selections => selections.every(isTypenameSelection);

function selectionsToBabel(selections) {
  const baseFields = new Map();
  const byConcreteType = {};

  flattenArray(selections).forEach(selection => {
    const {concreteType} = selection;
    if (concreteType) {
      byConcreteType[concreteType] = byConcreteType[concreteType] || [];
      byConcreteType[concreteType].push(selection);
    } else {
      const previousSel = baseFields.get(selection.key);

      baseFields.set(
        selection.key,
        previousSel ? mergeSelection(selection, previousSel) : selection,
      );
    }
  });

  const types = [];

  if (
    Object.keys(byConcreteType).length &&
    onlySelectsTypename(Array.from(baseFields.values())) &&
    (hasTypenameSelection(Array.from(baseFields.values())) ||
      Object.keys(byConcreteType).every(type =>
        hasTypenameSelection(byConcreteType[type]),
      ))
  ) {
    for (const concreteType in byConcreteType) {
      types.push(
        exactObjectTypeAnnotation([
          ...Array.from(baseFields.values()).map(selection =>
            makeProp(selection, concreteType),
          ),
          ...byConcreteType[concreteType].map(selection =>
            makeProp(selection, concreteType),
          ),
        ]),
      );
    }
    // It might be some other type then the listed concrete types. Ideally, we
    // would set the type to diff(string, set of listed concrete types), but
    // this doesn't exist in Flow at the time.
    const otherProp = readOnlyObjectTypeProperty(
      '__typename',
      stringLiteralTypeAnnotation('%other'),
    );
    otherProp.leadingComments = lineComments(
      "This will never be '%other', but we need some",
      'value in case none of the concrete values match.',
    );
    types.push(exactObjectTypeAnnotation([otherProp]));
  } else {
    let selectionMap = selectionsToMap(Array.from(baseFields.values()));
    for (const concreteType in byConcreteType) {
      selectionMap = mergeSelections(
        selectionMap,
        selectionsToMap(
          byConcreteType[concreteType].map(sel => ({
            ...sel,
            conditional: true,
          })),
        ),
      );
    }
    types.push(
      exactObjectTypeAnnotation(
        Array.from(selectionMap.values()).map(sel => makeProp(sel)),
      ),
    );
  }

  if (!types.length) {
    return exactObjectTypeAnnotation([]);
  }

  return types.length > 1 ? t.unionTypeAnnotation(types) : types[0];
}

function lineComments(...lines: Array<string>) {
  return lines.map(line => ({type: 'CommentLine', value: ' ' + line}));
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
  return {
    ...a,
    nodeSelections: a.nodeSelections
      ? mergeSelections(a.nodeSelections, b.nodeSelections)
      : null,
    conditional: a.conditional && b.conditional,
  };
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

function isPlural({directives}): boolean {
  const relayDirective = directives.find(({name}) => name === 'relay');

  if (relayDirective) {
    return !!relayDirective.args.find(
      ({name, value}) => name === 'plural' && value.value,
    );
  } else {
    return false;
  }
}

const RelayCodeGenVisitor = {
  leave: {
    Root(node) {
      return t.exportNamedDeclaration(
        t.typeAlias(
          t.identifier(`${node.name}Response`),
          null,
          selectionsToBabel(node.selections),
        ),
        [],
        null,
      );
    },

    Fragment(node) {
      const baseType = selectionsToBabel(node.selections);
      const type = isPlural(node) ? arrayOfType(baseType) : baseType;

      return t.exportNamedDeclaration(
        t.typeAlias(t.identifier(node.name), null, type),
        [],
        null,
      );
    },

    InlineFragment(node) {
      const typeCondition = node.typeCondition;
      return flattenArray(node.selections).map(typeSelection => {
        return isAbstractType(typeCondition)
          ? {
              ...typeSelection,
              conditional: true,
            }
          : {
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
    const previousSel = map.get(selection.key);
    map.set(
      selection.key,
      previousSel ? mergeSelection(previousSel, selection) : selection,
    );
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
      transformNonNullableScalarField(type, objectProps),
    );
  }
}

function arrayOfType(thing) {
  return t.genericTypeAnnotation(
    t.identifier('$ReadOnlyArray'),
    t.typeParameterInstantiation([thing]),
  );
}

function exactObjectTypeAnnotation(props) {
  const typeAnnotation = t.objectTypeAnnotation(props);
  typeAnnotation.exact = true;
  return typeAnnotation;
}

function readOnlyObjectTypeProperty(key, value) {
  const prop = t.objectTypeProperty(t.identifier(key), value);
  prop.variance = 'plus';
  return prop;
}

function transformGraphQLScalarType(type: GraphQLScalarType) {
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
}

function transformGraphQLEnumType(type: GraphQLEnumType) {
  // TODO create a flow type for enums
  return t.unionTypeAnnotation(
    type.getValues().map(({value}) => stringLiteralTypeAnnotation(value)),
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
    return transformGraphQLScalarType(type);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

function transformNonNullableInputType(
  type: GraphQLInputType,
  inputFieldWhiteList?: Array<string>,
) {
  if (type instanceof GraphQLList) {
    return arrayOfType(transformInputType(type.ofType, inputFieldWhiteList));
  } else if (type instanceof GraphQLScalarType) {
    return transformGraphQLScalarType(type);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type);
  } else if (type instanceof GraphQLInputObjectType) {
    const fields = type.getFields();
    const props = Object.keys(fields)
      .map(key => fields[key])
      .filter(
        field =>
          !inputFieldWhiteList || inputFieldWhiteList.indexOf(field.name) < 0,
      )
      .map(field => {
        const property = t.objectTypeProperty(
          t.identifier(field.name),
          transformInputType(field.type, inputFieldWhiteList),
        );
        if (!(field.type instanceof GraphQLNonNull)) {
          property.optional = true;
        }
        return property;
      });
    return t.objectTypeAnnotation(props);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

function transformInputType(
  type: GraphQLInputType,
  inputFieldWhiteList?: Array<string>,
) {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableInputType(type.ofType, inputFieldWhiteList);
  } else {
    return t.nullableTypeAnnotation(
      transformNonNullableInputType(type, inputFieldWhiteList),
    );
  }
}

function generateInputVariablesType(
  node: Root,
  inputFieldWhiteList?: Array<string>,
) {
  return t.exportNamedDeclaration(
    t.typeAlias(
      t.identifier(`${node.name}Variables`),
      null,
      exactObjectTypeAnnotation(
        node.argumentDefinitions.map(arg => {
          const property = t.objectTypeProperty(
            t.identifier(arg.name),
            transformInputType(arg.type, inputFieldWhiteList),
          );
          if (!(arg.type instanceof GraphQLNonNull)) {
            property.optional = true;
          }
          return property;
        }),
      ),
    ),
    [],
    null,
  );
}

module.exports = {generate};
