/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;

use common::NamedItem;
use graphql_ir::ConstantValue;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::ScalarField;
use graphql_ir::Value;
use graphql_ir::VariableDefinition;
use graphql_ir::Visitor;
use graphql_syntax::SchemaDocument;
use graphql_syntax::TypeSystemDefinition;
use intern::string_key::StringKey;
use program_with_dependencies::ProgramWithDependencies;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use crate::schema_set::SchemaSet;
use crate::schema_set_collection_options::UsedSchemaCollectionOptions;

pub struct UsedSchemaIRCollector<'a> {
    pub program: &'a ProgramWithDependencies,
    pub schema: &'a SDLSchema,

    pub options: UsedSchemaCollectionOptions,
    pub used_schema: &'a mut SchemaSet,
    parent_output_type: Option<Type>,
    root_definitions: Option<Vec<StringKey>>,
    visited_definitions: HashSet<StringKey>,
}

impl<'a> UsedSchemaIRCollector<'a> {
    pub fn new<'b: 'a>(
        used_schema: &'b mut SchemaSet,
        program: &'b ProgramWithDependencies,
        used_schema_options: UsedSchemaCollectionOptions,
    ) -> Self {
        Self {
            program,
            schema: &program.schema,
            options: used_schema_options,
            used_schema,
            parent_output_type: None,
            root_definitions: None,
            visited_definitions: HashSet::default(),
        }
    }

    /// In some situations, we want to find everything used within an entire corpus,
    /// rooted at one or a few specific definitions.
    ///
    /// This tells us to visit definitions in DFS order, so that we ignore unreachable definitions.
    pub fn new_with_reachable_from_roots<'b: 'a>(
        used_schema: &'b mut SchemaSet,
        program: &'b ProgramWithDependencies,
        used_schema_options: UsedSchemaCollectionOptions,
        root_definition_names: &[StringKey],
    ) -> Self {
        Self {
            program,
            schema: &program.schema,
            options: used_schema_options,
            used_schema,
            parent_output_type: None,
            root_definitions: Some(root_definition_names.to_vec()),
            visited_definitions: HashSet::default(),
        }
    }

    pub fn add_used_type_definitions(&mut self, type_definitions_doc: SchemaDocument) {
        for type_def in type_definitions_doc.definitions.iter() {
            // When encountering *extensions* of potentially unused-by-the-library type,
            // make sure we mark the original type as a server schema type, not an extension.
            // *definitions* are extensions and will be handled in the normal merge process.
            match type_def {
                TypeSystemDefinition::ObjectTypeExtension(extension) => {
                    if let Some(Type::Object(id)) = self.schema.get_type(extension.name.value) {
                        self.used_schema
                            .touch_object_type(self.schema, &id, &self.options);
                    }
                }
                TypeSystemDefinition::InterfaceTypeExtension(extension) => {
                    if let Some(Type::Interface(id)) = self.schema.get_type(extension.name.value) {
                        self.used_schema
                            .touch_interface_type(self.schema, &id, &self.options);
                    }
                }
                TypeSystemDefinition::UnionTypeExtension(extension) => {
                    if let Some(Type::Union(id)) = self.schema.get_type(extension.name.value) {
                        self.used_schema
                            .touch_union_type(self.schema, &id, &self.options);
                    }
                }
                TypeSystemDefinition::EnumTypeExtension(extension) => {
                    if let Some(Type::Enum(id)) = self.schema.get_type(extension.name.value) {
                        self.used_schema.touch_enum(self.schema, &id, &self.options);
                    }
                }
                TypeSystemDefinition::ScalarTypeExtension(extension) => {
                    if let Some(Type::Scalar(id)) = self.schema.get_type(extension.name.value) {
                        self.used_schema
                            .touch_scalar(self.schema, &id, &self.options);
                    }
                }
                // Do not need to handle non-extension definitions outside normal sdl merge.
                _ => {}
            }
        }

        self.used_schema
            .merge_sdl_document(&type_definitions_doc, true);
    }

