/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::collections::HashSet;
use std::collections::VecDeque;

use common::ArgumentName;
use common::DirectiveName;
use common::NamedItem;
use common::WithLocation;
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
use graphql_syntax::OperationKind;
use graphql_syntax::SchemaDocument;
use graphql_syntax::TypeSystemDefinition;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use program_with_dependencies::ProgramWithDependencies;
use schema::DirectiveValue;
use schema::EnumID;
use schema::FieldID;
use schema::InputObjectID;
use schema::InterfaceID;
use schema::ObjectID;
use schema::SDLSchema;
use schema::ScalarID;
use schema::Schema;
use schema::Type;
use schema::TypeReference;
use schema::UnionID;

use crate::OutputNonNull;
use crate::OutputTypeReference;
use crate::SEMANTIC_NON_NULL;
use crate::SEMANTIC_NON_NULL_LEVELS_ARG;
use crate::schema_set::FieldName;
use crate::schema_set::SchemaDefinitionItem;
use crate::schema_set::SchemaSet;
use crate::schema_set::SetArgument;
use crate::schema_set::SetDirective;
use crate::schema_set::SetEnum;
use crate::schema_set::SetField;
use crate::schema_set::SetInputObject;
use crate::schema_set::SetInterface;
use crate::schema_set::SetMemberType;
use crate::schema_set::SetObject;
use crate::schema_set::SetScalar;
use crate::schema_set::SetType;
use crate::schema_set::SetUnion;

#[derive(Debug, Clone)]
pub struct UsedSchemaCollectionOptions {
    /// For *GraphServices*, if you request __typename but do not explicitly include the concrete type,
    /// we will translate what we get over-the-wire to an unknown "MyInterface" value.
    /// Basically, a user adding __typename forces the list of member types to act as an enumeration.
    ///
    /// This should *only* be an issue *for GraphServices*, and only if people explicitly *switch on the typename string*.
    /// To combat that, if 'include_implementations_when_typename_requested' and we include an *explicit* `__typename` on the abstract type,
    /// then the library needs to consider *every child type* as a used type.
    /// For now, we just *always* require this, regardless of whether we're in Pando or GraphServices: it should help
    /// showcase to product teams *how* their usage of __typename unnecessarily adds complexity to their product
    ///
    /// IMPORTANT NOTE: this should *always* be false when visting a post-transforms-applied IR.
    ///
    /// When Some, we DO include implementations, EXCEPT if using the directive blocklist
    pub include_implementations_when_typename_requested: Option<Vec<DirectiveName>>,
    pub include_all_overlapping_concrete_types: bool,
    /// Do we include directives on the SDL types themselves? For code-generation and transformation use cases,
    /// we DO usually need these directives to know, for instance, whether we explicitly insert strong_id__ fields.
    pub include_directives_on_schema_definitions: bool,
    /// Directives are usually fairly well centralized.
    ///
    /// For most cases we likely want to pull out a "known centralized schema" instead, but for simple cases,
    /// like perusing a query's used schema, not including any directives is a reasonable flag.
    pub include_directive_definitions: bool,

    /// Do we need implicitly used enum values?
    pub include_implicit_output_enum_values: bool,
    pub include_implicit_input_fields_and_enum_values: bool,
}

impl UsedSchemaCollectionOptions {
    /// What people think of when they think "used schema": the types and fields that are referenced
    /// including types that are referenced via transform (i.e. PageInfo when using @pando_connection).
    pub fn only_explicitly_used_without_directives_options() -> Self {
        Self {
            include_implementations_when_typename_requested: None,
            include_all_overlapping_concrete_types: false,
            include_directives_on_schema_definitions: false,
            include_directive_definitions: false,
            include_implicit_output_enum_values: false,
            include_implicit_input_fields_and_enum_values: false,
        }
    }

    pub fn explicitly_used_outputs_and_implicit_inputs_without_directives_options() -> Self {
        Self {
            include_implementations_when_typename_requested: None,
            include_all_overlapping_concrete_types: false,
            include_directives_on_schema_definitions: false,
            include_directive_definitions: false,
            include_implicit_output_enum_values: false,
            include_implicit_input_fields_and_enum_values: true,
        }
    }
}

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

