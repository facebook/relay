/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::NamedItem;
use common::ObjectName;
use common::WithLocation;
use docblock_shared::HAS_OUTPUT_TYPE_ARGUMENT_NAME;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use graphql_ir::associated_data_impl;
use graphql_ir::Argument;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::ExecutableDefinitionName;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Value;
use graphql_syntax::OperationKind;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::string_key::StringKeyMap;
use intern::Lookup;
use lazy_static::lazy_static;
use relay_config::SchemaConfig;
use schema::DirectiveValue;
use schema::Schema;
use schema::Type;

use super::ValidationMessageWithData;
use crate::refetchable_fragment::RefetchableFragment;
use crate::refetchable_fragment::REFETCHABLE_NAME;
use crate::relay_resolvers::get_bool_argument_is_true;
use crate::RequiredMetadataDirective;
use crate::ValidationMessage;
use crate::REQUIRED_DIRECTIVE_NAME;

lazy_static! {
    // This gets attached to the generated query
    pub static ref QUERY_NAME_ARG: ArgumentName = ArgumentName("queryName".intern());
    pub static ref TYPE_NAME_ARG: StringKey = "typeName".intern();
    pub static ref CLIENT_EDGE_SOURCE_NAME: ArgumentName = ArgumentName("clientEdgeSourceDocument".intern());
    pub static ref CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME: DirectiveName = DirectiveName("waterfall".intern());
}

/// Directive added to inline fragments created by the transform. The inline
/// fragment groups together the client edge's backing field as well as a linked
/// field containing the selections being read off of the link.
///
/// Each instance of the directive within a traversal is assigned a unique id.
/// This is added to prevent future transforms from merging multiple of these inline
/// fragments.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum ClientEdgeMetadataDirective {
    ServerObject {
        query_name: OperationDefinitionName,
        unique_id: u32,
    },
    ClientObject {
        type_name: Option<ObjectName>,
        unique_id: u32,
    },
}
associated_data_impl!(ClientEdgeMetadataDirective);

/// Metadata directive attached to generated queries
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ClientEdgeGeneratedQueryMetadataDirective {
    pub source_name: WithLocation<ExecutableDefinitionName>,
}
associated_data_impl!(ClientEdgeGeneratedQueryMetadataDirective);

pub struct ClientEdgeMetadata<'a> {
    /// The field which defines the graph relationship (currently always a Resolver)
    pub backing_field: Selection,
    /// Models the client edge field and its selections
    pub linked_field: &'a LinkedField,
    /// Additional metadata about the client edge
    pub metadata_directive: ClientEdgeMetadataDirective,
}

