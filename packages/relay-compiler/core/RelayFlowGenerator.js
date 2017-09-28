/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayFlowGenerator
 * @flow
 * @format
 */

'use strict';

const RelayMaskTransform = require('RelayMaskTransform');

const t = require('babel-types');

const {
  FlattenTransform,
  IRVisitor,
  SchemaUtils,
} = require('../graphql-compiler/GraphQLCompilerPublic');
const {
  exactObjectTypeAnnotation,
  exportType,
  lineComments,
  readOnlyArrayOfType,
  readOnlyObjectTypeProperty,
  stringLiteralTypeAnnotation,
} = require('./RelayFlowBabelFactories');
const {
  transformScalarType,
  transformInputType,
} = require('./RelayFlowTypeTransformers');
const {GraphQLNonNull} = require('graphql');

import type {
  IRTransform,
  Fragment,
  Root,
  CompilerContext,
} from '../graphql-compiler/GraphQLCompilerPublic';
import type {ScalarTypeMapping} from './RelayFlowTypeTransformers';

const babelGenerator = require('babel-generator').default;

const {isAbstractType} = SchemaUtils;

function generate(
  node: Root | Fragment,
  customScalars?: ?ScalarTypeMapping,
  inputFieldWhiteList?: ?Array<string>,
): string {
  const ast = IRVisitor.visit(
    node,
    createVisitor(customScalars || {}, inputFieldWhiteList),
  );
  return babelGenerator(ast).code;
}

function makeProp(
  {key, schemaName, value, conditional, nodeType, nodeSelections},
  customScalars: ScalarTypeMapping,
  concreteType,
) {
  if (nodeType) {
    value = transformScalarType(
      nodeType,
      customScalars,
      selectionsToBabel([Array.from(nodeSelections.values())], customScalars),
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
const hasTypenameSelection = selections => selections.some(isTypenameSelection);
const onlySelectsTypename = selections => selections.every(isTypenameSelection);

function selectionsToBabel(selections, customScalars: ScalarTypeMapping) {
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
            makeProp(selection, customScalars, concreteType),
          ),
          ...byConcreteType[concreteType].map(selection =>
            makeProp(selection, customScalars, concreteType),
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
    const selectionMapValues = Array.from(selectionMap.values()).map(
      sel =>
        isTypenameSelection(sel) && sel.concreteType
          ? makeProp(
              {...sel, conditional: false},
              customScalars,
              sel.concreteType,
            )
          : makeProp(sel, customScalars),
    );
    types.push(exactObjectTypeAnnotation(selectionMapValues));
  }

  if (types.length === 0) {
    return exactObjectTypeAnnotation([]);
  }

  return types.length > 1 ? t.unionTypeAnnotation(types) : types[0];
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
  return (
    relayDirective != null &&
    relayDirective.args.some(
      ({name, value}) => name === 'plural' && value.value,
    )
  );
}

function createVisitor(
  customScalars: ScalarTypeMapping,
  inputFieldWhiteList: ?Array<string>,
) {
  return {
    leave: {
      Root(node) {
        const statements = [];
        if (node.operation !== 'query') {
          statements.push(
            generateInputVariablesType(
              node,
              customScalars,
              inputFieldWhiteList,
            ),
          );
        }
        statements.push(
          exportType(
            `${node.name}Response`,
            selectionsToBabel(node.selections, customScalars),
          ),
        );
        return t.program(statements);
      },

      Fragment(node) {
        let selections = flattenArray(node.selections);
        const numConecreteSelections = selections.filter(s => s.concreteType)
          .length;
        selections = selections.map(selection => {
          if (
            numConecreteSelections <= 1 &&
            isTypenameSelection(selection) &&
            !isAbstractType(node.type)
          ) {
            return [
              {
                ...selection,
                concreteType: node.type.toString(),
              },
            ];
          }
          return [selection];
        });
        const baseType = selectionsToBabel(selections, customScalars);
        const type = isPlural(node) ? readOnlyArrayOfType(baseType) : baseType;

        return t.program([exportType(node.name, type)]);
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
            value: transformScalarType(node.type, customScalars),
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
}

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

function generateInputVariablesType(
  node: Root,
  customScalars: ScalarTypeMapping,
  inputFieldWhiteList?: ?Array<string>,
) {
  return exportType(
    `${node.name}Variables`,
    exactObjectTypeAnnotation(
      node.argumentDefinitions.map(arg => {
        const property = t.objectTypeProperty(
          t.identifier(arg.name),
          transformInputType(arg.type, customScalars, inputFieldWhiteList),
        );
        if (!(arg.type instanceof GraphQLNonNull)) {
          property.optional = true;
        }
        return property;
      }),
    ),
  );
}

const FLOW_TRANSFORMS: Array<IRTransform> = [
  RelayMaskTransform.transform,
  (ctx: CompilerContext) => FlattenTransform.transform(ctx, {}),
];

module.exports = {
  generate,
  flowTransforms: FLOW_TRANSFORMS,
};
