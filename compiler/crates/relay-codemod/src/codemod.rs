/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use std::vec;

use clap::Args;
use clap::Subcommand;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlag;
use common::Rollout;
use common::RolloutRange;
use log::info;
use lsp_types::CodeActionOrCommand;
use lsp_types::TextEdit;
use lsp_types::Uri;
use relay_compiler::errors::BuildProjectError;
use relay_compiler::errors::Error as CompilerError;
use relay_compiler::errors::Result as CompilerResult;
use relay_transforms::Programs;
use relay_transforms::disallow_required_on_non_null_field;
use relay_transforms::fragment_alias_directive;

#[derive(Subcommand, Debug, Clone)]
pub enum AvailableCodemod {
    /// Marks unaliased conditional fragment spreads as @dangerously_unaliased_fixme
    MarkDangerousConditionalFragmentSpreads(MarkDangerousConditionalFragmentSpreadsArgs),

    /// Removes @required directives from non-null fields within @throwOnFieldError fragments and operations.
    RemoveUnnecessaryRequiredDirectives,

    /// Runs all Relay compiler transforms and fixes all fixable diagnostics
    FixAll,
}

#[derive(Args, Debug, Clone)]
pub struct MarkDangerousConditionalFragmentSpreadsArgs {
    /// Specify a percentage of fragments to codemod. If a number is provided,
    /// the first n percentage of fragments will be codemodded. If a range (`20-30`) is
    /// provided, then fragments between the start and end of the range will be codemodded.
    #[clap(long, short, value_parser=valid_percent, default_value = "100")]
    pub rollout_percentage: FeatureFlag,
}

pub async fn run_codemod(
    programs: CompilerResult<Vec<Arc<Programs>>>,
    root_dir: PathBuf,
    codemod: AvailableCodemod,
) -> Result<(), std::io::Error> {
    match &codemod {
        AvailableCodemod::MarkDangerousConditionalFragmentSpreads(opts) => {
            run_codemod_impl(
                programs.expect("Failed to build programs"),
                root_dir,
                |programs: &Arc<Programs>| {
                    fragment_alias_directive(&programs.source, &opts.rollout_percentage).map(|_| ())
                }, // Codemods don't return anything for OK,
                format!("{codemod:?}").as_str(),
            )
            .await
        }
        AvailableCodemod::RemoveUnnecessaryRequiredDirectives => {
            run_codemod_impl(
                programs.expect("Failed to build programs"),
                root_dir,
                |programs: &Arc<Programs>| disallow_required_on_non_null_field(&programs.reader),
                format!("{codemod:?}").as_str(),
            )
            .await
        }
        AvailableCodemod::FixAll => {
            match programs {
                Ok(_programs) => {
                    // Noop
                    Ok(())
                }
                Err(error) => {
                    let diagnostics = as_diagnostics(error);
                    fix_diagnostics("FixAll", &root_dir, &diagnostics)
                }
            }
        }
    }
}

fn as_diagnostics(error: CompilerError) -> Vec<Diagnostic> {
    match error {
        CompilerError::DiagnosticsError { errors } => errors,
        CompilerError::BuildProjectsErrors { errors } => errors
            .into_iter()
            .flat_map(|e| match e {
                BuildProjectError::ValidationErrors { errors, .. } => errors,
                _ => vec![],
            })
            .collect(),
        _ => vec![],
    }
}

pub async fn run_codemod_impl(
    programs: Vec<Arc<Programs>>,
    root_dir: PathBuf,
    f: impl Fn(&Arc<Programs>) -> DiagnosticsResult<()>,
    codemod: &str,
) -> Result<(), std::io::Error> {
    let diagnostics = programs
        .iter()
        .flat_map(|programs| {
            let result = f(programs);
            match result {
                Ok(_) => vec![],
                Err(e) => e,
            }
        })
        .collect::<Vec<_>>();

    fix_diagnostics(codemod, &root_dir, &diagnostics)
}

pub fn fix_diagnostics(
    codemod: &str,
    root_dir: &Path,
    diagnostics: &[Diagnostic],
) -> Result<(), std::io::Error> {
    let actions = relay_lsp::diagnostics_to_code_actions(root_dir, diagnostics);

    info!(
        "Codemod {:?} ran and found {} changes to make.",
        codemod,
        actions.len()
    );
    apply_actions(actions)
}