// Client edges consists of two parts:
//
// 1. A backing field which contains the ID defining the graph relationship
// 2. A linked field containing the selections that the user has asked for off
// of that relationship.
//
// In order to ensure both of these elements are present in our IR, and also get
// traversed by subsequent transform steps, we model Client Edges in our IR as
// an inline fragment containing these two children in an implicit order.
//
// This utility method is intended to reduce the number of places that need to
// know about this implicit contract by reading an inline fragment and returning
// structured metadata, if present.
impl<'a> ClientEdgeMetadata<'a> {
    pub fn find(fragment: &'a InlineFragment) -> Option<Self> {
        ClientEdgeMetadataDirective::find(&fragment.directives).map(|metadata_directive| {

            // Double check that some flatten/inline transform is not trying to combine/merge our inline directives together.
            assert!(
                fragment.selections.len() == 2,
                "Expected Client Edge inline fragment to have exactly two selections. This is a bug in the Relay compiler."
            );
            let mut backing_field = fragment
                .selections
                .get(0)
                .expect("Client Edge inline fragments have exactly two selections").clone();

            let backing_field_directives = backing_field.directives().iter().filter(|directive|
                directive.name.item != RequiredMetadataDirective::directive_name()
            ).cloned().collect();
            backing_field.set_directives(backing_field_directives);

            let linked_field = match fragment.selections.get(1) {
                Some(Selection::LinkedField(linked_field)) => linked_field,
                _ => panic!("Client Edge inline fragments have exactly two selections, with the second selection being a linked field.")
            };

            ClientEdgeMetadata {
                metadata_directive: metadata_directive.clone(),
                backing_field,
                linked_field,
            }
        })
    }
}
pub fn client_edges(program: &Program, schema_config: &SchemaConfig) -> DiagnosticsResult<Program> {
    let mut transform = ClientEdgesTransform::new(program, schema_config);
    let mut next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        for fragment in transform.new_fragments {
            next_program.insert_fragment(fragment);
        }
        for operation in transform.new_operations {
            next_program.insert_operation(Arc::new(operation));
        }
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct ClientEdgesTransform<'program, 'sc> {
    path: Vec<&'program str>,
    document_name: Option<WithLocation<ExecutableDefinitionName>>,
    query_names: StringKeyMap<usize>,
    program: &'program Program,
    new_fragments: Vec<Arc<FragmentDefinition>>,
    new_operations: Vec<OperationDefinition>,
    errors: Vec<Diagnostic>,
    schema_config: &'sc SchemaConfig,
    next_key: u32,
}

impl<'program, 'sc> ClientEdgesTransform<'program, 'sc> {
    fn new(program: &'program Program, schema_config: &'sc SchemaConfig) -> Self {
        Self {
            program,
            schema_config,
            path: Default::default(),
            query_names: Default::default(),
            document_name: Default::default(),
            new_fragments: Default::default(),
            new_operations: Default::default(),
            errors: Default::default(),
            next_key: 0,
        }
    }

    fn generate_query_name(&mut self) -> OperationDefinitionName {
        let document_name = self.document_name.expect("We are within a document");
        let name_root = format!(
            "ClientEdgeQuery_{}_{}",
            document_name.item,
            self.path.join("__")
        )
        .intern();

        // Due to duplicate inline fragments, or inline fragments without type
        // conditions, it's possible that multiple fields will have the same
        // path. In this case, we will append incrementing numbers to the end of
        // the query name to ensure uniqueness.
        let num = self
            .query_names
            .entry(name_root)
            .and_modify(|n| *n += 1)
            .or_insert(0);

        match num {
            0 => OperationDefinitionName(name_root),
            n => OperationDefinitionName(format!("{}_{}", name_root, n).intern()),
        }
    }

    fn generate_client_edge_query(
        &mut self,
        generated_query_name: OperationDefinitionName,
        field_type: Type,
        selections: Vec<Selection>,
    ) {
        let document_name = self.document_name.expect("Expect to be within a document");
        let synthetic_fragment_name = WithLocation::new(
            // The artifact for the refetchable fragment and query derived from
            // this fragment will be placed on disk based on this source
            // location. Currently non-Haste environments assume that this
            // fragment and the query derived from it will use the same location
            // source, and thus will be placed in the same `__generated__`
            // directory. Based on this assumption they import the file using `./`.
            document_name.location,
            FragmentDefinitionName(format!("Refetchable{}", generated_query_name).intern()),
        );

        let synthetic_refetchable_fragment = FragmentDefinition {
            name: synthetic_fragment_name,
            variable_definitions: Vec::new(),
            used_global_variables: Vec::new(),
            type_condition: field_type,
            directives: vec![
                // Used to influence where we place this generated file, and
                // the document from which we derive the source hash for the
                // Client Edge generated query's artifact.
                ClientEdgeGeneratedQueryMetadataDirective {
                    source_name: document_name,
                }
                .into(),
            ],
            selections,
        };

        let mut transformer = RefetchableFragment::new(self.program, self.schema_config, false);

        let refetchable_fragment = transformer
            .transform_refetch_fragment_with_refetchable_directive(
                &Arc::new(synthetic_refetchable_fragment),
                &make_refetchable_directive(generated_query_name),
            );

        match refetchable_fragment {
            Err(diagnostics) => {
                self.errors.extend(diagnostics);
            }
            Ok((refetchable_directive, refetchable_root)) => {
                self.new_fragments.push(refetchable_root.fragment);

                let query_type = self.program.schema.query_type().unwrap();

                let mut directives = refetchable_directive.directives;
                directives.push(
                    // Used to influence where we place this generated file, and
                    // the document from which we derive the source hash for the
                    // Client Edge generated query's artifact.
                    ClientEdgeGeneratedQueryMetadataDirective {
                        source_name: document_name,
                    }
                    .into(),
                );
                self.new_operations.push(OperationDefinition {
                    kind: OperationKind::Query,
                    name: WithLocation::new(
                        document_name.location,
                        refetchable_directive.query_name.item,
                    ),
                    type_: query_type,
                    variable_definitions: refetchable_root.variable_definitions,
                    directives,
                    selections: refetchable_root.selections,
                });
            }
        };
    }

    fn transform_linked_field_impl(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let schema = &self.program.schema;
        let field_type = schema.field(field.definition.item);

        // Eventually we will want to enable client edges on non-resolver client
        // schema extensions, but we'll start with limiting them to resolvers.
        let resolver_directive = field_type.directives.named(*RELAY_RESOLVER_DIRECTIVE_NAME);

        let is_client_edge = field_type.is_extension && resolver_directive.is_some();

        let waterfall_directive = field
            .directives()
            .named(*CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME);

        if !is_client_edge {
            // Non-Client-Edge fields do not incur a waterfall, and thus should
            // not be annotated with @waterfall.
            if let Some(directive) = waterfall_directive {
                self.errors.push(Diagnostic::error_with_data(
                    ValidationMessageWithData::RelayResolversUnexpectedWaterfall,
                    directive.name.location,
                ));
            }
            return self.default_transform_linked_field(field);
        }

        let allowed_directive_names = [
            *CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME,
            *REQUIRED_DIRECTIVE_NAME,
            RequiredMetadataDirective::directive_name(),
        ];

        let other_directives = field
            .directives
            .iter()
            .filter(|directive| {
                !allowed_directive_names
                    .iter()
                    .any(|item| directive.name.item == *item)
            })
            .collect::<Vec<_>>();

        for directive in other_directives {
            self.errors.push(Diagnostic::error(
                ValidationMessage::ClientEdgeUnsupportedDirective {
                    directive_name: directive.name.item,
                },
                directive.name.location,
            ));
        }

        let edge_to_type = field_type.type_.inner();

        let is_edge_to_client_object = schema.is_extension_type(edge_to_type);

        let new_selections = self
            .transform_selections(&field.selections)
            .replace_or_else(|| field.selections.clone());

        let metadata_directive = if is_edge_to_client_object {
            // We assume edges to client objects will be resolved on the client
            // and thus not incur a waterfall. This will change in the future
            // for @live Resolvers that can trigger suspense.
            if let Some(directive) = waterfall_directive {
                self.errors.push(Diagnostic::error_with_data(
                    ValidationMessageWithData::RelayResolversUnexpectedWaterfall,
                    directive.name.location,
                ));
            }

            match edge_to_type {
                Type::Interface(_) => {
                    if !has_output_type(resolver_directive) {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::ClientEdgeToClientInterface,
                            field.alias_or_name_location(),
                        ));
                    }
                    ClientEdgeMetadataDirective::ClientObject {
                        type_name: None,
                        unique_id: self.get_key(),
                    }
                }
                Type::Union(_) => {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::ClientEdgeToClientUnion,
                        field.alias_or_name_location(),
                    ));
                    return Transformed::Keep;
                }
                Type::Object(object_id) => ClientEdgeMetadataDirective::ClientObject {
                    type_name: Some(schema.object(object_id).name.item),
                    unique_id: self.get_key(),
                },
                _ => {
                    panic!(
                        "Expected a linked field to reference either an Object, Interface, or Union"
                    )
                }
            }
        } else {
            // Client Edges to server objects must be annotated with @waterfall
            if waterfall_directive.is_none() {
                self.errors.push(Diagnostic::error_with_data(
                    ValidationMessageWithData::RelayResolversMissingWaterfall {
                        field_name: field_type.name.item,
                    },
                    field.definition.location,
                ));
            }
            let client_edge_query_name = self.generate_query_name();

            self.generate_client_edge_query(
                client_edge_query_name,
                field_type.type_.inner(),
                new_selections.clone(),
            );
            ClientEdgeMetadataDirective::ServerObject {
                query_name: client_edge_query_name,
                unique_id: self.get_key(),
            }
        };
        let mut inline_fragment_directives: Vec<Directive> = vec![metadata_directive.into()];
        if let Some(required_directive_metadata) = field
            .directives
            .named(RequiredMetadataDirective::directive_name())
            .cloned()
        {
            inline_fragment_directives.push(required_directive_metadata);
        }

        let transformed_field = Arc::new(LinkedField {
            selections: new_selections,
            ..field.clone()
        });

        let inline_fragment = InlineFragment {
            type_condition: None,
            directives: inline_fragment_directives,
            selections: vec![
                Selection::LinkedField(transformed_field.clone()),
                Selection::LinkedField(transformed_field),
            ],
            spread_location: Location::generated(),
        };

        Transformed::Replace(Selection::InlineFragment(Arc::new(inline_fragment)))
    }

    fn get_key(&mut self) -> u32 {
        let key = self.next_key;
        self.next_key += 1;
        key
    }
}