/**
 * Methods that allow us to "touch" used types from the parent schema.
 */
impl SchemaSet {
    pub(crate) fn touch_operation_kind(
        &mut self,
        schema: &SDLSchema,
        operation_kind: OperationKind,
    ) {
        match operation_kind {
            OperationKind::Query => {
                self.root_schema.query_type =
                    schema.query_type().map(|type_| schema.get_type_name(type_));
            }
            OperationKind::Mutation => {
                self.root_schema.mutation_type = schema
                    .mutation_type()
                    .map(|type_| schema.get_type_name(type_));
            }
            OperationKind::Subscription => {
                self.root_schema.subscription_type = schema
                    .subscription_type()
                    .map(|type_| schema.get_type_name(type_));
            }
        }
    }

    // Add the output type to the correct type map, if it is not already there.
    pub(crate) fn touch_output_type(
        &mut self,
        schema: &SDLSchema,
        type_: &Type,
        options: &UsedSchemaCollectionOptions,
    ) {
        match type_ {
            Type::Object(id) => self.touch_object_type(schema, id, options),
            Type::Interface(id) => self.touch_interface_type(schema, id, options),
            Type::Union(id) => self.touch_union_type(schema, id, options),
            Type::Scalar(id) => self.touch_scalar(schema, id, options),
            Type::Enum(id) => {
                self.touch_enum(schema, id, options);
                if options.include_implicit_output_enum_values {
                    // This is an enum used as an output, so must include all values
                    self.update_all_enum_values(schema, id);
                }
            }
            Type::InputObject(_) => panic!(
                "Trying to add an input object {:?} to the used schema from an output type",
                type_
            ),
        }
    }

    // Add the type plus all of its fields/values to the used types map, recursively.
    // This should only be used for types that can be used as variable values.
    pub(crate) fn touch_variable_type(
        &mut self,
        schema: &SDLSchema,
        type_: &Type,
        options: &UsedSchemaCollectionOptions,
    ) {
        match type_ {
            Type::Object(_) => panic!(
                "Should never recursively use composite types, trying to touch whole {:?}.",
                type_
            ),
            Type::Interface(_) => panic!(
                "Should never recursively use composite types, trying to touch whole {:?}.",
                type_
            ),
            Type::Union(_) => panic!(
                "Should never recursively use composite types, trying to touch whole {:?}.",
                type_
            ),
            Type::Scalar(id) => self.touch_scalar(schema, id, options),
            Type::Enum(id) => {
                self.touch_enum(schema, id, options);
                // This is an enum used as an output, so must include all values
                if options.include_implicit_input_fields_and_enum_values {
                    self.update_all_enum_values(schema, id);
                }
            }
            Type::InputObject(id) => {
                let used_input_object = self.touch_input_object(schema, id, options);
                if used_input_object.fully_recursively_visited
                    || !options.include_implicit_input_fields_and_enum_values
                {
                    return;
                }
                used_input_object.fully_recursively_visited = true;
                for field in schema.input_object(*id).fields.iter() {
                    self.touch_input_object_field(schema, id, field.name.item.0, options);
                    self.touch_variable_type(schema, &field.type_.inner(), options);
                }
            }
        }
    }

    pub(crate) fn touch_input_type(
        &mut self,
        schema: &SDLSchema,
        type_: &Type,
        options: &UsedSchemaCollectionOptions,
    ) {
        match type_ {
            Type::Object(_) => panic!(
                "Should never have use composite input types, trying to touch {:?}.",
                type_
            ),
            Type::Interface(_) => panic!(
                "Should never have use composite input types, trying to touch {:?}.",
                type_
            ),
            Type::Union(_) => panic!(
                "Should never have use composite input types, trying to touch {:?}.",
                type_
            ),
            Type::Scalar(id) => self.touch_scalar(schema, id, options),
            Type::Enum(id) => self.touch_enum(schema, id, options),
            Type::InputObject(id) => {
                self.touch_input_object(schema, id, options);
            }
        }
    }

