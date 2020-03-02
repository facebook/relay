/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_codegen_ast::{build_fragment, build_operation};
use graphql_ir::{ExecutableDefinition, FragmentDefinition, OperationDefinition};
use schema::Schema;
use serde_json::Value as SerdeValue;
use std::fmt::{Error as FmtError, Result as FmtResult, Write};

const TAB_SIZE: usize = 2;

pub fn print_json(schema: &Schema, definition: &ExecutableDefinition) -> String {
    match definition {
        ExecutableDefinition::Operation(operation) => print_operation(schema, operation),
        ExecutableDefinition::Fragment(fragment) => print_fragment(schema, fragment),
    }
}

pub fn print_fragment(schema: &Schema, fragment: &FragmentDefinition) -> String {
    let ast = build_fragment(schema, fragment);
    serde_json::to_string_pretty(&ast).unwrap()
}

pub fn print_operation(schema: &Schema, operation: &OperationDefinition) -> String {
    // TODO build a concrete request instead of just a normalization ast
    let ast = build_operation(schema, operation);
    serde_json::to_string_pretty(&ast).unwrap()
}

pub fn print_json_deduped(schema: &Schema, definition: &ExecutableDefinition) -> String {
    let json_value = match definition {
        ExecutableDefinition::Operation(operation) => {
            // TODO build a concrete request instead of just a normalization ast
            build_operation(schema, operation)
        }
        ExecutableDefinition::Fragment(fragment) => build_fragment(schema, fragment),
    };
    let mut result = String::new();
    let mut printer = DedupedJSONPrinter::new();
    printer
        .print(&mut result, &serde_json::to_value(&json_value).unwrap())
        .unwrap();
    result
}

#[derive(Debug)]
struct SerdeValueRefEquality<'json>(&'json SerdeValue);

impl<'json> std::hash::Hash for SerdeValueRefEquality<'json> {
    fn hash<H>(&self, state: &mut H)
    where
        H: std::hash::Hasher,
    {
        (self.0 as *const SerdeValue).hash(state)
    }
}

impl<'json> Eq for SerdeValueRefEquality<'json> {}

impl<'json> PartialEq<SerdeValueRefEquality<'json>> for SerdeValueRefEquality<'json> {
    fn eq(&self, other: &SerdeValueRefEquality<'json>) -> bool {
        self.0 as *const SerdeValue == other.0 as *const SerdeValue
    }
}

struct DedupedJSONPrinter<'json> {
    var_defs_count: usize,
    value_states_by_hash: std::collections::HashMap<String, (usize, Option<String>)>,
    value_hashes_by_value: std::collections::HashMap<SerdeValueRefEquality<'json>, String>,
}

enum VarDefPrintResult {
    Printed,
    Skipped,
    None,
}

#[allow(dead_code)]
impl<'json> DedupedJSONPrinter<'json> {
    fn new() -> Self {
        Self {
            var_defs_count: 0,
            value_states_by_hash: Default::default(),
            value_hashes_by_value: Default::default(),
        }
    }

    fn print<W: Write>(&mut self, dest_buffer: &mut W, json_value: &'json SerdeValue) -> FmtResult {
        self.collect_value_identities(json_value)?;
        self.collect_value_duplicates(json_value);

        // TODO print properly formatted var defs
        self.print_js_vars(dest_buffer, json_value, true)?;
        self.print_js_json(dest_buffer, json_value, 0, false)?;

        Ok(())
    }

    fn collect_value_identities(
        &mut self,
        json_value: &'json SerdeValue,
    ) -> Result<String, FmtError> {
        Ok(match json_value {
            SerdeValue::Array(array) => {
                if array.is_empty() {
                    return Ok(serde_json::to_string(json_value).unwrap());
                }
                let mut hash = String::from("[");
                for val in array.iter() {
                    write!(hash, "{},", self.collect_value_identities(val)?)?;
                }
                write!(hash, "]")?;
                self.value_hashes_by_value
                    .insert(SerdeValueRefEquality(json_value), hash.clone());
                hash
            }
            SerdeValue::Object(object) => {
                if object.is_empty() {
                    return Ok(serde_json::to_string(json_value).unwrap());
                }
                let mut hash = String::from("{");
                for (key, val) in object.iter() {
                    write!(hash, "{}: {},", key, self.collect_value_identities(val)?)?;
                }
                write!(hash, "}}")?;

                self.value_hashes_by_value
                    .insert(SerdeValueRefEquality(json_value), hash.clone());
                hash
            }
            SerdeValue::Bool(_) => serde_json::to_string(json_value).unwrap(),
            SerdeValue::Number(_) => serde_json::to_string(json_value).unwrap(),
            SerdeValue::String(_) => serde_json::to_string(json_value).unwrap(),
            SerdeValue::Null => serde_json::to_string(json_value).unwrap(),
        })
    }