    // Visitors that need extra information passed from above
    fn visit_field_arguments(
        &mut self,
        parent_field_id: FieldID,
        arguments: &Vec<graphql_ir::Argument>,
    ) {
        let parent_field_def = self.schema.field(parent_field_id);
        for argument in arguments {
            self.used_schema.touch_field_argument(
                self.schema,
                &parent_field_id,
                argument.name.item.0,
                &self.options,
            );

            let argument_type = parent_field_def
                .arguments
                .named(argument.name.item)
                .unwrap_or_else(|| {
                    panic!(
                        "Could not find argument {:?} for field {:?}",
                        argument, parent_field_def
                    )
                })
                .type_
                .inner();
            self.visit_argument_value(&argument.value.item, &argument_type);
        }
    }

    fn visit_directive_arguments(
        &mut self,
        schema_directive: &schema::Directive,
        arguments: &Vec<graphql_ir::Argument>,
    ) {
        for argument in arguments {
            self.used_schema.touch_directive_argument(
                self.schema,
                schema_directive,
                argument.name.item.0,
                &self.options,
            );

            let argument_type = schema_directive
                .arguments
                .named(argument.name.item)
                .unwrap_or_else(|| {
                    panic!(
                        "Could not find argument {:?} for directive {:?}",
                        argument, schema_directive
                    )
                })
                .type_
                .inner();
            self.visit_argument_value(&argument.value.item, &argument_type);
        }
    }

    fn visit_argument_value(&mut self, argument_value: &Value, argument_type: &Type) {
        match argument_value {
            Value::Constant(arg_val) => {
                self.visit_constant_value(arg_val, argument_type);
            }
            Value::Variable(_) => {
                self.used_schema
                    .touch_variable_type(self.schema, argument_type, &self.options);
            }
            Value::List(arg_val) => {
                for item in arg_val {
                    self.visit_argument_value(item, argument_type);
                }
            }
            Value::Object(arg_val) => {
                if let &Type::InputObject(id) = argument_type {
                    self.used_schema
                        .touch_input_object(self.schema, &id, &self.options);
                    let input_object_def = self.schema.input_object(id);
                    for input_field in arg_val.iter() {
                        let input_field_type = input_object_def
                            .fields
                            .named(input_field.name.item)
                            .unwrap_or_else(|| {
                                panic!(
                                    "Could not find argument {:?} for input onbject {:?}",
                                    input_field, argument_type
                                )
                            })
                            .type_
                            .inner();
                        self.used_schema.touch_input_object_field(
                            self.schema,
                            &id,
                            input_field.name.item.0,
                            &self.options,
                        );
                        self.visit_argument_value(&input_field.value.item, &input_field_type);
                    }
                } else {
                    panic!(
                        "Input Object {:?} with non-input-object argument type {:?}",
                        argument_value, argument_type
                    )
                }
            }
        }
    }