    fn touch_object_type(
        &mut self,
        schema: &SDLSchema,
        id: &ObjectID,
        options: &UsedSchemaCollectionOptions,
    ) {
        let from_schema = schema.object(*id);
        if !self.types.contains_key(&from_schema.name.item.0) {
            // We always mark ALL interfaces. Because the used schemas are sharded, we don't want
            // a situation where an interface is used in a different library, but this type is not,
            // and when merging we can't recognize that there should be a link between the two.
            let all_interfaces = from_schema
                .interfaces
                .iter()
                .map(|id| {
                    let schema_interface = schema.interface(*id);
                    (
                        schema_interface.name.item.0,
                        SetMemberType {
                            name: schema_interface.name.item.0,
                            is_extension: schema_interface.is_extension,
                        },
                    )
                })
                .collect();
            self.types
                .entry(from_schema.name.item.0)
                .or_insert(SetType::Object(SetObject {
                    definition: Some(SchemaDefinitionItem {
                        name: WithLocation::new(from_schema.name.location, from_schema.name.item.0),
                        is_client_definition: from_schema.is_extension,
                        description: None,
                        hack_source: None,
                    }),
                    fields: StringKeyMap::default(),
                    interfaces: all_interfaces,
                    name: from_schema.name.item,
                    directives: copy_sdl_directives(&from_schema.directives, options),
                }));
            // Any schema-level directives must also be inserted
            self.touch_directive_values(schema, &from_schema.directives, options);
        }
    }

    fn touch_interface_type(
        &mut self,
        schema: &SDLSchema,
        id: &InterfaceID,
        options: &UsedSchemaCollectionOptions,
    ) {
        let from_schema = schema.interface(*id);
        if !self.types.contains_key(&from_schema.name.item.0) {
            // We always mark ALL interfaces. Because the used schemas are sharded, we don't want
            // a situation where an interface is used in a different library, but this type is not,
            // and when merging we can't recognize that there should be a link between the two.
            let all_interfaces = from_schema
                .interfaces
                .iter()
                .map(|id| {
                    let schema_interface = schema.interface(*id);
                    (
                        schema_interface.name.item.0,
                        SetMemberType {
                            name: schema_interface.name.item.0,
                            is_extension: schema_interface.is_extension,
                        },
                    )
                })
                .collect();

            self.types
                .entry(from_schema.name.item.0)
                .or_insert(SetType::Interface(SetInterface {
                    definition: Some(SchemaDefinitionItem {
                        name: WithLocation::new(from_schema.name.location, from_schema.name.item.0),
                        is_client_definition: from_schema.is_extension,
                        description: None,
                        hack_source: None,
                    }),
                    fields: StringKeyMap::default(),
                    interfaces: all_interfaces,
                    name: from_schema.name.item,
                    directives: copy_sdl_directives(&from_schema.directives, options),
                }));
            self.touch_directive_values(schema, &from_schema.directives, options);
        }
    }

    fn touch_union_type(
        &mut self,
        schema: &SDLSchema,
        id: &UnionID,
        options: &UsedSchemaCollectionOptions,
    ) {
        let from_schema = schema.union(*id);
        if !self.types.contains_key(&from_schema.name.item.0) {
            self.types.entry(from_schema.name.item.0).or_insert({
                let members = from_schema
                    .members
                    .iter()
                    .map(|id| {
                        let member = schema.object(*id);
                        (
                            member.name.item.0,
                            SetMemberType {
                                name: member.name.item.0,
                                is_extension: member.is_extension,
                            },
                        )
                    })
                    .collect();
                SetType::Union(SetUnion {
                    definition: Some(SchemaDefinitionItem {
                        name: WithLocation::new(from_schema.name.location, from_schema.name.item.0),
                        is_client_definition: from_schema.is_extension,
                        description: None,
                        hack_source: None,
                    }),
                    // We always include ALL members of the union.
                    // This is the same logic as always including all implements
                    // on an Object: the schemas are sharded, and we don't want
                    // to miss a member that is used in another library.
                    members,
                    name: from_schema.name.item,
                    directives: copy_sdl_directives(&from_schema.directives, options),
                })
            });
            self.touch_directive_values(schema, &from_schema.directives, options);
        }
    }

