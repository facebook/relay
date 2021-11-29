/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;

use crate::ast::{Ast, AstBuilder, AstKey, ObjectEntry, Primitive, QueryID, RequestParameters};
use crate::constants::CODEGEN_CONSTANTS;
use common::{NamedItem, WithLocation};
use graphql_ir::{
    Argument, Condition, ConditionValue, ConstantValue, Directive, FragmentDefinition,
    FragmentSpread, InlineFragment, LinkedField, OperationDefinition, ScalarField, Selection,
    Value, VariableDefinition,
};
use graphql_syntax::OperationKind;
use intern::string_key::{Intern, StringKey};
use md5::{Digest, Md5};
use relay_transforms::{
    extract_connection_metadata_from_directive, extract_handle_field_directives,
    extract_values_from_handle_field_directive, generate_abstract_type_refinement_key,
    remove_directive, ClientEdgeMetadata, ConnectionConstants, ConnectionMetadata, DeferDirective,
    InlineDirectiveMetadata, ModuleMetadata, RefetchableMetadata, RelayDirective,
    RelayResolverSpreadMetadata, RequiredMetadataDirective, StreamDirective,
    CLIENT_EXTENSION_DIRECTIVE_NAME, DEFER_STREAM_CONSTANTS, DIRECTIVE_SPLIT_OPERATION,
    INLINE_DIRECTIVE_NAME, INTERNAL_METADATA_DIRECTIVE, NO_INLINE_DIRECTIVE_NAME,
    REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY, RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN,
    RELAY_CLIENT_COMPONENT_MODULE_ID_ARGUMENT_NAME, RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME,
    TYPE_DISCRIMINATOR_DIRECTIVE_NAME,
};
use schema::{SDLSchema, Schema};

pub fn build_request_params_ast_key(
    schema: &SDLSchema,
    request_parameters: RequestParameters<'_>,
    ast_builder: &mut AstBuilder,
    operation: &OperationDefinition,
) -> AstKey {
    let mut operation_builder =
        CodegenBuilder::new(schema, CodegenVariant::Normalization, ast_builder);
    operation_builder.build_request_parameters(operation, request_parameters)
}

pub fn build_request(
    schema: &SDLSchema,
    ast_builder: &mut AstBuilder,
    operation: &OperationDefinition,
    fragment: &FragmentDefinition,
    request_parameters: AstKey,
) -> AstKey {
    let mut operation_builder =
        CodegenBuilder::new(schema, CodegenVariant::Normalization, ast_builder);
    let operation = Primitive::Key(operation_builder.build_operation(operation));
    let mut fragment_builder = CodegenBuilder::new(schema, CodegenVariant::Reader, ast_builder);
    let fragment = Primitive::Key(fragment_builder.build_fragment(fragment, true));

    ast_builder.intern(Ast::Object(vec![
        ObjectEntry {
            key: CODEGEN_CONSTANTS.fragment,
            value: fragment,
        },
        ObjectEntry {
            key: CODEGEN_CONSTANTS.kind,
            value: Primitive::String(CODEGEN_CONSTANTS.request),
        },
        ObjectEntry {
            key: CODEGEN_CONSTANTS.operation,
            value: operation,
        },
        ObjectEntry {
            key: CODEGEN_CONSTANTS.params,
            value: Primitive::Key(request_parameters),
        },
    ]))
}

pub fn build_request_params(operation: &OperationDefinition) -> RequestParameters<'_> {
    RequestParameters {
        name: operation.name.item,
        operation_kind: operation.kind,
        metadata: Default::default(),
        id: &None,
        text: None,
    }
}

pub fn build_operation(
    schema: &SDLSchema,
    ast_builder: &mut AstBuilder,
    operation: &OperationDefinition,
) -> AstKey {
    let mut builder = CodegenBuilder::new(schema, CodegenVariant::Normalization, ast_builder);
    builder.build_operation(operation)
}

pub fn build_fragment(
    schema: &SDLSchema,
    ast_builder: &mut AstBuilder,
    fragment: &FragmentDefinition,
) -> AstKey {
    let mut builder = CodegenBuilder::new(schema, CodegenVariant::Reader, ast_builder);
    builder.build_fragment(fragment, false)
}

struct CodegenBuilder<'schema, 'builder> {
    connection_constants: ConnectionConstants,
    schema: &'schema SDLSchema,
    variant: CodegenVariant,
    ast_builder: &'builder mut AstBuilder,
}

#[derive(PartialEq)]
enum CodegenVariant {
    Reader,
    Normalization,
}

impl<'schema, 'builder> CodegenBuilder<'schema, 'builder> {
    fn new(
        schema: &'schema SDLSchema,
        variant: CodegenVariant,
        ast_builder: &'builder mut AstBuilder,
    ) -> Self {
        Self {
            connection_constants: Default::default(),
            schema,
            variant,
            ast_builder,
        }
    }

    fn object(&mut self, object: Vec<ObjectEntry>) -> AstKey {
        self.ast_builder.intern(Ast::Object(object))
    }

    fn array(&mut self, array: Vec<Primitive>) -> AstKey {
        self.ast_builder.intern(Ast::Array(array))
    }