impl Transformer for ClientEdgesTransform<'_, '_> {
    const NAME: &'static str = "ClientEdgesTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.document_name = Some(fragment.name.map(|name| name.into()));
        let new_fragment = self.default_transform_fragment(fragment);
        self.document_name = None;
        new_fragment
    }

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.document_name = Some(operation.name.map(|name| name.into()));
        let new_operation = self.default_transform_operation(operation);
        self.document_name = None;
        new_operation
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        match fragment
            .type_condition
            .map(|type_| self.program.schema.get_type_name(type_))
        {
            Some(type_name) => {
                self.path.push(type_name.lookup());

                let new_inline_fragment = self.default_transform_inline_fragment(fragment);
                self.path.pop();

                new_inline_fragment
            }
            None => self.default_transform_inline_fragment(fragment),
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        self.path
            .push(field.alias_or_name(&self.program.schema).lookup());

        let new_linked_field = self.transform_linked_field_impl(field);

        self.path.pop();

        new_linked_field
    }

    fn transform_scalar_field(
        &mut self,
        field: &graphql_ir::ScalarField,
    ) -> Transformed<Selection> {
        if let Some(directive) = field
            .directives()
            .named(*CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME)
        {
            self.errors.push(Diagnostic::error_with_data(
                ValidationMessageWithData::RelayResolversUnexpectedWaterfall,
                directive.name.location,
            ));
        }
        self.default_transform_scalar_field(field)
    }
}