    pub(crate) fn touch_input_object(
        &mut self,
        schema: &SDLSchema,
        id: &InputObjectID,
        options: &UsedSchemaCollectionOptions,
    ) -> &mut SetInputObject {
        let schema_input = schema.input_object(*id);
        self.touch_directive_values(schema, &schema_input.directives, options);
        let name = schema_input.name.item.0;
        self.types
            .entry(name)
            .or_insert(SetType::InputObject(SetInputObject {
                definition: Some(SchemaDefinitionItem {
                    name: WithLocation::new(schema_input.name.location, schema_input.name.item.0),
                    // WTF schema does not allow input objects as extensions yet?
                    is_client_definition: false,
                    description: None,
                    hack_source: None,
                }),
                fields: StringKeyIndexMap::default(),
                name: schema_input.name.item,
                directives: copy_sdl_directives(&schema_input.directives, options),
                fully_recursively_visited: false,
            }));
        if let SetType::InputObject(input_object) = self.types.get_mut(&name).unwrap() {
            input_object
        } else {
            unreachable!(
                "We just put the input object {} into the SchemaSet types map, how is it not found?",
                name
            )
        }
    }

    // Return the existing set of SetArguments for this field.
    // If there are none, then
    pub fn touch_field(
        &mut self,
        schema: &SDLSchema,
        field_id: &FieldID,
        options: &UsedSchemaCollectionOptions,
    ) {
        let schema_field = schema.field(*field_id);
        self.touch_directive_values(schema, &schema_field.directives, options);
        let field_name = schema_field.name.item;
        self.touch_output_type(schema, &schema_field.type_.inner(), options);
        // Fields without parent types should be meta-fields, so do not need to be included in the
        // used schema.
        if let Some(parent_type) = schema_field.parent_type {
            // You might be wondering: didn't we *already* touch the parent type during the IR visit?
            // You'd be correct! except: @fixme_fat_interface means there might be fields under
            // a *union*. The Schema's lookup() function will just find *some* field with the name
            // that is on *some* type that is a member of the current abstract type. So we need to
            // touch *that* arbitrary type, too!
            self.touch_output_type(schema, &parent_type, options);
            match parent_type {
                Type::Object(id) => {
                    let object_name = schema.object(id).name.item.0;
                    if let Some(SetType::Object(used_object)) = self.types.get_mut(&object_name) {
                        used_object.fields.entry(field_name).or_insert(SetField {
                            definition: Some(SchemaDefinitionItem {
                                name: WithLocation::new(
                                    schema_field.name.location,
                                    schema_field.name.item,
                                ),
                                is_client_definition: schema_field.is_extension,
                                description: None,
                                hack_source: None,
                            }),
                            arguments: StringKeyIndexMap::default(),
                            type_: stringkey_output_type_ref_from_schema_type(
                                schema,
                                &schema_field.type_,
                                &schema_field.directives,
                                options,
                            ),
                            name: FieldName(field_name),
                            directives: copy_sdl_directives(&schema_field.directives, options),
                        });
                    }
                }
                Type::Interface(id) => {
                    let interface_name = schema.interface(id).name.item.0;
                    if let Some(SetType::Interface(used_interface)) =
                        self.types.get_mut(&interface_name)
                    {
                        used_interface.fields.entry(field_name).or_insert(SetField {
                            definition: Some(SchemaDefinitionItem {
                                name: WithLocation::new(
                                    schema_field.name.location,
                                    schema_field.name.item,
                                ),
                                is_client_definition: schema_field.is_extension,
                                description: None,
                                hack_source: None,
                            }),
                            arguments: StringKeyIndexMap::default(),
                            type_: stringkey_output_type_ref_from_schema_type(
                                schema,
                                &schema_field.type_,
                                &schema_field.directives,
                                options,
                            ),
                            name: FieldName(field_name),
                            directives: copy_sdl_directives(&schema_field.directives, options),
                        });
                    }
                }
                _ => panic!("Unexpected parent type for field {:?}.", schema_field),
            }
        }

        // TODO: handle legacy style @connection fields with client-defined schema extensions.
        // Plus any other non-meta fields that are inserted via transform.
    }