    fn visit_constant_value(&mut self, value: &ConstantValue, argument_type: &Type) {
        match value {
            ConstantValue::Enum(enum_val) => {
                if let &Type::Enum(id) = argument_type {
                    self.used_schema
                        .touch_enum_value(self.schema, &id, *enum_val, &self.options);
                } else {
                    panic!(
                        "Enum constant {:?} with non-enum argument type {:?}",
                        enum_val, argument_type
                    )
                }
            }
            ConstantValue::List(list_val) => {
                for item in list_val.iter() {
                    self.visit_constant_value(item, argument_type);
                }
            }
            ConstantValue::Object(object_val) => {
                if let &Type::InputObject(id) = argument_type {
                    self.used_schema
                        .touch_input_object(self.schema, &id, &self.options);
                    let input_object_def = self.schema.input_object(id);
                    for input_field in object_val.iter() {
                        let input_field_type = input_object_def
                            .fields
                            .named(input_field.name.item)
                            .unwrap_or_else(|| {
                                panic!(
                                    "Could not find input field {:?} for input object {:?}",
                                    input_field, input_object_def
                                )
                            })
                            .type_
                            .inner();
                        self.used_schema.touch_input_object_field(
                            self.schema,
                            &id,
                            input_field.name.item.0,
                            &self.options,
                        );
                        self.visit_constant_value(&input_field.value.item, &input_field_type);
                    }
                } else {
                    panic!(
                        "Object constant {:?} with non-object argument type {:?}",
                        object_val, argument_type
                    )
                }
            }
            // Explicitly recognizing that we do not need to do anything for these constant values: I DO want compiler checks
            // that we've matched all arms though.
            ConstantValue::Int(_) => {}
            ConstantValue::Float(_) => {}
            ConstantValue::String(_) => {}
            ConstantValue::Boolean(_) => {}
            ConstantValue::Null() => {}
        }
    }
}

impl<'a> Visitor for UsedSchemaIRCollector<'a> {
    const NAME: &'static str = "UsedSchemaCollector";
    // Anywhere we have arguments, we need to *explicitly* visit them with parent type information.
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = true;

    fn visit_operation(&mut self, operation: &OperationDefinition) {
        if let Some(root_definitions) = &self.root_definitions {
            if !root_definitions.contains(&operation.name.item.0) {
                // Skip operations that are not in the root definition set
                return;
            }
            self.visited_definitions.insert(operation.name.item.0);
        }

        self.used_schema
            .touch_operation_kind(self.schema, operation.kind);

        self.used_schema
            .touch_output_type(self.schema, &operation.type_, &self.options);
        self.parent_output_type = Some(operation.type_);
        self.default_visit_operation(operation);
        self.parent_output_type = None;
    }

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        let parent_output_type = self.parent_output_type;

        // Logic for DFS visiting only referenced-from-root definitions.
        if let Some(root_definitions) = &self.root_definitions {
            let fragment_name = fragment.name.item.0;
            // Do not visit this fragment if there are roots, this is not a root, and we are not coming from a parent spread
            if !(parent_output_type.is_some() || root_definitions.contains(&fragment_name)) {
                return;
            }
            if self.visited_definitions.contains(&fragment_name) {
                return;
            }
            self.visited_definitions.insert(fragment_name);
        }

        self.used_schema
            .touch_output_type(self.schema, &fragment.type_condition, &self.options);

        // @_autogenerated_for_colocation and @_skip_model_generation indicate that this fragment is needed by infra, but
        // we might insert __typename as a "placeholder" field. So we should not explicitly add all impls when encountering.
        let original_include_implementations_when_typename_requested = self
            .options
            .include_implementations_when_typename_requested
            .clone();
        if original_include_implementations_when_typename_requested
            .as_ref()
            .is_some_and(|opt_out_directives| {
                opt_out_directives.iter().any(|opt_out_directive| {
                    fragment.directives.named(*opt_out_directive).is_some()
                })
            })
        {
            self.options.include_implementations_when_typename_requested = None;
        }