fn make_refetchable_directive(query_name: OperationDefinitionName) -> Directive {
    Directive {
        name: WithLocation::generated(*REFETCHABLE_NAME),
        arguments: vec![Argument {
            name: WithLocation::generated(*QUERY_NAME_ARG),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(query_name.0))),
        }],
        data: None,
    }
}

pub fn remove_client_edge_selections(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = ClientEdgesCleanupTransform::default();
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    Ok(next_program)
}

#[derive(Default)]
struct ClientEdgesCleanupTransform;

impl Transformer for ClientEdgesCleanupTransform {
    const NAME: &'static str = "ClientEdgesCleanupTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        match ClientEdgeMetadata::find(fragment) {
            Some(metadata) => {
                let new_selection = metadata.backing_field;

                Transformed::Replace(
                    self.transform_selection(&new_selection)
                        .unwrap_or_else(|| new_selection.clone()),
                )
            }
            None => self.default_transform_inline_fragment(fragment),
        }
    }
}

// We should restructure the calling code so that this function does not
// accept an option.
fn has_output_type(directive: Option<&DirectiveValue>) -> bool {
    match directive {
        Some(directive) => {
            get_bool_argument_is_true(&directive.arguments, *HAS_OUTPUT_TYPE_ARGUMENT_NAME)
        }
        None => false,
    }
}