    pub(crate) fn touch_fragment_spread(
        &mut self,
        schema: &SDLSchema,
        parent_type: Type,
        spread_type: Type,
        options: &UsedSchemaCollectionOptions,
    ) {
        self.touch_output_type(schema, &spread_type, options);

        // When encountering an abstract => abstract spread, we must include all
        // implementations that intersect between the two types.
        // If the *last* intersecting type is removed, direct spreads between those two types
        // are now invalid.
        if options.include_all_overlapping_concrete_types && parent_type != spread_type {
            for intersecting_type in overlapping_types(schema, parent_type, spread_type) {
                self.touch_output_type(schema, &intersecting_type, options);
            }
        }
    }

    pub(crate) fn touch_directive(
        &mut self,
        schema: &SDLSchema,
        directive_name: StringKey,
        options: &UsedSchemaCollectionOptions,
    ) {
        if !options.include_directive_definitions {
            return;
        }
        schema
            .get_directive(DirectiveName(directive_name))
            .map(|schema_directive| {
                self.directives
                    .entry(directive_name)
                    .or_insert(SetDirective {
                        definition: Some(SchemaDefinitionItem {
                            name: WithLocation::new(
                                schema_directive.name.location,
                                schema_directive.name.item.0,
                            ),
                            is_client_definition: schema_directive.is_extension,
                            description: None,
                            hack_source: None,
                        }),
                        arguments: StringKeyIndexMap::default(),
                        locations: schema_directive.locations.clone(),
                        name: DirectiveName(directive_name),
                        repeatable: schema_directive.repeatable,
                    })
            });
    }

    pub(crate) fn touch_directive_values(
        &mut self,
        schema: &SDLSchema,
        directive_values: &[DirectiveValue],
        options: &UsedSchemaCollectionOptions,
    ) {
        for directive_value in directive_values {
            self.touch_directive(schema, directive_value.name.0, options);
        }
    }

    pub(crate) fn touch_field_argument(
        &mut self,
        schema: &SDLSchema,
        field_id: &FieldID,
        argument_name: StringKey,
        options: &UsedSchemaCollectionOptions,
    ) {
        let schema_field = schema.field(*field_id);
        if let Some(parent_type) = schema_field.parent_type {
            if let Some(schema_arg) = schema_field.arguments.named(ArgumentName(argument_name)) {
                self.touch_directive_values(schema, &schema_arg.directives, options);
                self.touch_input_type(schema, &schema_arg.type_.inner(), options);

                let maybe_used_field: Option<&mut SetField> = match parent_type {
                    Type::Object(id) => self
                        .types
                        .get_mut(&schema.object(id).name.item.0)
                        .and_then(|used_object| {
                            if let SetType::Object(used_object) = used_object {
                                used_object.fields.get_mut(&schema_field.name.item)
                            } else {
                                None
                            }
                        }),
                    Type::Interface(id) => self
                        .types
                        .get_mut(&schema.interface(id).name.item.0)
                        .and_then(|used_interface| {
                            if let SetType::Interface(used_interface) = used_interface {
                                used_interface.fields.get_mut(&schema_field.name.item)
                            } else {
                                None
                            }
                        }),
                    _ => None,
                };

                if let Some(used_field) = maybe_used_field {
                    used_field
                        .arguments
                        .entry(argument_name)
                        .or_insert(SetArgument {
                            definition: Some(SchemaDefinitionItem {
                                name: WithLocation::new(
                                    schema_arg.name.location,
                                    schema_arg.name.item.0,
                                ),
                                is_client_definition: schema_field.is_extension,
                                description: None,
                                hack_source: None,
                            }),
                            name: argument_name,
                            type_: stringkey_type_ref_from_schema_type(schema, &schema_arg.type_),
                            default_value: schema_arg.default_value.clone(),
                            directives: copy_sdl_directives(&schema_arg.directives, options),
                        });
                }
            }
        }
    }