fn apply_actions(actions: Vec<CodeActionOrCommand>) -> Result<(), std::io::Error> {
    let mut collected_changes = std::collections::HashMap::new();

    // Collect all the changes into a map of file-to-list-of-changes
    for action in actions {
        if let CodeActionOrCommand::CodeAction(code_action) = action
            && let Some(edit) = code_action.edit
            && let Some(changes) = edit.changes
        {
            for (file, changes) in changes {
                collected_changes
                    .entry(file)
                    .or_insert_with(Vec::new)
                    .extend(changes);
            }
        }
    }

    let mut pending_writes = Vec::with_capacity(collected_changes.len());
    for (file, mut changes) in collected_changes {
        sort_changes(&file, &mut changes)?;

        let file_path = relay_lsp::uri_to_file_path(&file).ok_or_else(|| {
            std::io::Error::other(format!("Codemod produced a non-file URI: {file:?}"))
        })?;
        let file_contents: String = fs::read_to_string(&file_path)?;
        let new_file_contents = apply_text_edits(&file_contents, &changes)?;
        pending_writes.push((file_path, changes.len(), new_file_contents));
    }
    pending_writes.sort_by(|left, right| left.0.cmp(&right.0));

    for (file_path, change_count, new_file_contents) in pending_writes {
        fs::write(&file_path, new_file_contents)?;

        info!(
            "Applied {} changes to {}",
            change_count,
            file_path.display()
        );
    }
    Ok(())
}

fn sort_changes(uri: &Uri, changes: &mut Vec<TextEdit>) -> Result<(), std::io::Error> {
    changes.sort_by(|left, right| {
        right
            .range
            .start
            .cmp(&left.range.start)
            .then_with(|| right.range.end.cmp(&left.range.end))
            .then_with(|| right.new_text.cmp(&left.new_text))
    });
    changes.dedup();

    let mut prev_change: Option<&TextEdit> = None;
    for change in changes.iter() {
        if change.range.start > change.range.end {
            return Err(invalid_edit_error(
                uri,
                change,
                "has an end before its start",
            ));
        }
        if let Some(prev_change) = prev_change
            && (change.range.start == prev_change.range.start
                || change.range.end > prev_change.range.start)
        {
            return Err(std::io::Error::other(format!(
                "Codemod produced changes that overlap: File {}, changes: {:?} vs {:?}",
                uri.path(),
                change,
                prev_change
            )));
        }
        prev_change = Some(change);
    }
    Ok(())
}

fn apply_text_edits(contents: &str, changes: &[TextEdit]) -> Result<String, std::io::Error> {
    let mut contents = contents.to_owned();
    for change in changes {
        let start = position_to_byte_offset(&contents, change.range.start)?;
        let end = position_to_byte_offset(&contents, change.range.end)?;
        if start > end {
            return Err(std::io::Error::other(format!(
                "Codemod produced a change with an end before its start: {:?}",
                change
            )));
        }
        contents.replace_range(start..end, &change.new_text);
    }
    Ok(contents)
}

fn position_to_byte_offset(
    contents: &str,
    position: lsp_types::Position,
) -> Result<usize, std::io::Error> {
    let mut line = 0;
    let mut character = 0;
    let mut chars = contents.char_indices().peekable();

    loop {
        let offset = chars.peek().map_or(contents.len(), |(offset, _)| *offset);
        if line == position.line && character == position.character {
            return Ok(offset);
        }

        let Some((_, current)) = chars.next() else {
            break;
        };
        let next = chars.peek().map(|(_, next)| *next);
        if is_line_terminator(current, next) {
            line += 1;
            character = 0;
        } else {
            character += current.len_utf16() as u32;
        }
    }

    Err(std::io::Error::other(format!(
        "Codemod produced an out-of-bounds position: {:?}",
        position
    )))
}

fn is_line_terminator(current: char, next: Option<char>) -> bool {
    matches!(current, '\n' | '\r' | '\u{2028}' | '\u{2029}')
        && !matches!((current, next), ('\r', Some('\n')))
}

fn invalid_edit_error(uri: &Uri, change: &TextEdit, reason: &str) -> std::io::Error {
    std::io::Error::other(format!(
        "Codemod produced an invalid change for {} that {}: {:?}",
        uri.path(),
        reason,
        change
    ))
}

