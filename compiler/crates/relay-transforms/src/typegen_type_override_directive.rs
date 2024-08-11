use std::path::PathBuf;

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::ArgumentName;
use common::DirectiveName;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::ScalarField;
use graphql_ir::Value;
use intern::intern;
use itertools::Itertools;
use lazy_static::lazy_static;

lazy_static! {
    static ref INTERNAL_TYPE_OVERRIDE_GENERIC_ARGUMENTS: StringKey = intern!("generic_arguments");
    static ref INTERNAL_TYPE_OVERRIDE_NAME: StringKey = intern!("name");
    static ref INTERNAL_TYPE_OVERRIDE_PATH: StringKey = intern!("path");
    static ref INTERNAL_TYPE_OVERRIDE_IS_UNION: StringKey = intern!("union");
}

/// The `@__RelayTypegenTypeOverride` directive allows you to specifiy a custom type
/// that should be used in the generated code instead of the default type.
///
/// The directive is to be used with the `custom_transforms_config`.
/// Specifically the `custom_transforms.typegen_transforms`
///
/// The directive has the following arguments:
/// - `name`: The name of the type as it should be imported in the generated code.
/// - `path`: The path to the file that exports the type.
/// - `generic_arguments`: The generic arguments of the type.
///
/// Inside the a transform you can add this directive to a scalar using `transform_scalar_field`.
///
/// Example:
/// ```
/// use std::path::PathBuf;
/// use std::sync::Arc;
///
/// use graphql_ir::ScalarField;
/// use graphql_ir::Selection;
/// use graphql_ir::Transformed;
/// use graphql_ir::Transformer;
/// use intern::string_key::Intern;
/// use relay_transforms::TypgenTypeOverride;
///
/// struct MyCustomTransformer;
/// impl Transformer for MyCustomTransformer {
///     const NAME: &'static str = "MyCustomTransformer";
///     const VISIT_ARGUMENTS: bool = false;
///     const VISIT_DIRECTIVES: bool = false;
///
///     fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
///         let arguments = self.transform_arguments(&field.arguments);
///         let mut directives = self
///             .transform_directives(&field.directives)
///             .replace_or_else(|| field.directives.clone());
///
///         // Check if the scalar is one that needs your custom type
///         // By checking it's current directives or some other way
///         let typegen_type_override = TypgenTypeOverride {
///             name: "MyCustomScalar".intern(),
///             path: PathBuf::from("path/to/file"),
///             generic_arguments: vec![],
///             is_union: false,
///         };
///
///         directives.push(typegen_type_override.to_directive());
///
///         Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
///             arguments: arguments.replace_or_else(|| field.arguments.clone()),
///             directives,
///             ..field.clone()
///         })))
///     }
/// }
/// ```
pub struct TypgenTypeOverride {
    pub path: PathBuf,
    pub name: StringKey,
    pub generic_arguments: Vec<ConstantValue>,
    pub is_union: bool,
}

impl TypgenTypeOverride {
    /// Get the `@__RelayTypegenTypeOverride` directive from the scalar field
    /// and creates a `TypgenTypeOverride` from it.
    /// Returns None if the directive is not present
    pub fn get_override_from_directive(scalar_field: &ScalarField) -> Option<TypgenTypeOverride> {
        let override_typegen_type_directive_on_field =
            TypgenTypeOverride::get_directive(scalar_field)?;

        Some(TypgenTypeOverride::from(
            override_typegen_type_directive_on_field,
        ))
    }

    fn get_directive(scalar_field: &ScalarField) -> Option<&Directive> {
        scalar_field.directives.named(Self::directive_name())
    }

    fn directive_name() -> DirectiveName {
        DirectiveName("__RelayTypegenTypeOverride".intern())
    }

    pub fn to_directive(&self) -> Directive {
        let mut arguments: Vec<Argument> = vec![
            Argument {
                name: WithLocation::generated(ArgumentName(*INTERNAL_TYPE_OVERRIDE_NAME)),
                value: WithLocation::generated(Value::Constant(ConstantValue::String(self.name))),
            },
            Argument {
                name: WithLocation::generated(ArgumentName(*INTERNAL_TYPE_OVERRIDE_IS_UNION)),
                value: WithLocation::generated(Value::Constant(ConstantValue::Boolean(
                    self.is_union,
                ))),
            },
            Argument {
                name: WithLocation::generated(ArgumentName(*INTERNAL_TYPE_OVERRIDE_PATH)),
                value: WithLocation::generated(Value::Constant(ConstantValue::String(
                    self.path.to_string_lossy().intern(),
                ))),
            },
        ];

        if !self.generic_arguments.is_empty() {
            arguments.push(Argument {
                name: WithLocation::generated(ArgumentName(
                    *INTERNAL_TYPE_OVERRIDE_GENERIC_ARGUMENTS,
                )),
                value: WithLocation::generated(Value::Constant(ConstantValue::List(
                    self.generic_arguments.clone(),
                ))),
            });
        }

        graphql_ir::Directive {
            name: WithLocation::generated(Self::directive_name()),
            arguments,
            data: None,
        }
    }
}

impl From<&Directive> for TypgenTypeOverride {
    fn from(directive: &Directive) -> Self {
        let directive = directive;

        let name = directive
            .arguments
            .named(ArgumentName(*INTERNAL_TYPE_OVERRIDE_NAME))
            .and_then(|a| a.value.item.get_string_literal())
            .expect("Expected a name argument for the @__RelayTypegenTypeOverride directive");

        let path = directive
            .arguments
            .named(ArgumentName(*INTERNAL_TYPE_OVERRIDE_PATH))
            .and_then(|a| a.value.item.get_string_literal())
            .map(|path| PathBuf::from(path.to_string()))
            .expect("Expected a path argument for the @__RelayTypegenTypeOverride directive");

        let is_union = directive
            .arguments
            .named(ArgumentName(*INTERNAL_TYPE_OVERRIDE_IS_UNION))
            .and_then(|a| match a.value.item.get_constant() {
                Some(ConstantValue::Boolean(b)) => Some(*b),
                _ => None,
            })
            .unwrap_or(false);

        let generic_arguments = directive
            .arguments
            .named(ArgumentName(*INTERNAL_TYPE_OVERRIDE_GENERIC_ARGUMENTS))
            .and_then(|a| match &a.value.item {
                Value::Constant(ConstantValue::List(values)) => Some(
                    values
                        .iter()
                        .filter_map(|v| match v {
                            ConstantValue::String(s) => Some(ConstantValue::String(*s)),
                            ConstantValue::Int(i) => Some(ConstantValue::Int(*i)),
                            ConstantValue::Float(f) => Some(ConstantValue::Float(*f)),
                            ConstantValue::Boolean(b) => Some(ConstantValue::Boolean(*b)),
                            _ => None,
                        })
                        .collect_vec(),
                ),
                _ => None,
            })
            .unwrap_or(vec![]);

        TypgenTypeOverride {
            name,
            path,
            generic_arguments,
            is_union,
        }
    }
}