    fn touch_input_object_field(
        &mut self,
        schema: &SDLSchema,
        input_object_id: &InputObjectID,
        field_name: StringKey,
        options: &UsedSchemaCollectionOptions,
    ) {
        let schema_input = schema.input_object(*input_object_id);
        if let Some(schema_input_field) = schema_input.fields.named(ArgumentName(field_name)) {
            self.touch_directive_values(schema, &schema_input_field.directives, options);
            self.touch_input_type(schema, &schema_input_field.type_.inner(), options);

            if let Some(SetType::InputObject(used_input)) =
                self.types.get_mut(&schema_input.name.item.0)
            {
                used_input.fields.entry(field_name).or_insert(SetArgument {
                    definition: Some(SchemaDefinitionItem {
                        name: WithLocation::new(
                            schema_input.name.location,
                            schema_input.name.item.0,
                        ),
                        is_client_definition: false,
                        description: None,
                        hack_source: None,
                    }),
                    name: field_name,
                    type_: stringkey_type_ref_from_schema_type(schema, &schema_input_field.type_),
                    default_value: schema_input_field.default_value.clone(),
                    directives: copy_sdl_directives(&schema_input_field.directives, options),
                });
            }
        }
    }

    fn touch_directive_argument(
        &mut self,
        schema: &SDLSchema,
        schema_directive: &schema::Directive,
        argument_name: StringKey,
        options: &UsedSchemaCollectionOptions,
    ) {
        if let Some(schema_arg) = schema_directive
            .arguments
            .named(ArgumentName(argument_name))
        {
            self.touch_directive_values(schema, &schema_arg.directives, options);
            self.touch_input_type(schema, &schema_arg.type_.inner(), options);

            if let Some(used_directive) = self.directives.get_mut(&schema_directive.name.item.0) {
                used_directive
                    .arguments
                    .entry(argument_name)
                    .or_insert(SetArgument {
                        definition: Some(SchemaDefinitionItem {
                            name: WithLocation::new(
                                schema_arg.name.location,
                                schema_arg.name.item.0,
                            ),
                            is_client_definition: schema_directive.is_extension,
                            description: None,
                            hack_source: None,
                        }),
                        name: argument_name,
                        type_: stringkey_type_ref_from_schema_type(schema, &schema_arg.type_),
                        default_value: schema_arg.default_value.clone(),
                        directives: copy_sdl_directives(&schema_arg.directives, options),
                    });
            }
        }
    }

    fn touch_scalar(
        &mut self,
        schema: &SDLSchema,
        scalar_id: &ScalarID,
        options: &UsedSchemaCollectionOptions,
    ) {
        let from_schema = schema.scalar(*scalar_id);
        self.touch_directive_values(schema, &from_schema.directives, options);

        self.types
            .entry(from_schema.name.item.0)
            .or_insert(SetType::Scalar(SetScalar {
                definition: Some(SchemaDefinitionItem {
                    name: WithLocation::new(from_schema.name.location, from_schema.name.item.0),
                    is_client_definition: from_schema.is_extension,
                    description: None,
                    hack_source: None,
                }),
                name: from_schema.name.item,
                directives: copy_sdl_directives(&from_schema.directives, options),
            }));
    }

    fn touch_enum(
        &mut self,
        schema: &SDLSchema,
        enum_id: &EnumID,
        options: &UsedSchemaCollectionOptions,
    ) {
        let from_schema = schema.enum_(*enum_id);
        self.touch_directive_values(schema, &from_schema.directives, options);

        self.types
            .entry(from_schema.name.item.0)
            .or_insert(SetType::Enum(SetEnum {
                definition: Some(SchemaDefinitionItem {
                    name: WithLocation::new(from_schema.name.location, from_schema.name.item.0),
                    is_client_definition: from_schema.is_extension,
                    description: None,
                    hack_source: None,
                }),
                values: BTreeMap::default(),
                name: from_schema.name.item,
                directives: copy_sdl_directives(&from_schema.directives, options),
            }));
    }

