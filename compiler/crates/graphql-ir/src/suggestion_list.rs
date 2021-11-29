/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use schema::{SDLSchema, Schema, Type};
use strsim::damerau_levenshtein;

/// Computes the lexical distance between strings A and B.
///
/// The "distance" between two strings is given by counting the minimum number
/// of edits needed to transform string A into string B. An edit can be an
/// insertion, deletion, or substitution of a single character, or a swap of two
/// adjacent characters.
///
/// Includes a custom alteration from Damerau-Levenshtein to treat case changes
/// as a single edit which helps identify mis-cased values with an edit distance
/// of 1.
///
/// This distance can be useful for detecting typos in input or sorting
struct LexicalDistance<'a> {
    input: &'a str,
    input_lower_case: String,
}

impl<'a> LexicalDistance<'a> {
    pub fn new(input: &'a str) -> Self {
        Self {
            input,
            input_lower_case: input.to_lowercase(),
        }
    }

    pub fn measure(&self, option: &str, threshold: usize) -> Option<usize> {
        if self.input == option {
            return Some(0);
        }

        let option_lower_case = option.to_lowercase();

        // Any case change counts as a single edit
        if self.input_lower_case == option_lower_case {
            return Some(1);
        }

        let distance = damerau_levenshtein(self.input, option);
        if distance <= threshold {
            Some(distance)
        } else {
            None
        }
    }
}

/// Generate the list of the suggested values that are closest to the `input`
fn suggestion_list(input: StringKey, options: &[StringKey], limit: usize) -> Vec<StringKey> {
    let lexical_distance = LexicalDistance::new(input.lookup());

    // This is from graphql-js (https://github.com/graphql/graphql-js/commit/4c10844f6f2ab3e2993d8d5f5f3ed97dce9d3655)
    // The original idea is from TypeScript: https://github.com/microsoft/TypeScript/blob/afddaf090ad8e3a4d3501ce91490b5552d1e4a42/src/compiler/core.ts#L1752
    let threshold = (input.lookup().len() as f32 * 0.4).floor() + 1.0;

    let mut options_with_distance: Vec<(StringKey, usize)> = options
        .iter()
        .filter_map(|option| {
            let distance = lexical_distance.measure(option.lookup(), threshold as usize)?;
            Some((*option, distance))
        })
        .collect();

    options_with_distance.sort_by(|(str_a, distance_a), (str_b, distance_b)| {
        if distance_a == distance_b {
            str_a.lookup().cmp(str_b.lookup())
        } else {
            distance_a.cmp(distance_b)
        }
    });

    options_with_distance
        .iter()
        .take(limit)
        .map(|(value, _)| *value)
        .collect::<Vec<StringKey>>()
}

pub struct GraphQLSuggestions<'schema> {
    schema: &'schema SDLSchema,
    enabled: bool,
}

impl<'schema> GraphQLSuggestions<'schema> {
    const MAX_SUGGESTIONS: usize = 5;

    pub fn new(schema: &'schema SDLSchema) -> Self {
        // If the schema is flatten schema, at this time, we need to temporary disable
        // the GraphQLSuggestions as `get_type_map` in flattenn schema is not yet implemented.
        let enabled = !matches!(schema, SDLSchema::FlatBuffer(_));

        Self { schema, enabled }
    }

    pub fn input_type_suggestions(&self, input: StringKey) -> Vec<StringKey> {
        if !self.enabled {
            return Vec::new();
        }

        let input_types = self
            .schema
            .get_type_map()
            .filter_map(|(type_name, type_)| {
                if type_.is_input_type() {
                    Some(*type_name)
                } else {
                    None
                }
            })
            .collect::<Vec<StringKey>>();

        suggestion_list(input, &input_types, GraphQLSuggestions::MAX_SUGGESTIONS)
    }

    pub fn output_type_suggestions(&self, input: StringKey) -> Vec<StringKey> {
        if !self.enabled {
            return Vec::new();
        }

        let type_names = self
            .schema
            .get_type_map()
            .filter_map(|(type_name, type_)| {
                if !type_.is_input_object() {
                    Some(*type_name)
                } else {
                    None
                }
            })
            .collect::<Vec<StringKey>>();

        suggestion_list(input, &type_names, GraphQLSuggestions::MAX_SUGGESTIONS)
    }