    fn build_operation(&mut self, operation: &OperationDefinition) -> AstKey {
        match operation.directives.named(*DIRECTIVE_SPLIT_OPERATION) {
            Some(_split_directive) => {
                let metadata = Primitive::Key(self.object(vec![]));
                let selections = self.build_selections(operation.selections.iter());
                let mut fields = vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.split_operation),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.metadata,
                        value: metadata,
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.name,
                        value: Primitive::String(operation.name.item),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.selections,
                        value: selections,
                    },
                ];
                if !operation.variable_definitions.is_empty() {
                    let argument_definitions =
                        self.build_operation_variable_definitions(&operation.variable_definitions);
                    fields.insert(
                        0,
                        ObjectEntry {
                            key: CODEGEN_CONSTANTS.argument_definitions,
                            value: argument_definitions,
                        },
                    );
                }
                self.object(fields)
            }
            None => {
                let argument_definitions =
                    self.build_operation_variable_definitions(&operation.variable_definitions);
                let selections = self.build_selections(operation.selections.iter());
                self.object(vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.argument_definitions,
                        value: argument_definitions,
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.operation_value),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.name,
                        value: Primitive::String(operation.name.item),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.selections,
                        value: selections,
                    },
                ])
            }
        }
    }

    fn build_fragment(&mut self, fragment: &FragmentDefinition, skip_metadata: bool) -> AstKey {
        if fragment.directives.named(*INLINE_DIRECTIVE_NAME).is_some() {
            return self.build_inline_data_fragment(fragment);
        }

        let object = vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.argument_definitions,
                value: self.build_fragment_variable_definitions(
                    &fragment.variable_definitions,
                    &fragment.used_global_variables,
                ),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.fragment_value),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.metadata,
                value: if skip_metadata {
                    Primitive::Null
                } else {
                    self.build_fragment_metadata(fragment)
                },
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.name,
                value: Primitive::String(fragment.name.item),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.selections,
                value: self.build_selections(fragment.selections.iter()),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.type_,
                value: Primitive::String(self.schema.get_type_name(fragment.type_condition)),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.abstract_key,
                value: if fragment.type_condition.is_abstract_type() {
                    Primitive::String(generate_abstract_type_refinement_key(
                        self.schema,
                        fragment.type_condition,
                    ))
                } else {
                    Primitive::Null
                },
            },
        ];
        self.object(object)
    }

    fn build_fragment_metadata(&mut self, fragment: &FragmentDefinition) -> Primitive {
        let connection_metadata = extract_connection_metadata_from_directive(&fragment.directives);

        let mut plural = false;
        let mut unmask = false;
        if let Some(relay_directive) = RelayDirective::find(&fragment.directives) {
            plural = relay_directive.plural;
            unmask = relay_directive.unmask;
        };

        let mut metadata = vec![];
        if let Some(connection_metadata) = &connection_metadata {
            metadata.push(self.build_connection_metadata(connection_metadata))
        }
        if unmask {
            metadata.push(ObjectEntry {
                key: CODEGEN_CONSTANTS.mask,
                value: Primitive::Bool(false),
            })
        }
        if plural {
            metadata.push(ObjectEntry {
                key: CODEGEN_CONSTANTS.plural,
                value: Primitive::Bool(true),
            })
        }
        if let Some(refetch_metadata) = RefetchableMetadata::find(&fragment.directives) {
            let refetch_connection = if let Some(connection_metadata) = connection_metadata {
                let metadata = &connection_metadata[0]; // Validated in `transform_refetchable`
                let connection_object = vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.forward,
                        value: if let Some(first) = metadata.first {
                            Primitive::Key(self.object(vec![
                                ObjectEntry {
                                    key: CODEGEN_CONSTANTS.count,
                                    value: Primitive::String(first),
                                },
                                ObjectEntry {
                                    key: CODEGEN_CONSTANTS.cursor,
                                    value: Primitive::string_or_null(metadata.after),
                                },
                            ]))
                        } else {
                            Primitive::Null
                        },
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.backward,
                        value: if let Some(last) = metadata.last {
                            Primitive::Key(self.object(vec![
                                ObjectEntry {
                                    key: CODEGEN_CONSTANTS.count,
                                    value: Primitive::String(last),
                                },
                                ObjectEntry {
                                    key: CODEGEN_CONSTANTS.cursor,
                                    value: Primitive::string_or_null(metadata.before),
                                },
                            ]))
                        } else {
                            Primitive::Null
                        },
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.path,
                        value: Primitive::Key(
                            self.array(
                                metadata
                                    .path
                                    .as_ref()
                                    .expect("Expected path to exist")
                                    .iter()
                                    .cloned()
                                    .map(Primitive::String)
                                    .collect(),
                            ),
                        ),
                    },
                ];
                Primitive::Key(self.object(connection_object))
            } else {
                Primitive::Null
            };
            let mut refetch_object = vec![
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.connection,
                    value: refetch_connection,
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.fragment_path_in_result,
                    value: Primitive::Key(
                        self.array(
                            refetch_metadata
                                .path
                                .iter()
                                .copied()
                                .map(Primitive::String)
                                .collect(),
                        ),
                    ),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.operation,
                    value: Primitive::GraphQLModuleDependency(refetch_metadata.operation_name),
                },
            ];
            if let Some(identifier_field) = refetch_metadata.identifier_field {
                refetch_object.push(ObjectEntry {
                    key: CODEGEN_CONSTANTS.identifier_field,
                    value: Primitive::String(identifier_field),
                });
            }

            metadata.push(ObjectEntry {
                key: CODEGEN_CONSTANTS.refetch,
                value: Primitive::Key(self.object(refetch_object)),
            })
        }
        if metadata.is_empty() {
            Primitive::Null
        } else {
            Primitive::Key(self.object(metadata))
        }
    }

    fn build_connection_metadata(
        &mut self,
        connection_metadata: &[ConnectionMetadata],
    ) -> ObjectEntry {
        let array = connection_metadata
            .iter()
            .map(|metadata| {
                let path = match &metadata.path {
                    None => Primitive::Null,
                    Some(path) => Primitive::Key(
                        self.array(path.iter().cloned().map(Primitive::String).collect()),
                    ),
                };
                let (count, cursor) =
                    if metadata.direction == self.connection_constants.direction_forward {
                        (metadata.first, metadata.after)
                    } else if metadata.direction == self.connection_constants.direction_backward {
                        (metadata.last, metadata.before)
                    } else {
                        (None, None)
                    };
                let mut object = vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.count,
                        value: Primitive::string_or_null(count),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.cursor,
                        value: Primitive::string_or_null(cursor),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.direction,
                        value: Primitive::String(metadata.direction),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.path,
                        value: path,
                    },
                ];
                if metadata.is_stream_connection {
                    object.push(ObjectEntry {
                        key: DEFER_STREAM_CONSTANTS.stream_name,
                        value: Primitive::Bool(true),
                    })
                }
                Primitive::Key(self.object(object))
            })
            .collect::<Vec<_>>();
        ObjectEntry {
            key: CODEGEN_CONSTANTS.connection,
            value: Primitive::Key(self.array(array)),
        }
    }

    fn build_inline_data_fragment(&mut self, fragment: &FragmentDefinition) -> AstKey {
        let object = vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.inline_data_fragment),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.name,
                value: Primitive::String(fragment.name.item),
            },
        ];
        self.object(object)
    }

    fn build_selections<'a, Selections>(&mut self, selections: Selections) -> Primitive
    where
        Selections: Iterator<Item = &'a Selection>,
    {
        let selections = selections
            .flat_map(|selection| self.build_selections_from_selection(selection))
            .collect();
        Primitive::Key(self.array(selections))
    }

    fn build_selections_from_selection(&mut self, selection: &Selection) -> Vec<Primitive> {
        match selection {
            Selection::Condition(condition) => vec![self.build_condition(condition)],
            Selection::FragmentSpread(frag_spread) => {
                vec![self.build_fragment_spread(frag_spread)]
            }
            Selection::InlineFragment(inline_fragment) => {
                let defer = inline_fragment
                    .directives
                    .named(DEFER_STREAM_CONSTANTS.defer_name);
                if let Some(defer) = defer {
                    vec![self.build_defer(inline_fragment, defer)]
                } else if let Some(inline_data_directive) =
                    InlineDirectiveMetadata::find(&inline_fragment.directives)
                {
                    // If inline fragment has @__inline directive (created by inline_data_fragment transform)
                    // we will return selection wrapped with InlineDataFragmentSpread
                    vec![
                        self.build_inline_data_fragment_spread(
                            inline_fragment,
                            inline_data_directive,
                        ),
                    ]
                } else if let Some(module_metadata) =
                    ModuleMetadata::find(&inline_fragment.directives)
                {
                    self.build_module_import_selections(module_metadata, inline_fragment)
                } else if inline_fragment
                    .directives
                    .named(*RELAY_ACTOR_CHANGE_DIRECTIVE_FOR_CODEGEN)
                    .is_some()
                {
                    vec![self.build_actor_change(inline_fragment)]
                } else {
                    vec![self.build_inline_fragment(inline_fragment)]
                }
            }
            Selection::LinkedField(field) => {
                let stream = field.directives.named(DEFER_STREAM_CONSTANTS.stream_name);

                match stream {
                    Some(stream) => vec![self.build_stream(field, stream)],
                    None => self.build_linked_field_and_handles(field),
                }
            }
            Selection::ScalarField(field) => {
                if field.directives.len() == 1
                    && field.directives[0].name.item == *TYPE_DISCRIMINATOR_DIRECTIVE_NAME
                {
                    match self.variant {
                        CodegenVariant::Reader => vec![],
                        CodegenVariant::Normalization => vec![self.build_type_discriminator(field)],
                    }
                } else {
                    self.build_scalar_field_and_handles(field)
                }
            }
        }
    }

    fn build_type_discriminator(&mut self, field: &ScalarField) -> Primitive {
        Primitive::Key(self.object(vec![
            ObjectEntry{key:CODEGEN_CONSTANTS.kind,value: Primitive::String(CODEGEN_CONSTANTS.type_discriminator)},
            ObjectEntry{key:
                CODEGEN_CONSTANTS.abstract_key,value:
                Primitive::String(field.alias.expect(
                    "Expected the type discriminator field to contain the abstract key alias.",
                ).item),
            },
        ]))
    }

    fn build_scalar_field_and_handles(&mut self, field: &ScalarField) -> Vec<Primitive> {
        match self.variant {
            CodegenVariant::Reader => vec![self.build_scalar_field(field)],
            CodegenVariant::Normalization => {
                let mut result = vec![self.build_scalar_field(field)];
                self.build_scalar_handles(&mut result, field);
                result
            }
        }
    }

    fn build_required_field(
        &mut self,
        required_metadata: &RequiredMetadataDirective,
        primitive: Primitive,
    ) -> Primitive {
        Primitive::Key(self.object(vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.required_field),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.field,
                value: primitive,
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.action,
                value: Primitive::String(required_metadata.action.into()),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.path,
                value: Primitive::String(required_metadata.path),
            },
        ]))
    }

    fn build_scalar_field(&mut self, field: &ScalarField) -> Primitive {
        let schema_field = self.schema.field(field.definition.item);
        let (name, alias) =
            self.build_field_name_and_alias(schema_field.name.item, field.alias, &field.directives);
        let args = self.build_arguments(&field.arguments);
        let kind = match field
            .directives
            .named(*REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY)
        {
            Some(_flight_directive) => Primitive::String(CODEGEN_CONSTANTS.flight_field),
            None => Primitive::String(CODEGEN_CONSTANTS.scalar_field),
        };
        let primitive = Primitive::Key(self.object(vec![
            build_alias(alias, name),
            ObjectEntry {
                key: CODEGEN_CONSTANTS.args,
                value: match args {
                    None => Primitive::Null,
                    Some(key) => Primitive::Key(key),
                },
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: kind,
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.name,
                value: Primitive::String(name),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.storage_key,
                value: match args {
                    None => Primitive::Null,
                    Some(key) => {
                        if is_static_storage_key_available(&field.arguments) {
                            Primitive::StorageKey(name, key)
                        } else {
                            Primitive::Null
                        }
                    }
                },
            },
        ]));

        if let Some(required_metadata) = RequiredMetadataDirective::find(&field.directives) {
            self.build_required_field(required_metadata, primitive)
        } else {
            primitive
        }
    }

    fn build_scalar_handles(&mut self, result: &mut Vec<Primitive>, field: &ScalarField) {
        let schema_field = self.schema.field(field.definition.item);
        let field_name = schema_field.name.item;
        let handle_field_directives = extract_handle_field_directives(&field.directives);

        for directive in handle_field_directives {
            let values = extract_values_from_handle_field_directive(directive);
            let filters = match values.filters {
                None => Primitive::Null,
                Some(strs) => {
                    Primitive::Key(self.array(strs.into_iter().map(Primitive::String).collect()))
                }
            };
            let arguments = match self.build_arguments(&field.arguments) {
                None => Primitive::Null,
                Some(key) => Primitive::Key(key),
            };
            let mut object = vec![
                build_alias(field.alias.map(|a| a.item), field_name),
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.args,
                    value: arguments,
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.filters,
                    value: filters,
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.handle,
                    value: Primitive::String(values.handle),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.key,
                    value: Primitive::String(values.key),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.kind,
                    value: Primitive::String(CODEGEN_CONSTANTS.scalar_handle),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.name,
                    value: Primitive::String(field_name),
                },
            ];
            if let Some(handle_args) = values.handle_args {
                let args = self.build_arguments(&handle_args);
                if let Some(args) = args {
                    object.push(ObjectEntry {
                        key: CODEGEN_CONSTANTS.handle_args,
                        value: Primitive::Key(args),
                    });
                }
            };
            result.push(Primitive::Key(self.object(object)));
        }
    }

    fn build_linked_field_and_handles(&mut self, field: &LinkedField) -> Vec<Primitive> {
        match self.variant {
            CodegenVariant::Reader => vec![self.build_linked_field(field)],
            CodegenVariant::Normalization => {
                let mut result = vec![self.build_linked_field(field)];
                self.build_linked_handles(&mut result, field);
                result
            }
        }
    }

    fn build_linked_field(&mut self, field: &LinkedField) -> Primitive {
        let schema_field = self.schema.field(field.definition.item);
        let (name, alias) =
            self.build_field_name_and_alias(schema_field.name.item, field.alias, &field.directives);
        let args = self.build_arguments(&field.arguments);
        let selections = self.build_selections(field.selections.iter());
        let primitive = Primitive::Key(self.object(vec![
            build_alias(alias, name),
            ObjectEntry {
                key: CODEGEN_CONSTANTS.args,
                value: match args {
                    None => Primitive::Null,
                    Some(key) => Primitive::Key(key),
                },
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.concrete_type,
                value: if schema_field.type_.inner().is_abstract_type() {
                    Primitive::Null
                } else {
                    Primitive::String(self.schema.get_type_name(schema_field.type_.inner()))
                },
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.linked_field),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.name,
                value: Primitive::String(name),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.plural,
                value: Primitive::Bool(schema_field.type_.is_list()),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.selections,
                value: selections,
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.storage_key,
                value: match args {
                    None => Primitive::Null,
                    Some(key) => {
                        if is_static_storage_key_available(&field.arguments) {
                            Primitive::StorageKey(name, key)
                        } else {
                            Primitive::Null
                        }
                    }
                },
            },
        ]));

        if let Some(required_metadata) = RequiredMetadataDirective::find(&field.directives) {
            self.build_required_field(required_metadata, primitive)
        } else {
            primitive
        }
    }

    fn build_linked_handles(&mut self, result: &mut Vec<Primitive>, field: &LinkedField) {
        let schema_field = self.schema.field(field.definition.item);
        let field_name = schema_field.name.item;
        let handle_field_directives = extract_handle_field_directives(&field.directives);
        for directive in handle_field_directives {
            let values = extract_values_from_handle_field_directive(directive);

            let dynamic_key = match &values.dynamic_key {
                Some(val) => self.build_argument(CODEGEN_CONSTANTS.dynamic_key_argument, val),
                None => None,
            };
            let filters = match values.filters {
                None => Primitive::Null,
                Some(strings) => {
                    Primitive::Key(self.array(strings.into_iter().map(Primitive::String).collect()))
                }
            };
            let mut object = vec![
                build_alias(field.alias.map(|a| a.item), field_name),
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.args,
                    value: match self.build_arguments(&field.arguments) {
                        None => Primitive::Null,
                        Some(key) => Primitive::Key(key),
                    },
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.filters,
                    value: filters,
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.handle,
                    value: Primitive::String(values.handle),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.key,
                    value: Primitive::String(values.key),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.kind,
                    value: Primitive::String(CODEGEN_CONSTANTS.linked_handle),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.name,
                    value: Primitive::String(field_name),
                },
            ];
            if let Some(dynamic_key) = dynamic_key {
                object.push(ObjectEntry {
                    key: CODEGEN_CONSTANTS.dynamic_key,
                    value: Primitive::Key(dynamic_key),
                });
            };
            if let Some(handle_args) = values.handle_args {
                let args = self.build_arguments(&handle_args);
                if let Some(args) = args {
                    object.push(ObjectEntry {
                        key: CODEGEN_CONSTANTS.handle_args,
                        value: Primitive::Key(args),
                    });
                }
            };
            result.push(Primitive::Key(self.object(object)))
        }
    }

    fn build_field_name_and_alias(
        &self,
        mut name: StringKey,
        alias: Option<WithLocation<StringKey>>,
        directives: &[Directive],
    ) -> (StringKey, Option<StringKey>) {
        let mut alias = alias.map(|alias| alias.item);
        if self.variant == CodegenVariant::Reader {
            let mut handle_field_directives = extract_handle_field_directives(directives);
            if let Some(handle_field_directive) = handle_field_directives.next() {
                if let Some(other_handle_field_directive) = handle_field_directives.next() {
                    panic!(
                        "Expected at most one handle directive, got `{:?}` and `{:?}`.",
                        handle_field_directive, other_handle_field_directive
                    );
                }
                let values = extract_values_from_handle_field_directive(handle_field_directive);
                alias = alias.or(Some(name));
                name = if values.key == CODEGEN_CONSTANTS.default_handle_key {
                    format!("__{}_{}", name, values.handle).intern()
                } else {
                    format!("__{}_{}", values.key, values.handle).intern()
                }
            }
        }
        (name, alias)
    }

    fn build_fragment_spread(&mut self, frag_spread: &FragmentSpread) -> Primitive {
        if frag_spread
            .directives
            .named(*NO_INLINE_DIRECTIVE_NAME)
            .is_some()
        {
            return self.build_normalization_fragment_spread(frag_spread);
        }
        if self.variant == CodegenVariant::Normalization
            && frag_spread
                .directives
                .named(*RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME)
                .is_some()
        {
            return self.build_relay_client_component_fragment_spread(frag_spread);
        }
        let args = self.build_arguments(&frag_spread.arguments);
        let primitive = Primitive::Key(self.object(vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.args,
                value: match args {
                    None => Primitive::Null,
                    Some(key) => Primitive::Key(key),
                },
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.fragment_spread),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.name,
                value: Primitive::String(frag_spread.fragment.item),
            },
        ]));

        if let Some(resolver_spread_metadata) =
            RelayResolverSpreadMetadata::find(&frag_spread.directives)
        {
            self.build_relay_resolver(primitive, resolver_spread_metadata)
        } else {
            primitive
        }
    }

    fn build_relay_resolver(
        &mut self,
        fragment_primitive: Primitive,
        relay_resolver_spread_metadata: &RelayResolverSpreadMetadata,
    ) -> Primitive {
        let module = relay_resolver_spread_metadata.import_path;

        let field_name = relay_resolver_spread_metadata.field_name;

        let field_alias = relay_resolver_spread_metadata.field_alias;

        // TODO(T86853359): Support non-haste environments when generating Relay Resolver RederAST
        let haste_import_name = Path::new(&module.to_string())
            .file_stem()
            .unwrap()
            .to_string_lossy()
            .intern();

        Primitive::Key(self.object(vec![
            build_alias(field_alias, field_name),
            ObjectEntry {
                key: CODEGEN_CONSTANTS.fragment,
                value: fragment_primitive,
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.relay_resolver),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.name,
                value: Primitive::String(field_name),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.resolver_module,
                value: Primitive::JSModuleDependency(haste_import_name),
            },
        ]))
    }

    fn build_normalization_fragment_spread(&mut self, frag_spread: &FragmentSpread) -> Primitive {
        let args = self.build_arguments(&frag_spread.arguments);

        Primitive::Key(self.object(vec![
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.args,
                    value: match args {
                        None => Primitive::Null,
                        Some(key) => Primitive::Key(key),
                    },
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.fragment,
                    value: Primitive::GraphQLModuleDependency(frag_spread.fragment.item),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.kind,
                    value: Primitive::String(
                        if frag_spread
                            .directives
                            .named(*RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME)
                            .is_some()
                        {
                            CODEGEN_CONSTANTS.client_component
                        } else {
                            CODEGEN_CONSTANTS.fragment_spread
                        },
                    ),
                },
            ]))
    }

    fn build_relay_client_component_fragment_spread(
        &mut self,
        frag_spread: &FragmentSpread,
    ) -> Primitive {
        let normalization_name = frag_spread
            .directives
            .named(*RELAY_CLIENT_COMPONENT_SERVER_DIRECTIVE_NAME)
            .unwrap()
            .arguments
            .named(*RELAY_CLIENT_COMPONENT_MODULE_ID_ARGUMENT_NAME)
            .unwrap()
            .value
            .item
            .expect_string_literal()
            .to_string()
            .trim_end_matches(".graphql")
            .intern();
        Primitive::Key(self.object(vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.fragment,
                value: Primitive::GraphQLModuleDependency(normalization_name),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.client_component),
            },
        ]))
    }

    fn build_defer(&mut self, inline_fragment: &InlineFragment, defer: &Directive) -> Primitive {
        match self.variant {
            CodegenVariant::Reader => self.build_defer_reader(inline_fragment),
            CodegenVariant::Normalization => self.build_defer_normalization(inline_fragment, defer),
        }
    }

    fn build_defer_reader(&mut self, inline_fragment: &InlineFragment) -> Primitive {
        let next_selections =
            if let Selection::FragmentSpread(frag_spread) = &inline_fragment.selections[0] {
                let next_selections = vec![self.build_fragment_spread(frag_spread)];
                Primitive::Key(self.array(next_selections))
            } else {
                self.build_selections(inline_fragment.selections.iter())
            };

        Primitive::Key(self.object(vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.defer),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.selections,
                value: next_selections,
            },
        ]))
    }

    fn build_defer_normalization(
        &mut self,
        inline_fragment: &InlineFragment,
        defer: &Directive,
    ) -> Primitive {
        let next_selections = self.build_selections(inline_fragment.selections.iter());
        let DeferDirective { if_arg, label_arg } = DeferDirective::from(defer);
        let if_variable_name = if_arg.and_then(|arg| match &arg.value.item {
            // `true` is the default, remove as the AST is typed just as a variable name string
            // `false` constant values should've been transformed away in skip_unreachable_node
            Value::Constant(ConstantValue::Boolean(true)) => None,
            Value::Variable(var) => Some(var.name.item),
            other => panic!("unexpected value for @defer if argument: {:?}", other),
        });
        let label_name = label_arg.unwrap().value.item.expect_string_literal();

        Primitive::Key(self.object(vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.if_,
                value: Primitive::string_or_null(if_variable_name),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.defer),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.label,
                value: Primitive::String(label_name),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.selections,
                value: next_selections,
            },
        ]))
    }

    fn build_stream(&mut self, linked_field: &LinkedField, stream: &Directive) -> Primitive {
        let next_selections = self.build_linked_field_and_handles(&LinkedField {
            directives: remove_directive(
                &linked_field.directives,
                DEFER_STREAM_CONSTANTS.stream_name,
            ),
            ..linked_field.to_owned()
        });
        let next_selections = Primitive::Key(self.array(next_selections));
        Primitive::Key(match self.variant {
            CodegenVariant::Reader => self.object(vec![
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.kind,
                    value: Primitive::String(CODEGEN_CONSTANTS.stream),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.selections,
                    value: next_selections,
                },
            ]),
            CodegenVariant::Normalization => {
                let StreamDirective {
                    if_arg,
                    label_arg,
                    use_customized_batch_arg: _,
                    initial_count_arg: _,
                } = StreamDirective::from(stream);
                let if_variable_name = if_arg.and_then(|arg| match &arg.value.item {
                    // `true` is the default, remove as the AST is typed just as a variable name string
                    // `false` constant values should've been transformed away in skip_unreachable_node
                    Value::Constant(ConstantValue::Boolean(true)) => None,
                    Value::Variable(var) => Some(var.name.item),
                    other => panic!("unexpected value for @stream if argument: {:?}", other),
                });
                let label_name = label_arg.unwrap().value.item.expect_string_literal();

                self.object(vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.if_,
                        value: Primitive::string_or_null(if_variable_name),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.stream),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.label,
                        value: Primitive::String(label_name),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.selections,
                        value: next_selections,
                    },
                ])
            }
        })
    }

    fn build_client_edge(&mut self, client_edge_metadata: ClientEdgeMetadata<'_>) -> Primitive {
        let backing_field = match client_edge_metadata.backing_field {
            Selection::FragmentSpread(fragment_spread) => {
                self.build_fragment_spread(fragment_spread)
            }
            _ => panic!(
                "Expected Client Edge backing field to be an inline fragment representing a Relay Resolver. {:?}",
                client_edge_metadata.backing_field
            ),
        };

        let selections_item = match client_edge_metadata.selections {
            Selection::LinkedField(linked_field) => self.build_linked_field(linked_field),
            _ => panic!("Expected Client Edge selections to be a LinkedField"),
        };

        Primitive::Key(self.object(vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.client_edge),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.operation,
                value: Primitive::GraphQLModuleDependency(client_edge_metadata.query_name),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.client_edge_backing_field_key,
                value: backing_field,
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.client_edge_selections_key,
                value: selections_item,
            },
        ]))
    }

    fn build_inline_fragment(&mut self, inline_frag: &InlineFragment) -> Primitive {
        match inline_frag.type_condition {
            None => {
                if let Some(client_edge_metadata) = ClientEdgeMetadata::find(inline_frag) {
                    self.build_client_edge(client_edge_metadata)
                } else if
                // TODO(T63388023): Use typed custom directives
                inline_frag.directives.len() == 1
                    && inline_frag.directives[0].name.item == *CLIENT_EXTENSION_DIRECTIVE_NAME
                {
                    let selections = self.build_selections(inline_frag.selections.iter());
                    Primitive::Key(self.object(vec![
                        ObjectEntry {
                            key: CODEGEN_CONSTANTS.kind,
                            value: Primitive::String(CODEGEN_CONSTANTS.client_extension),
                        },
                        ObjectEntry {
                            key: CODEGEN_CONSTANTS.selections,
                            value: selections,
                        },
                    ]))
                } else {
                    // TODO(T63559346): Handle anonymous inline fragments with no directives
                    panic!(
                        "Unexpected custom directives: {:#?}",
                        inline_frag.directives
                    );
                }
            }
            Some(type_condition) => {
                if self.variant == CodegenVariant::Normalization {
                    let is_abstract_inline_fragment = type_condition.is_abstract_type();
                    if is_abstract_inline_fragment {
                        // Maintain a few invariants:
                        // - InlineFragment (and `selections` arrays generally) cannot be empty
                        // - Don't emit a TypeDiscriminator under an InlineFragment unless it has
                        //   a different abstractKey
                        // This means we have to handle two cases:
                        // - The inline fragment only contains a TypeDiscriminator with the same
                        //   abstractKey: replace the Fragment w the Discriminator
                        // - The inline fragment contains other selections: return all the selections
                        //   minus any Discriminators w the same key
                        let has_type_discriminator = inline_frag
                            .selections
                            .iter()
                            .any(is_type_discriminator_selection);

                        if has_type_discriminator {
                            if inline_frag.selections.len() == 1 {
                                return self.build_type_discriminator(
                                    if let Selection::ScalarField(field) =
                                        &inline_frag.selections[0]
                                    {
                                        field
                                    } else {
                                        panic!("Expected a scalar field.")
                                    },
                                );
                            } else {
                                let selections =
                                    self.build_selections(inline_frag.selections.iter().filter(
                                        |selection| !is_type_discriminator_selection(selection),
                                    ));
                                return Primitive::Key(self.object(vec![
                                    ObjectEntry {
                                        key: CODEGEN_CONSTANTS.kind,
                                        value: Primitive::String(CODEGEN_CONSTANTS.inline_fragment),
                                    },
                                    ObjectEntry {
                                        key: CODEGEN_CONSTANTS.selections,
                                        value: selections,
                                    },
                                    ObjectEntry {
                                        key: CODEGEN_CONSTANTS.type_,
                                        value: Primitive::String(
                                            self.schema.get_type_name(type_condition),
                                        ),
                                    },
                                    ObjectEntry {
                                        key: CODEGEN_CONSTANTS.abstract_key,
                                        value: Primitive::String(
                                            generate_abstract_type_refinement_key(
                                                self.schema,
                                                type_condition,
                                            ),
                                        ),
                                    },
                                ]));
                            }
                        }
                    }
                }
                let selections = self.build_selections(inline_frag.selections.iter());
                Primitive::Key(self.object(vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.inline_fragment),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.selections,
                        value: selections,
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.type_,
                        value: Primitive::String(self.schema.get_type_name(type_condition)),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.abstract_key,
                        value: if type_condition.is_abstract_type() {
                            Primitive::String(generate_abstract_type_refinement_key(
                                self.schema,
                                type_condition,
                            ))
                        } else {
                            Primitive::Null
                        },
                    },
                ]))
            }
        }
    }

    fn build_condition(&mut self, condition: &Condition) -> Primitive {
        let selections = self.build_selections(condition.selections.iter());
        Primitive::Key(self.object(vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.condition,
                value: Primitive::String(match &condition.value {
                    ConditionValue::Variable(variable) => variable.name.item,
                    ConditionValue::Constant(_) => panic!(
                        "Expected Condition with static value to have been pruned or inlined."
                    ),
                }),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.condition_value),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.passing_value,
                value: Primitive::Bool(condition.passing_value),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.selections,
                value: selections,
            },
        ]))
    }

    fn build_operation_variable_definitions(
        &mut self,
        variable_definitions: &[VariableDefinition],
    ) -> Primitive {
        let var_defs = variable_definitions
            .iter()
            .map(|def| {
                let default_value = if let Some(const_val) = &def.default_value {
                    self.build_constant_value(&const_val.item)
                } else {
                    Primitive::Null
                };
                Primitive::Key(self.object(vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.default_value,
                        value: default_value,
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.local_argument),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.name,
                        value: Primitive::String(def.name.item),
                    },
                ]))
            })
            .collect::<Vec<_>>();

        Primitive::Key(self.array(var_defs))
    }

    fn build_fragment_variable_definitions(
        &mut self,
        local_variable_definitions: &[VariableDefinition],
        global_variable_definitions: &[VariableDefinition],
    ) -> Primitive {
        // TODO(T63164787) this will produce argument_definitions in a different order than our JS codegen
        let mut var_defs = Vec::with_capacity(
            local_variable_definitions.len() + global_variable_definitions.len(),
        );
        for def in local_variable_definitions {
            let object = vec![
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.default_value,
                    value: if let Some(const_val) = &def.default_value {
                        self.build_constant_value(&const_val.item)
                    } else {
                        Primitive::Null
                    },
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.kind,
                    value: Primitive::String(CODEGEN_CONSTANTS.local_argument),
                },
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.name,
                    value: Primitive::String(def.name.item),
                },
            ];
            var_defs.push((def.name.item, Primitive::Key(self.object(object))));
        }
        for def in global_variable_definitions {
            var_defs.push((
                def.name.item,
                Primitive::Key(self.object(vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.root_argument),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.name,
                        value: Primitive::String(def.name.item),
                    },
                ])),
            ));
        }

        var_defs.sort_unstable_by(|(name_a, _), (name_b, _)| name_a.cmp(name_b));
        let mut sorted_var_defs = Vec::with_capacity(var_defs.len());

        for (_, var_def) in var_defs {
            sorted_var_defs.push(var_def);
        }

        Primitive::Key(self.array(sorted_var_defs))
    }

    fn build_arguments(&mut self, arguments: &[Argument]) -> Option<AstKey> {
        let mut sorted_args: Vec<&Argument> = arguments.iter().collect();
        sorted_args.sort_unstable_by_key(|arg| arg.name.item);

        let args = sorted_args
            .into_iter()
            // We are filtering out "null" arguments matching JS behavior
            .filter_map(|arg| self.build_argument(arg.name.item, &arg.value.item))
            .map(Primitive::Key)
            .collect::<Vec<_>>();
        if args.is_empty() {
            None
        } else {
            Some(self.array(args))
        }
    }

    fn build_argument(&mut self, arg_name: StringKey, arg_value: &Value) -> Option<AstKey> {
        match arg_value {
            Value::Constant(const_val) => self.build_constant_argument(arg_name, const_val),
            Value::Variable(variable) => {
                let name = Primitive::String(arg_name);
                let variable_name = Primitive::String(variable.name.item);
                Some(self.object(vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.variable),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.name,
                        value: name,
                    },
                    // TODO(T63303966) type is always skipped in JS compiler
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.variable_name,
                        value: variable_name,
                    },
                ]))
            }
            Value::List(list) => {
                let items = list
                    .iter()
                    .enumerate()
                    .map(|(i, val)| {
                        let item_name = format!("{}.{}", arg_name, i).as_str().intern();
                        match self.build_argument(item_name, val) {
                            None => Primitive::Null,
                            Some(key) => Primitive::Key(key),
                        }
                    })
                    .collect::<Vec<_>>();
                let object = vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.items,
                        value: Primitive::Key(self.array(items)),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.list_value),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.name,
                        value: Primitive::String(arg_name),
                    },
                ];
                Some(self.object(object))
            }
            Value::Object(object) => {
                let mut sorted_object = object.clone();
                sorted_object.sort_by_key(|arg| arg.name);
                let fields = sorted_object
                    .into_iter()
                    .map(|arg| {
                        let field_name = arg.name.item;
                        if let Some(concrete_arg) = self.build_argument(field_name, &arg.value.item)
                        {
                            Primitive::Key(concrete_arg)
                        } else {
                            // For object types, we do want to keep the literal argument
                            // for null, instead of filtering it out, matching JS behavior
                            Primitive::Key(self.object(vec![
                                ObjectEntry {
                                    key: CODEGEN_CONSTANTS.kind,
                                    value: Primitive::String(CODEGEN_CONSTANTS.literal),
                                },
                                ObjectEntry {
                                    key: CODEGEN_CONSTANTS.name,
                                    value: Primitive::String(field_name),
                                },
                                ObjectEntry {
                                    key: CODEGEN_CONSTANTS.value,
                                    value: Primitive::Null,
                                },
                            ]))
                        }
                    })
                    .collect::<Vec<_>>();
                let object = vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.fields,
                        value: Primitive::Key(self.array(fields)),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.object_value),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.name,
                        value: Primitive::String(arg_name),
                    },
                ];
                Some(self.object(object))
            }
        }
    }

    fn build_constant_argument(
        &mut self,
        arg_name: StringKey,
        arg_value: &ConstantValue,
    ) -> Option<AstKey> {
        match arg_value {
            // We return None here to filter out "null" arguments, matching JS behavior
            ConstantValue::Null() => None,
            _ => {
                let value = self.build_constant_value(arg_value);
                Some(self.object(vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.literal),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.name,
                        value: Primitive::String(arg_name),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.value,
                        value,
                    },
                ]))
            }
        }
    }

    fn build_constant_value(&mut self, value: &ConstantValue) -> Primitive {
        match value {
            ConstantValue::Int(val) => Primitive::Int(*val),
            ConstantValue::Float(val) => Primitive::Float(*val),
            ConstantValue::String(val) => Primitive::String(*val),
            ConstantValue::Boolean(val) => Primitive::Bool(*val),
            ConstantValue::Null() => Primitive::Null,
            ConstantValue::Enum(val) => Primitive::String(*val),
            ConstantValue::List(val_list) => {
                let json_values = val_list
                    .iter()
                    .map(|val| self.build_constant_value(val))
                    .collect::<Vec<_>>();
                Primitive::Key(self.array(json_values))
            }
            ConstantValue::Object(val_object) => {
                let mut sorted_val_object: Vec<&_> = val_object.iter().collect();
                sorted_val_object.sort_unstable_by_key(|arg| arg.name.item);

                let json_values = sorted_val_object
                    .into_iter()
                    .map(|arg| ObjectEntry {
                        key: arg.name.item,
                        value: self.build_constant_value(&arg.value.item),
                    })
                    .collect::<Vec<_>>();
                Primitive::Key(self.object(json_values))
            }
        }
    }

    fn build_module_import_selections(
        &mut self,
        module_metadata: &ModuleMetadata,
        inline_fragment: &InlineFragment,
    ) -> Vec<Primitive> {
        let fragment_name = module_metadata.fragment_name;
        let fragment_name_str = fragment_name.lookup();
        let underscore_idx = fragment_name_str.find('_').unwrap_or_else(|| {
            panic!(
                "@module fragments should be named 'FragmentName_propName', got '{}'.",
                fragment_name
            )
        });

        let frag_spread = inline_fragment.selections.iter().find_map(|sel| match sel {
            Selection::FragmentSpread(frag_spread) => Some(frag_spread),
            _ => None,
        });
        let args = if let Some(frag_spread) = frag_spread {
            self.build_arguments(&frag_spread.arguments)
        } else {
            None
        };
        let selection = Primitive::Key(self.object(vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.args,
                value: match args {
                    None => Primitive::Null,
                    Some(key) => Primitive::Key(key),
                },
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.document_name,
                value: Primitive::String(module_metadata.key),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.fragment_name,
                value: Primitive::String(fragment_name),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.fragment_prop_name,
                value: Primitive::String(fragment_name_str[underscore_idx + 1..].intern()),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.module_import),
            },
        ]));
        vec![selection]
    }

    /// This method will wrap inline fragment with @__inline directive
    // (created by `inline_fragment_data` transform)
    /// with the node `InlineDataFragmentSpread`
    fn build_inline_data_fragment_spread(
        &mut self,
        inline_fragment: &InlineFragment,
        inline_directive_data: &InlineDirectiveMetadata,
    ) -> Primitive {
        let selections = self.build_selections(inline_fragment.selections.iter());
        Primitive::Key(self.object(vec![
            ObjectEntry {
                key: CODEGEN_CONSTANTS.kind,
                value: Primitive::String(CODEGEN_CONSTANTS.inline_data_fragment_spread),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.name,
                value: Primitive::String(inline_directive_data.fragment_name),
            },
            ObjectEntry {
                key: CODEGEN_CONSTANTS.selections,
                value: selections,
            },
        ]))
    }

    fn build_request_parameters(
        &mut self,
        operation: &OperationDefinition,
        mut request_parameters: RequestParameters<'_>,
    ) -> AstKey {
        let mut metadata_items: Vec<ObjectEntry> = operation
            .directives
            .iter()
            .filter_map(|directive| {
                if directive.name.item == *INTERNAL_METADATA_DIRECTIVE {
                    if directive.arguments.len() != 1 {
                        panic!("@__metadata directive should have only one argument!");
                    }

                    let arg = &directive.arguments[0];
                    let key = arg.name.item;
                    let value = match &arg.value.item {
                        Value::Constant(value) => self.build_constant_value(value),
                        _ => {
                            panic!("@__metadata directive expect only constant argument values.");
                        }
                    };

                    Some(ObjectEntry { key, value })
                } else {
                    None
                }
            })
            .collect();

        // add connection metadata
        let connection_metadata = extract_connection_metadata_from_directive(&operation.directives);
        if let Some(connection_metadata) = connection_metadata {
            metadata_items.push(self.build_connection_metadata(connection_metadata))
        }

        // add request parameters metadata
        let metadata_values: Vec<(String, String)> = request_parameters.metadata.drain().collect();
        for (key, value) in metadata_values {
            metadata_items.push(ObjectEntry {
                key: key.intern(),
                value: Primitive::RawString(value),
            });
        }

        // sort metadata keys
        metadata_items.sort_unstable_by_key(|entry| entry.key);

        // Construct metadata object
        let metadata_prop = ObjectEntry {
            key: CODEGEN_CONSTANTS.metadata,
            value: Primitive::Key(self.object(metadata_items)),
        };
        let name_prop = ObjectEntry {
            key: CODEGEN_CONSTANTS.name,
            value: Primitive::String(request_parameters.name),
        };
        let operation_kind_prop = ObjectEntry {
            key: CODEGEN_CONSTANTS.operation_kind,
            value: Primitive::String(match request_parameters.operation_kind {
                OperationKind::Query => CODEGEN_CONSTANTS.query,
                OperationKind::Mutation => CODEGEN_CONSTANTS.mutation,
                OperationKind::Subscription => CODEGEN_CONSTANTS.subscription,
            }),
        };

        let id_prop = ObjectEntry {
            key: CODEGEN_CONSTANTS.id,
            value: match request_parameters.id {
                Some(QueryID::Persisted { id, .. }) => Primitive::RawString(id.clone()),
                Some(QueryID::External(name)) => Primitive::JSModuleDependency(*name),
                None => Primitive::Null,
            },
        };

        let params_object = if let Some(text) = request_parameters.text {
            vec![
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.cache_id,
                    value: Primitive::RawString(md5(&text)),
                },
                id_prop,
                metadata_prop,
                name_prop,
                operation_kind_prop,
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.text,
                    value: Primitive::RawString(text),
                },
            ]
        } else {
            vec![
                id_prop,
                metadata_prop,
                name_prop,
                operation_kind_prop,
                ObjectEntry {
                    key: CODEGEN_CONSTANTS.text,
                    value: Primitive::Null,
                },
            ]
        };

        self.object(params_object)
    }

    fn build_actor_change(&mut self, actor_change: &InlineFragment) -> Primitive {
        let linked_field = match &actor_change.selections[0] {
            Selection::LinkedField(linked_field) => linked_field.clone(),
            _ => panic!("Expect to have a single linked field in the actor change fragment"),
        };

        match self.variant {
            CodegenVariant::Normalization => {
                let linked_field_value = self.build_linked_field(&linked_field);

                Primitive::Key(self.object(vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.actor_change),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.linked_field_property,
                        value: linked_field_value,
                    },
                ]))
            }
            CodegenVariant::Reader => {
                let schema_field = self.schema.field(linked_field.definition.item);
                let (name, alias) = self.build_field_name_and_alias(
                    schema_field.name.item,
                    linked_field.alias,
                    &linked_field.directives,
                );
                let args = self.build_arguments(&linked_field.arguments);
                let fragment_spread = linked_field
                    .selections
                    .iter()
                    .find(|item| matches!(item, Selection::FragmentSpread(_)))
                    .unwrap();
                let fragment_spread_key =
                    self.build_selections_from_selection(fragment_spread)[0].assert_key();

                Primitive::Key(self.object(vec![
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.kind,
                        value: Primitive::String(CODEGEN_CONSTANTS.actor_change),
                    },
                    build_alias(alias, name),
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.name,
                        value: Primitive::String(name),
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.storage_key,
                        value: match args {
                            None => Primitive::Null,
                            Some(key) => {
                                if is_static_storage_key_available(&linked_field.arguments) {
                                    Primitive::StorageKey(name, key)
                                } else {
                                    Primitive::Null
                                }
                            }
                        },
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.args,
                        value: match args {
                            None => Primitive::Null,
                            Some(key) => Primitive::Key(key),
                        },
                    },
                    ObjectEntry {
                        key: CODEGEN_CONSTANTS.fragment_spread_property,
                        value: Primitive::Key(fragment_spread_key),
                    },
                ]))
            }
        }
    }
}

