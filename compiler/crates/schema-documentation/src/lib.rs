/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;

use serde::Deserialize;
use serde_json::Value;

#[derive(Default, Deserialize)]
pub struct SchemaDocumentationJsonSource {
    types: Vec<TypeDescription>,
}

impl SchemaDocumentationJsonSource {
    pub fn create_from_json_value(value: Value) -> Result<Self, String> {
        serde_json::from_value(value)
            .map_err(|err| format!("Unable to create SchemaDocumentationJsonSource: {}", err))
    }
}

#[derive(Debug, Deserialize)]
pub struct TypeDescription {
    name: String,
    description: Option<String>,
    fields: Option<Vec<FieldDescription>>,
}

#[derive(Debug, Deserialize)]
pub struct FieldDescription {
    name: String,
    description: Option<String>,
    args: Option<Vec<ArgDescription>>,
}

#[derive(Debug, Deserialize)]
pub struct ArgDescription {
    name: String,
    description: Option<String>,
}

pub struct SchemaDocumentation {
    types: HashMap<String, TypeDescription>,
}

impl Default for SchemaDocumentation {
    fn default() -> Self {
        Self {
            types: Default::default(),
        }
    }
}

impl From<SchemaDocumentationJsonSource> for SchemaDocumentation {
    fn from(source: SchemaDocumentationJsonSource) -> Self {
        let mut type_name = HashMap::default();
        for type_ in source.types {
            let key = type_.name.clone();
            type_name.insert(key, type_);
        }

        SchemaDocumentation { types: type_name }
    }
}

impl SchemaDocumentation {
    fn get_field(&self, type_name: &str, field_name: &str) -> Option<&FieldDescription> {
        let type_ = self.types.get(type_name)?;
        for field in type_.fields.as_ref()? {
            if field.name == field_name {
                return Some(field);
            }
        }

        None
    }

    pub fn get_type_description(&self, type_name: &str) -> Option<&str> {
        let type_ = self.types.get(type_name)?;

        type_
            .description
            .as_ref()
            .map(|description| description.as_ref())
    }

    pub fn get_field_description(&self, type_name: &str, field_name: &str) -> Option<&str> {
        let field = self.get_field(type_name, field_name)?;

        field
            .description
            .as_ref()
            .map(|description| description.as_ref())
    }

    pub fn get_field_arg_description(
        &self,
        type_name: &str,
        field_name: &str,
        arg_name: &str,
    ) -> Option<&str> {
        let field = self.get_field(type_name, field_name)?;

        for arg in field.args.as_ref()? {
            if arg_name == arg.name {
                return arg
                    .description
                    .as_ref()
                    .map(|description| description.as_ref());
            }
        }

        None
    }
}

#[cfg(test)]
mod tests {
    use super::SchemaDocumentation;
    use super::SchemaDocumentationJsonSource;
    use serde_json::{json, Value};

    fn create_docs() -> SchemaDocumentation {
        let source_value: Value = json!({
            "types": [
                {
                    "name": "Node",
                    "description": "Object with ID",
                    "fields": [
                        {
                            "name": "id",
                            "description": "Object ID",
                            "args": [],
                        },
                    ],
                },
                {
                    "name": "NoDescriptionType",
                    "description": null,
                },
                {
                    "name": "User",
                    "description": "Object with ID",
                    "fields": [
                        {
                            "name": "id",
                            "description": "Object ID",
                            "args": [],
                        },
                        {
                            "name": "name",
                            "description": "User name",
                            "args": [{
                                "name": "show_fill_name",
                                "description": "Show user's full name",
                            }, {
                                "name": "translate_name",
                            }],
                        },

                    ],
                },
            ],
        });
        let source = SchemaDocumentationJsonSource::create_from_json_value(source_value).unwrap();
        SchemaDocumentation::from(source)
    }

    #[test]
    fn test_get_type_description() {
        let docs = create_docs();
        assert_eq!(docs.get_type_description("Node"), Some("Object with ID"));
    }
    #[test]
    fn test_get_type_description_unknown() {
        let docs = create_docs();
        assert_eq!(docs.get_type_description("UnknownType"), None);
    }
    #[test]
    fn test_get_type_description_none() {
        let docs = create_docs();
        assert_eq!(docs.get_type_description("NoDescriptionType"), None);
    }

    #[test]
    fn test_get_field_description() {
        let docs = create_docs();
        assert_eq!(docs.get_field_description("Node", "id"), Some("Object ID"));
    }

    #[test]
    fn test_get_field_description_unknown() {
        let docs = create_docs();
        assert_eq!(docs.get_field_description("Unknown", "id"), None);
    }

    #[test]
    fn test_get_field_description_none() {
        let docs = create_docs();
        assert_eq!(docs.get_field_description("Node", "name"), None);
    }

    #[test]
    fn test_get_arg_description() {
        let docs = create_docs();
        assert_eq!(
            docs.get_field_arg_description("User", "name", "show_fill_name"),
            Some("Show user's full name")
        );
    }

    #[test]
    fn test_get_arg_description_none() {
        let docs = create_docs();
        assert_eq!(
            docs.get_field_arg_description("User", "name", "translate_name"),
            None
        );
    }

    #[test]
    fn test_get_arg_description_unknown_type() {
        let docs = create_docs();
        assert_eq!(
            docs.get_field_arg_description("UnknownType", "name", "translate_name"),
            None
        );
    }

    #[test]
    fn test_get_arg_description_unknown_filed() {
        let docs = create_docs();
        assert_eq!(
            docs.get_field_arg_description("User", "profile_picture", "scale"),
            None
        );
    }

    #[test]
    fn test_get_arg_description_non_existing_arg() {
        let docs = create_docs();
        assert_eq!(
            docs.get_field_arg_description("None", "id", "non_existing"),
            None
        );
    }

    #[test]
    fn test_get_arg_description_unknown_agg() {
        let docs = create_docs();
        assert_eq!(
            docs.get_field_arg_description("User", "name", "unknown_arg"),
            None
        );
    }
}
