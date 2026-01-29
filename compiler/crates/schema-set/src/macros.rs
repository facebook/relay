/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#[macro_export]
macro_rules! impl_traits {
  ($struct_name:ident, $( $macro_name:tt ),+) => {
      $( $macro_name!($struct_name); )+
  }
}

#[macro_export]
macro_rules! impl_string_key_named_with_location {
    ($named:ident) => {
        impl StringKeyNamed for $named {
            fn string_key_name(&self) -> StringKey {
                self.name.0
            }
        }
    };
}

#[macro_export]
macro_rules! impl_string_key_named_raw {
    ($named:ident) => {
        impl StringKeyNamed for $named {
            fn string_key_name(&self) -> StringKey {
                self.name
            }
        }
    };
}

#[macro_export]
macro_rules! impl_can_be_client_definition {
    ($named:ident) => {
        impl CanBeClientDefinition for $named {
            fn is_client_definition(&self) -> bool {
                self.definition.is_none() || self.definition.as_ref().unwrap().is_client_definition
            }
            fn set_is_client_definition(&mut self, is_client_definition: bool) {
                if let Some(def) = &mut self.definition {
                    def.is_client_definition = is_client_definition;
                } else {
                    self.definition = Some(SchemaDefinitionItem {
                        name: WithLocation::generated(self.name.0),
                        is_client_definition,
                        description: None,
                        hack_source: None,
                    });
                }
            }
        }
    };
}

#[macro_export]
macro_rules! impl_can_have_directives {
    ($named:ident) => {
        impl CanHaveDirectives for $named {
            fn directives(&self) -> &Vec<DirectiveValue> {
                &self.directives
            }
            fn directives_mut(&mut self) -> &mut Vec<DirectiveValue> {
                &mut self.directives
            }
            fn set_directives(&mut self, directives: Vec<DirectiveValue>) {
                self.directives = directives
            }
        }
    };
}

#[macro_export]
macro_rules! impl_has_fields {
    ($named:ident) => {
        impl HasFields for $named {
            fn fields(&self) -> &StringKeyMap<SetField> {
                &self.fields
            }
            fn fields_mut(&mut self) -> &mut StringKeyMap<SetField> {
                &mut self.fields
            }
            fn set_fields(&mut self, fields: StringKeyMap<SetField>) {
                self.fields = fields
            }
        }
    };
}

#[macro_export]
macro_rules! impl_has_interfaces {
    ($named:ident) => {
        impl HasInterfaces for $named {
            fn interfaces(&self) -> &StringKeyIndexMap<SetMemberType> {
                &self.interfaces
            }
            fn interfaces_mut(&mut self) -> &mut StringKeyIndexMap<SetMemberType> {
                &mut self.interfaces
            }
            fn set_interfaces(&mut self, interfaces: StringKeyIndexMap<SetMemberType>) {
                self.interfaces = interfaces
            }
        }
    };
}

#[macro_export]
macro_rules! impl_has_arguments {
    ($named:ident) => {
        impl HasArguments for $named {
            fn arguments(&self) -> &StringKeyIndexMap<SetArgument> {
                &self.arguments
            }
            fn arguments_mut(&mut self) -> &mut StringKeyIndexMap<SetArgument> {
                &mut self.arguments
            }
        }
    };
}

#[macro_export]
macro_rules! impl_has_description {
    ($named:ident) => {
        impl HasDescription for $named {
            fn description(&self) -> Option<StringKey> {
                self.definition.as_ref().and_then(|d| d.description)
            }
        }
    };
}

#[macro_export]
macro_rules! one_partition {
    ($field:ident) => {
        let (base_$field, extension_$field) = self.partition_extension_$field(used_schema)
    };
}

#[macro_export]
macro_rules! clone_base {
    ($( $field:ident ),+) => {
        let base = Self {
            $(
                $field: base_$field,
            )+
            ..self.clone()
        };
    }
}

#[macro_export]
macro_rules! impl_partitions_only_directives {
    ($named:ident ) => {
        impl PartitionsBaseExtension for $named {
            fn partition_base_extension(&self, schema_set: &SchemaSet) -> (Self, Option<Self>) {
                let (base_directives, extension_directives) =
                    self.partition_extension_directives(schema_set);

                let base = Self {
                    directives: base_directives,
                    ..self.clone()
                };

                let extension = if extension_directives.is_empty() {
                    None
                } else {
                    Some(Self {
                        directives: extension_directives,
                        ..self.clone()
                    })
                };
                (base, extension)
            }
        }
    };
}