    fn collect_value_duplicates(&mut self, json_value: &'json SerdeValue) {
        match json_value {
            SerdeValue::Array(array) => {
                if array.is_empty() {
                    return;
                }
                if let Some(hash) = self
                    .value_hashes_by_value
                    .get(&SerdeValueRefEquality(json_value))
                {
                    let state = self
                        .value_states_by_hash
                        .entry(hash.clone())
                        .and_modify(|state| state.0 += 1)
                        .or_insert((1, None));

                    if state.0 > 1 {
                        return;
                    }
                    for val in array.iter() {
                        self.collect_value_duplicates(val);
                    }
                }
            }
            SerdeValue::Object(object) => {
                if object.is_empty() {
                    return;
                }
                if let Some(hash) = self
                    .value_hashes_by_value
                    .get(&SerdeValueRefEquality(json_value))
                {
                    let state = self
                        .value_states_by_hash
                        .entry(hash.clone())
                        .and_modify(|state| state.0 += 1)
                        .or_insert((1, None));

                    if state.0 > 1 {
                        return;
                    }
                    for (_, val) in object.iter() {
                        self.collect_value_duplicates(val);
                    }
                }
            }
            _ => {}
        }
    }

    fn print_js_vars<W: Write>(
        &mut self,
        dest_buffer: &mut W,
        json_value: &'json SerdeValue,
        is_root: bool,
    ) -> FmtResult {
        match json_value {
            SerdeValue::Array(array) => {
                match self.maybe_print_var_def(dest_buffer, json_value, is_root)? {
                    VarDefPrintResult::Printed => writeln!(dest_buffer, ","),
                    VarDefPrintResult::Skipped => Ok(()),
                    VarDefPrintResult::None => {
                        for val in array.iter() {
                            self.print_js_vars(dest_buffer, val, false)?;
                        }
                        Ok(())
                    }
                }
            }
            SerdeValue::Object(object) => {
                match self.maybe_print_var_def(dest_buffer, json_value, is_root)? {
                    VarDefPrintResult::Printed => writeln!(dest_buffer, ","),
                    VarDefPrintResult::Skipped => Ok(()),
                    VarDefPrintResult::None => {
                        for (_key, val) in object.iter() {
                            self.print_js_vars(dest_buffer, val, false)?;
                        }
                        Ok(())
                    }
                }
            }
            _ => Ok(()),
        }
    }

    fn maybe_print_var_def<W: Write>(
        &mut self,
        dest_buffer: &mut W,
        json_value: &'json SerdeValue,
        is_root: bool,
    ) -> Result<VarDefPrintResult, FmtError> {
        if is_root {
            // Do not consider duplicates at the top level
            return Ok(VarDefPrintResult::None);
        }

        if let Some(hash) = self
            .value_hashes_by_value
            .get(&SerdeValueRefEquality(json_value))
        {
            // A value is only considered duplicate if it has been
            // referenced more than once in the value tree
            let hash = hash.clone();
            let (ref_count, var_name) = self.lookup_value_state(&hash);
            if ref_count > 1 {
                if var_name.is_some() {
                    // Return a result indicating that we've already printed this variable definition
                    return Ok(VarDefPrintResult::Skipped);
                }

                // Recursively extract any var defs within the contents for the current variable definition.
                self.print_js_vars(dest_buffer, json_value, true)?;

                // Print the contents of the variable definition
                let var_name = format!("v{}", self.var_defs_count);
                write!(
                    dest_buffer,
                    "{}{} = ",
                    if self.var_defs_count == 0 { "var " } else { "" },
                    var_name.clone()
                )?;
                self.print_js_json(dest_buffer, json_value, 0, true)?;

                // Construct the var name and set it on the value state for json values to refer to
                // this var during actual json printing.
                self.var_defs_count += 1;
                self.value_states_by_hash
                    .entry(hash)
                    .and_modify(|state| state.1 = Some(var_name.clone()))
                    .or_insert_with(|| {
                        unreachable!("Expected deduplication state to exist for JSON value.")
                    });

                // Return a result indicating that we printed the variable definition
                return Ok(VarDefPrintResult::Printed);
            }
        }

        // Otherwise, return a result indicating that we did not
        // print the value as a duplicate
        Ok(VarDefPrintResult::None)
    }

