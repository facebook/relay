use relay_compiler::config::ConfigFile;
use schemars::schema_for;

fn main() {
    let schema = schema_for!(ConfigFile);
    println!("{}", serde_json::to_string_pretty(&schema).unwrap());
}