fn valid_percent(s: &str) -> Result<FeatureFlag, String> {
    // If the string is a range of the form "x-y", where x and y are numbers, return the range
    let parts: Vec<&str> = s.split('-').collect();
    if parts.len() == 2 {
        let start = parts[0].parse::<u8>().map_err(|_| {
            "Expected the value on the left of the rollout range to be a number".to_string()
        })?;
        let end = parts[1].parse::<u8>().map_err(|_| {
            "Expected the value on the right of the rollout range to be a number".to_string()
        })?;
        if (0..=100).contains(&start) && (0..=100).contains(&end) && start <= end {
            Ok(FeatureFlag::RolloutRange {
                rollout: RolloutRange { start, end },
            })
        } else {
            Err("numbers must be between 0 and 100, inclusive, and the first number must be less than or equal to the second".to_string())
        }
    } else {
        // turn s into a u8
        let s = s.parse::<u8>().map_err(|_| "not a number".to_string())?;
        // check if s is less than 100
        if (0..=100).contains(&s) {
            Ok(FeatureFlag::Rollout {
                rollout: Rollout(Some(s)),
            })
        } else {
            Err("number must be between 0 and 100, inclusive".to_string())
        }
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;
    use std::path::Path;
    use std::sync::atomic::AtomicUsize;
    use std::sync::atomic::Ordering;

    use lsp_types::CodeAction;
    use lsp_types::Position;
    use lsp_types::Range;
    use lsp_types::WorkspaceEdit;

    use super::*;

    static NEXT_TEMP_DIR: AtomicUsize = AtomicUsize::new(0);

    struct TempDir(PathBuf);

    impl TempDir {
        fn new() -> Self {
            let path = std::env::temp_dir().join(format!(
                "relay-codemod-test-{}-{}",
                std::process::id(),
                NEXT_TEMP_DIR.fetch_add(1, Ordering::Relaxed),
            ));
            fs::create_dir(&path).expect("create temporary test directory");
            Self(path)
        }

        fn file(&self, name: &str, contents: &str) -> PathBuf {
            let path = self.0.join(name);
            fs::write(&path, contents).expect("write temporary test file");
            path
        }
    }

    impl Drop for TempDir {
        fn drop(&mut self) {
            fs::remove_dir_all(&self.0).expect("remove temporary test directory");
        }
    }

    fn edit(start: (u32, u32), end: (u32, u32), new_text: &str) -> TextEdit {
        TextEdit {
            range: Range::new(Position::new(start.0, start.1), Position::new(end.0, end.1)),
            new_text: new_text.to_owned(),
        }
    }

    fn test_uri() -> Uri {
        "file:///test.js".parse().expect("valid test URI")
    }

    fn file_uri(path: &Path) -> Uri {
        format!("file://{}", path.display())
            .parse()
            .expect("valid temporary file URI")
    }

    fn action(changes: HashMap<Uri, Vec<TextEdit>>) -> CodeActionOrCommand {
        CodeActionOrCommand::CodeAction(CodeAction {
            title: "Test edit".to_owned(),
            edit: Some(WorkspaceEdit {
                changes: Some(changes),
                ..Default::default()
            }),
            ..Default::default()
        })
    }

    #[test]
    fn validation_failure_leaves_all_files_unchanged() {
        let temp_dir = TempDir::new();
        let valid_file = temp_dir.file("valid.js", "field\n");
        let invalid_file = temp_dir.file("invalid.js", "field\n");
        let result = apply_actions(vec![action(HashMap::from([
            (file_uri(&valid_file), vec![edit((0, 5), (0, 5), "!")]),
            (file_uri(&invalid_file), vec![edit((2, 0), (2, 0), "!")]),
        ]))]);

        assert!(result.is_err());
        assert_eq!(fs::read_to_string(valid_file).unwrap(), "field\n");
        assert_eq!(fs::read_to_string(invalid_file).unwrap(), "field\n");
    }

    #[test]
    fn applies_multiple_edits_on_one_line_from_end_to_start() {
        let mut changes = vec![edit((0, 1), (0, 1), "A"), edit((0, 3), (0, 3), "B")];
        sort_changes(&test_uri(), &mut changes).expect("non-overlapping edits");

        assert_eq!(apply_text_edits("12345\n", &changes).unwrap(), "1A23B45\n");
    }

    #[test]
    fn removes_duplicate_edits() {
        let duplicate = edit((0, 1), (0, 1), "A");
        let mut changes = vec![duplicate.clone(), duplicate];
        sort_changes(&test_uri(), &mut changes).expect("identical edits are safe");

        assert_eq!(changes.len(), 1);
        assert_eq!(apply_text_edits("12", &changes).unwrap(), "1A2");
    }

    #[test]
    fn rejects_conflicting_insertions_at_the_same_position() {
        let mut changes = vec![edit((0, 1), (0, 1), "A"), edit((0, 1), (0, 1), "B")];

        assert!(sort_changes(&test_uri(), &mut changes).is_err());
    }

    #[test]
    fn uses_character_positions_without_changing_line_endings() {
        let mut changes = vec![edit((0, 2), (0, 2), "!")];
        sort_changes(&test_uri(), &mut changes).expect("valid Unicode edit");

        assert_eq!(
            apply_text_edits("aé\r\nnext\r\n", &changes).unwrap(),
            "aé!\r\nnext\r\n"
        );
    }

    #[test]
    fn uses_utf16_positions_for_astral_characters() {
        let mut changes = vec![edit((0, 2), (0, 2), "!")];
        sort_changes(&test_uri(), &mut changes).expect("valid Unicode edit");

        assert_eq!(apply_text_edits("😀field", &changes).unwrap(), "😀!field");
    }

    #[test]
    fn applies_edit_at_end_of_file_without_trailing_newline() {
        let changes = vec![edit((0, 5), (0, 5), "!")];

        assert_eq!(apply_text_edits("field", &changes).unwrap(), "field!");
    }
}