    pub fn composite_type_suggestions(&self, input: StringKey) -> Vec<StringKey> {
        if !self.enabled {
            return Vec::new();
        }

        let type_names = self
            .schema
            .get_type_map()
            .filter_map(|(type_name, type_)| {
                if type_.is_composite_type() {
                    Some(*type_name)
                } else {
                    None
                }
            })
            .collect::<Vec<StringKey>>();

        suggestion_list(input, &type_names, GraphQLSuggestions::MAX_SUGGESTIONS)
    }

    pub fn field_name_suggestion(&self, type_: Option<Type>, input: StringKey) -> Vec<StringKey> {
        if !self.enabled {
            return Vec::new();
        }

        let field_names: Vec<StringKey> = match type_ {
            Some(Type::Object(object_id)) => self
                .schema
                .object(object_id)
                .fields
                .iter()
                .map(|field_id| self.schema.field(*field_id).name.item)
                .collect(),
            Some(Type::Interface(interface_id)) => self
                .schema
                .interface(interface_id)
                .fields
                .iter()
                .map(|field_id| self.schema.field(*field_id).name.item)
                .collect(),
            Some(Type::InputObject(input_id)) => self
                .schema
                .input_object(input_id)
                .fields
                .iter()
                .map(|arg| arg.name)
                .collect(),
            _ => vec![],
        };

        suggestion_list(input, &field_names, GraphQLSuggestions::MAX_SUGGESTIONS)
    }
}
#[cfg(test)]
mod tests {
    use super::suggestion_list;
    use intern::string_key::Intern;

    #[test]
    fn test_suggestion_list_empty_input() {
        assert_eq!(
            suggestion_list("".intern(), &["a".intern()], 5),
            vec!["a".intern()]
        );
    }

    #[test]
    fn test_suggestion_no_options() {
        assert_eq!(suggestion_list("a".intern(), &[], 5), vec![]);
    }

    #[test]
    fn test_suggestion_small_lexical_distance() {
        assert_eq!(
            suggestion_list("greenish".intern(), &["green".intern()], 5),
            vec!["green".intern()]
        );
        assert_eq!(
            suggestion_list("green".intern(), &["greenish".intern()], 5),
            vec!["greenish".intern()]
        );
    }

    #[test]
    fn test_suggestion_reject_objects_with_long_distance() {
        assert_eq!(
            suggestion_list("aaaa".intern(), &["aaab".intern()], 5),
            vec!["aaab".intern()]
        );
        assert_eq!(
            suggestion_list("aaaa".intern(), &["aabb".intern()], 5),
            vec!["aabb".intern()]
        );
        assert_eq!(
            suggestion_list("aaaa".intern(), &["abbb".intern()], 5),
            vec![]
        );
        assert_eq!(suggestion_list("ab".intern(), &["ca".intern()], 5), vec![]);
    }

    #[test]
    fn test_suggestion_different_case() {
        assert_eq!(
            suggestion_list("verylongstring".intern(), &["VERYLONGSTRING".intern()], 5),
            vec!["VERYLONGSTRING".intern()]
        );
        assert_eq!(
            suggestion_list("VERYLONGSTRING".intern(), &["verylongstring".intern()], 5),
            vec!["verylongstring".intern()]
        );
        assert_eq!(
            suggestion_list("VERYLONGSTRING".intern(), &["VeryLongString".intern()], 5),
            vec!["VeryLongString".intern()]
        );
    }

    #[test]
    fn test_suggestion_with_transpositions() {
        assert_eq!(
            suggestion_list("agr".intern(), &["arg".intern()], 5),
            vec!["arg".intern()]
        );
        assert_eq!(
            suggestion_list("214365879".intern(), &["123456789".intern()], 5),
            vec!["123456789".intern()]
        );
    }

    #[test]
    fn test_suggestion_sorted() {
        assert_eq!(
            suggestion_list(
                "abc".intern(),
                &["a".intern(), "ab".intern(), "abc".intern()],
                5
            ),
            vec!["abc".intern(), "ab".intern(), "a".intern()]
        );

        assert_eq!(
            suggestion_list(
                "a".intern(),
                &["az".intern(), "ax".intern(), "ay".intern()],
                5
            ),
            vec!["ax".intern(), "ay".intern(), "az".intern()]
        );
    }

    #[test]
    fn test_suggestions_with_user() {
        assert_eq!(
            suggestion_list(
                "Users".intern(),
                &["User".intern(), "Query".intern(), "Mutation".intern()],
                5
            ),
            vec!["User".intern(), "Query".intern()]
        );
    }
}