    fn touch_enum_value(
        &mut self,
        schema: &SDLSchema,
        enum_id: &EnumID,
        enum_value: StringKey,
        options: &UsedSchemaCollectionOptions,
    ) {
        let schema_enum = schema.enum_(*enum_id);
        if let Some(schema_value) = schema_enum.values.iter().find(|v| v.value == enum_value) {
            self.touch_directive_values(schema, &schema_value.directives, options);
            if let Some(SetType::Enum(used_enum)) = self.types.get_mut(&schema_enum.name.item.0) {
                used_enum
                    .values
                    .entry(enum_value)
                    .or_insert_with(|| schema_value.clone());
            }
        }
    }

    fn update_all_enum_values(&mut self, schema: &SDLSchema, enum_id: &EnumID) {
        let schema_enum = schema.enum_(*enum_id);
        if let Some(SetType::Enum(used_enum)) = self.types.get_mut(&schema_enum.name.item.0) {
            for value in schema_enum.values.iter() {
                used_enum.values.entry(value.value).or_insert(value.clone());
            }
        }
    }
}

fn stringkey_type_ref_from_schema_type(
    schema: &SDLSchema,
    schema_type: &TypeReference<Type>,
) -> TypeReference<StringKey> {
    match schema_type {
        TypeReference::Named(type_) => TypeReference::Named(schema.get_type_name(*type_)),
        TypeReference::NonNull(inner) => {
            TypeReference::NonNull(Box::new(stringkey_type_ref_from_schema_type(schema, inner)))
        }
        TypeReference::List(inner) => {
            TypeReference::List(Box::new(stringkey_type_ref_from_schema_type(schema, inner)))
        }
    }
}

fn stringkey_output_type_ref_from_schema_type(
    schema: &SDLSchema,
    schema_type: &TypeReference<Type>,
    directives: &[DirectiveValue],
    options: &UsedSchemaCollectionOptions,
) -> OutputTypeReference<StringKey> {
    // Following logic for how @semanticNonNull(levels: [Int] = [0]) is defined here:
    // https://relay.dev/docs/guides/semantic-nullability/#proposed-solution
    let mut semantic_non_null_levels: VecDeque<i64> =
        if options.include_directives_on_schema_definitions {
            directives.named(*SEMANTIC_NON_NULL).map_or_else(
                Default::default,
                |semantic_non_null_directive| {
                    semantic_non_null_directive
                        .arguments
                        .iter()
                        .find_map(|arg| {
                            if arg.name == *SEMANTIC_NON_NULL_LEVELS_ARG {
                                Some(match &arg.value {
                                    graphql_syntax::ConstantValue::List(_) => {
                                        arg.expect_int_list().into_iter().collect()
                                    }
                                    single => [single.unwrap_int()].into_iter().collect(),
                                })
                            } else {
                                None
                            }
                        })
                        .unwrap_or_else(|| [0].into_iter().collect())
                },
            )
        } else {
            // If we aren't including directives then we don't need semantic non null either.
            Default::default()
        };
    stringkey_output_type_ref_from_schema_type_with_semantic_nonnull(
        schema,
        schema_type,
        &mut semantic_non_null_levels,
    )
}