fn is_type_discriminator_selection(selection: &Selection) -> bool {
    if let Selection::ScalarField(selection) = selection {
        selection
            .directives
            .named(*TYPE_DISCRIMINATOR_DIRECTIVE_NAME)
            .is_some()
    } else {
        false
    }
}

// Storage key is only pre-computable if the arguments don't contain variables
fn is_static_storage_key_available(arguments: &[Argument]) -> bool {
    !arguments
        .iter()
        .any(|arg| value_contains_variable(&arg.value.item))
}

fn value_contains_variable(value: &Value) -> bool {
    match value {
        Value::Variable(_) => true,
        Value::Constant(_) => false,
        Value::List(values) => values.iter().any(value_contains_variable),
        Value::Object(objects) => objects
            .iter()
            .any(|arg| value_contains_variable(&arg.value.item)),
    }
}

fn build_alias(alias: Option<StringKey>, name: StringKey) -> ObjectEntry {
    let alias = match alias {
        None => Primitive::Null,
        Some(alias) => {
            if alias == name {
                Primitive::Null
            } else {
                Primitive::String(alias)
            }
        }
    };
    ObjectEntry {
        key: CODEGEN_CONSTANTS.alias,
        value: alias,
    }
}

/// Computes the md5 hash of a string.
pub fn md5(data: &str) -> String {
    let mut md5 = Md5::new();
    md5.input(data);
    hex::encode(md5.result())
}