        self.parent_output_type = Some(fragment.type_condition);
        self.default_visit_fragment(fragment);
        self.parent_output_type = parent_output_type;
        self.options.include_implementations_when_typename_requested =
            original_include_implementations_when_typename_requested;
    }

    fn visit_variable_definition(&mut self, var_def: &VariableDefinition) {
        self.used_schema
            .touch_variable_type(self.schema, &var_def.type_.inner(), &self.options);

        if let Some(default_value) = &var_def.default_value {
            self.visit_constant_value(&default_value.item, &var_def.type_.inner());
        }

        self.default_visit_variable_definition(var_def)
    }

    fn visit_inline_fragment(&mut self, inline_fragment: &InlineFragment) {
        if let Some(type_) = inline_fragment.type_condition {
            self.used_schema.touch_fragment_spread(
                self.schema,
                self.parent_output_type.unwrap_or_else(|| {
                    panic!(
                        "No parent type for inline fragment spread: {:?}",
                        inline_fragment
                    )
                }),
                type_,
                &self.options,
            );
        }
        let prev_type = self.parent_output_type;
        self.default_visit_inline_fragment(inline_fragment);
        self.parent_output_type = prev_type;
    }

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if let Some(spread_signature) = &spread.signature {
            self.used_schema.touch_fragment_spread(
                self.schema,
                self.parent_output_type
                    .unwrap_or_else(|| panic!("No parent type for fragment spread: {:?}", spread)),
                spread_signature.type_condition,
                &self.options,
            );
        }

        self.default_visit_fragment_spread(spread);

        // If we are doing DFS with roots, then visit the spread fragment now.
        if self.root_definitions.is_some() {
            if let Some(fragment_definition) =
                self.program.scoped_fragments.get(&spread.fragment.item)
            {
                self.visit_fragment(fragment_definition.as_ref());
            }
        }
    }

    fn visit_scalar_field(&mut self, field: &ScalarField) {
        self.used_schema
            .touch_field(self.schema, &field.definition.item, &self.options);

        // If product is potentially switching on the __typename, then the *implementations* of the parent type
        // are potentially used by product, in an annoying inscrutable-via-pure-graphql way.
        // Note if the product does not *explicitly* include __typename, then they should have no accessor,
        // and therefore won't need any not-included-explicitly child types.
        if self
            .options
            .include_implementations_when_typename_requested
            .is_some()
            && field.definition.item == self.schema.typename_field()
        {
            let member_types = match self.parent_output_type {
                Some(Type::Interface(interface_id)) => self
                    .schema
                    .interface(interface_id)
                    .implementing_objects
                    .clone(),
                Some(Type::Union(union_id)) => self.schema.union(union_id).members.clone(),
                _ => Vec::new(),
            };

            for member in member_types {
                self.used_schema
                    .touch_object_type(self.schema, &member, &self.options)
            }
        }

        self.visit_field_arguments(field.definition.item, &field.arguments);
        let prev_type = self.parent_output_type;
        let field_type = self.schema.field(field.definition.item).type_.inner();
        self.parent_output_type = Some(field_type);
        self.default_visit_scalar_field(field);
        self.parent_output_type = prev_type;
    }

    fn visit_linked_field(&mut self, field: &LinkedField) {
        self.used_schema
            .touch_field(self.schema, &field.definition.item, &self.options);
        self.visit_field_arguments(field.definition.item, &field.arguments);
        let prev_type = self.parent_output_type;
        let field_type = self.schema.field(field.definition.item).type_.inner();
        self.parent_output_type = Some(field_type);
        self.default_visit_linked_field(field);
        self.parent_output_type = prev_type;
    }

    fn visit_directive(&mut self, directive: &graphql_ir::Directive) {
        if !self.options.include_directive_definitions {
            // If we aren't adding directive definitions, then we don't need to visit executable
            // directives at all: their definition, along with arguments and inputs, should be defined once in a centralized file.
            return;
        }
        let schema = self.schema;
        self.used_schema
            .touch_directive(schema, directive.name.item.0, &self.options);

        // Frustratingly, directives in the IR do not have a "directive_location" attribute. So we can just add *all* locations,
        // even though that's subtly wrong. It means adding/removing a directive's possible location will always affect the used schema.
        if let Some(schema_directive) = self.schema.get_directive(directive.name.item) {
            if let Some(used_directive) =
                self.used_schema.directives.get_mut(&directive.name.item.0)
            {
                used_directive.locations = schema_directive.locations.clone();
            }
            self.visit_directive_arguments(schema_directive, &directive.arguments);
        }

        self.default_visit_directive(directive)
    }
}