    fn print_js_json<W: Write>(
        &mut self,
        dest_buffer: &mut W,
        json_value: &'json SerdeValue,
        depth: usize,
        is_var_def: bool,
    ) -> FmtResult {
        match json_value {
            SerdeValue::Array(array) => {
                if self
                    .maybe_print_dupe_value(dest_buffer, json_value, depth, is_var_def)?
                    .is_some()
                {
                    Ok(())
                } else if array.is_empty() {
                    if is_var_def {
                        // Empty arrays can only have one inferred flow type and then conflict if
                        // used in different places, this is unsound if we would write to them but
                        // this whole module is based on the idea of a read only JSON tree.
                        write!(dest_buffer, "([]/*: any*/)")
                    } else {
                        write!(dest_buffer, "[]")
                    }
                } else {
                    writeln!(dest_buffer, "[")?;
                    let len = array.len();
                    for (i, val) in array.iter().enumerate() {
                        let next_depth = depth + 1;
                        self.print_indentation(dest_buffer, next_depth)?;
                        self.print_js_json(dest_buffer, val, next_depth, is_var_def)?;

                        if i != len - 1 {
                            write!(dest_buffer, ",")?;
                        }
                        writeln!(dest_buffer)?;
                    }
                    self.print_indentation(dest_buffer, depth)?;
                    write!(dest_buffer, "]")
                }
            }
            SerdeValue::Object(object) => {
                if self
                    .maybe_print_dupe_value(dest_buffer, json_value, depth, is_var_def)?
                    .is_some()
                {
                    Ok(())
                } else if object.is_empty() {
                    write!(dest_buffer, "{{}}")
                } else {
                    writeln!(dest_buffer, "{{")?;
                    let len = object.len();
                    for (i, (key, val)) in object.iter().enumerate() {
                        let next_depth = depth + 1;
                        self.print_indentation(dest_buffer, next_depth)?;
                        write!(dest_buffer, "{}: ", serde_json::to_string(key).unwrap())?;
                        self.print_js_json(dest_buffer, val, next_depth, is_var_def)?;

                        if i != len - 1 {
                            write!(dest_buffer, ",")?;
                        }
                        writeln!(dest_buffer)?;
                    }
                    self.print_indentation(dest_buffer, depth)?;
                    write!(dest_buffer, "}}")
                }
            }
            SerdeValue::Bool(_) => write!(
                dest_buffer,
                "{}",
                serde_json::to_string(json_value).unwrap()
            ),
            SerdeValue::Number(_) => write!(
                dest_buffer,
                "{}",
                serde_json::to_string(json_value).unwrap()
            ),
            SerdeValue::String(_) => write!(
                dest_buffer,
                "{}",
                serde_json::to_string(json_value).unwrap()
            ),
            SerdeValue::Null => write!(
                dest_buffer,
                "{}",
                serde_json::to_string(json_value).unwrap()
            ),
        }
    }

    fn maybe_print_dupe_value<W: Write>(
        &mut self,
        dest_buffer: &mut W,
        json_value: &'json SerdeValue,
        depth: usize,
        _is_var_def: bool,
    ) -> Result<Option<()>, FmtError> {
        if depth == 0 {
            // Do not consider duplicates at the top level
            return Ok(None);
        }

        if let Some(hash) = self
            .value_hashes_by_value
            .get(&SerdeValueRefEquality(json_value))
        {
            // A value is only considered duplicate if it has been
            // referenced more than once in the value tree
            let hash = hash.clone();
            let (ref_count, var_name) = self.lookup_value_state(&hash);
            if ref_count > 1 {
                if let Some(var_name) = var_name {
                    // We expect a variable definition to already be associated with the
                    // duplicate value, so we only need to  print a reference to the var def
                    // instead of printing actual json.
                    write!(dest_buffer, "({}/*: any*/)", var_name)?;
                } else {
                    unreachable!(
                        "Expected to have previously defined var def for duplicate JSON value {}.",
                        hash
                    );
                }

                // Return a result indicating that we printed
                // the value as a duplicate
                return Ok(Some(()));
            }
        }

        // Otherwise, return a result indicating that we did not
        // print the value as a duplicate
        Ok(None)
    }