fn stringkey_output_type_ref_from_schema_type_with_semantic_nonnull(
    schema: &SDLSchema,
    schema_type: &TypeReference<Type>,
    // sorted where 0 is at the front of the queue
    semantic_non_null_levels: &mut VecDeque<i64>,
) -> OutputTypeReference<StringKey> {
    if let Some(next_semantic_non_null_level) = semantic_non_null_levels.pop_front() {
        if next_semantic_non_null_level == 0 {
            // This level is @semanticNonNull, but it might ALSO be strictly NonNull, in which case just take the strictly NonNull.
            return if let TypeReference::NonNull(_) = schema_type {
                stringkey_output_type_ref_from_schema_type_with_semantic_nonnull(
                    schema,
                    schema_type,
                    semantic_non_null_levels,
                )
            } else {
                OutputTypeReference::NonNull(OutputNonNull::Semantic(Box::new(
                    stringkey_output_type_ref_from_schema_type_with_semantic_nonnull(
                        schema,
                        schema_type,
                        semantic_non_null_levels,
                    ),
                )))
            };
        } else {
            // Put the value back: it is not 0, so we still need it.
            semantic_non_null_levels.push_front(next_semantic_non_null_level);
            // If we're stepping into a list, then reduce all levels by 1.
            if let TypeReference::List(_) = schema_type {
                for level in semantic_non_null_levels.iter_mut() {
                    *level -= 1;
                }
            }
        }
    }
    match schema_type {
        TypeReference::Named(type_) => OutputTypeReference::Named(schema.get_type_name(*type_)),
        TypeReference::NonNull(inner) => {
            OutputTypeReference::NonNull(OutputNonNull::KillsParent(Box::new(
                stringkey_output_type_ref_from_schema_type_with_semantic_nonnull(
                    schema,
                    inner,
                    semantic_non_null_levels,
                ),
            )))
        }
        TypeReference::List(inner) => OutputTypeReference::List(Box::new(
            stringkey_output_type_ref_from_schema_type_with_semantic_nonnull(
                schema,
                inner,
                semantic_non_null_levels,
            ),
        )),
    }
}

/// This probably should live in the Relay graphql_schema.rs methods
/// It is veeeery similar to are_overlapping_types, but it's a *bit* more expensive
/// due to allocating new vectors.
fn overlapping_types(schema: &SDLSchema, a: Type, b: Type) -> Vec<Type> {
    fn overlapping_objects(a: &[ObjectID], b: &[ObjectID]) -> Vec<Type> {
        a.iter()
            .filter(|item| b.contains(item))
            .map(|item| Type::Object(*item))
            .collect()
    }

    fn overlapping_interfaces(a: &[InterfaceID], b: &[InterfaceID]) -> Vec<Type> {
        a.iter()
            .filter(|item| b.contains(item))
            .map(|item| Type::Interface(*item))
            .collect()
    }

    match (a, b) {
        (Type::Interface(a), Type::Interface(b)) => {
            let mut overlapping = overlapping_objects(
                &schema.interface(a).implementing_objects,
                &schema.interface(b).implementing_objects,
            );
            overlapping.extend(overlapping_interfaces(
                &schema.interface(a).implementing_interfaces,
                &schema.interface(b).implementing_interfaces,
            ));
            overlapping
        }

        (Type::Union(a), Type::Union(b)) => {
            overlapping_objects(&schema.union(a).members, &schema.union(b).members)
        }

        (Type::Union(union_id), Type::Interface(interface_id))
        | (Type::Interface(interface_id), Type::Union(union_id)) => overlapping_objects(
            &schema.union(union_id).members,
            &schema.interface(interface_id).implementing_objects,
        ),

        (Type::Interface(interface_id), Type::Object(object_id))
        | (Type::Object(object_id), Type::Interface(interface_id)) => {
            if schema
                .interface(interface_id)
                .implementing_objects
                .contains(&object_id)
            {
                vec![Type::Object(object_id)]
            } else {
                Vec::new()
            }
        }

        (Type::Union(union_id), Type::Object(object_id))
        | (Type::Object(object_id), Type::Union(union_id)) => {
            if schema.union(union_id).members.contains(&object_id) {
                vec![Type::Object(object_id)]
            } else {
                Vec::new()
            }
        }

        _ => Vec::new(),
    }
}

fn copy_sdl_directives(
    schema_directives: &[DirectiveValue],
    options: &UsedSchemaCollectionOptions,
) -> Vec<DirectiveValue> {
    if options.include_directives_on_schema_definitions {
        schema_directives
            .iter()
            .filter(|d| d.name != *SEMANTIC_NON_NULL)
            .cloned()
            .collect()
    } else {
        Vec::new()
    }
}