    fn lookup_value_state(&self, hash: &str) -> (usize, Option<String>) {
        match self.value_states_by_hash.get(hash) {
            Some((ref_count, var_name)) => (*ref_count, var_name.clone()),
            None => unreachable!("Expected ref count to exist"),
        }
    }

    fn print_indentation<W: Write>(&mut self, dest_buffer: &mut W, depth: usize) -> FmtResult {
        let indent_count = depth * TAB_SIZE;
        for _ in 0..indent_count {
            write!(dest_buffer, " ")?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    mod print_json_deduped_tests {
        use super::*;
        use serde_json::json;

        fn print_test_json(json_value: SerdeValue) -> String {
            let mut result = String::new();
            let mut printer = DedupedJSONPrinter::new();
            printer
                .print(&mut result, &serde_json::to_value(&json_value).unwrap())
                .unwrap();
            result
        }

        #[test]
        fn test_scalars() {
            assert_eq!(r#"false"#, print_test_json(json!(false)));
            assert_eq!(r#"null"#, print_test_json(json!(null)));
            assert_eq!(r#"1"#, print_test_json(json!(1)));
            assert_eq!(r#""string""#, print_test_json(json!("string")));
        }

        #[test]
        fn test_object_without_duplicates() {
            let data = json!({
                "key1": "val2",
                "key2": "val2",
            });
            let expected = r#"
{
  "key1": "val2",
  "key2": "val2"
}
            "#
            .trim();
            assert_eq!(expected, print_test_json(data));
        }

        #[test]
        fn test_arrays_without_duplicates() {
            let data = json!([1, 2, "x", null]);
            let expected = r#"
[
  1,
  2,
  "x",
  null
]
            "#
            .trim();
            assert_eq!(expected, print_test_json(data));
        }

        #[test]
        fn test_empty_arrays() {
            let data = json!(
              {"args": [], "values": [], "dupe1": {"key": []}, "dupe2": {"key": []}}
            );
            let expected = r#"
var v0 = {
  "key": ([]/*: any*/)
},
{
  "args": [],
  "dupe1": (v0/*: any*/),
  "dupe2": (v0/*: any*/),
  "values": []
}
            "#
            .trim();
            assert_eq!(expected, print_test_json(data));
        }

        #[test]
        fn test_extract_duplicates() {
            let data = json!(
              [1, {"name": "id"}, {"friend": [{"name": "id"}]}]
            );
            let expected = r#"
var v0 = {
  "name": "id"
},
[
  1,
  (v0/*: any*/),
  {
    "friend": [
      (v0/*: any*/)
    ]
  }
]
            "#
            .trim();
            assert_eq!(expected, print_test_json(data));
        }

        #[test]
        fn test_extract_identical_references() {
            let obj = json!({"name": "id"});
            let data = json!([obj, obj]);
            let expected = r#"
var v0 = {
  "name": "id"
},
[
  (v0/*: any*/),
  (v0/*: any*/)
]
            "#
            .trim();
            assert_eq!(expected, print_test_json(data));
        }

        #[test]
        fn test_extract_recursive_duplicates() {
            let data = json!([
              {"name": "id", "alias": null},
              {"name": "id", "alias": null},
              [{"name": "id"}, {"name": "id", "alias": "other"}],
              [{"name": "id"}, {"name": "id", "alias": "other"}],
              [{"name": "id", "alias": "other"}],
            ]);
            let expected = r#"
var v0 = {
  "alias": null,
  "name": "id"
},
v1 = {
  "alias": "other",
  "name": "id"
},
v2 = [
  {
    "name": "id"
  },
  (v1/*: any*/)
],
[
  (v0/*: any*/),
  (v0/*: any*/),
  (v2/*: any*/),
  (v2/*: any*/),
  [
    (v1/*: any*/)
  ]
]
            "#
            .trim();
            assert_eq!(expected, print_test_json(data));
        }
    }
}
