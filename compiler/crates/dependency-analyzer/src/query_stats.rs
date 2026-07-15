/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;
use std::fmt::Write;

use graphql_ir::ExecutableDefinitionName;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::OperationKind;

use crate::ExecutableDefinitionNameMap;
use crate::ExecutableDefinitionNameSet;

/// Per-operation fragment usage statistics.
pub struct OperationStats {
    pub name: String,
    pub kind: OperationKind,
    pub direct_fragment_count: usize,
    pub transitive_fragment_count: usize,
    pub max_fragment_depth: usize,
}

/// Distribution statistics for a set of values.
struct Distribution {
    min: usize,
    max: usize,
    mean: f64,
    median: usize,
    p90: usize,
    p99: usize,
}

/// Aggregated report of per-operation fragment usage across a project.
pub struct QueryStatsReport {
    pub operations: Vec<OperationStats>,
    pub query_count: usize,
    pub mutation_count: usize,
    pub subscription_count: usize,
}

/// Compute per-operation fragment statistics from parsed definitions and their
/// dependency map (as returned by `get_definition_references`).
pub fn compute_query_stats(
    definitions: &[ExecutableDefinition],
    dep_map: &ExecutableDefinitionNameMap<ExecutableDefinitionNameSet>,
) -> QueryStatsReport {
    // Precompute max_depth for every node in the dep_map. This is composable:
    // depth(F) = 0 if F has no refs, else 1 + max(depth(child)).
    // Computing once avoids the expensive re-visiting that the old per-operation
    // DFS required to track longest paths through diamond-shaped graphs.
    let depth_cache = precompute_max_depths(dep_map);

    let mut operations = Vec::new();
    let mut query_count = 0usize;
    let mut mutation_count = 0usize;
    let mut subscription_count = 0usize;

    for def in definitions {
        if let ExecutableDefinition::Operation(op) = def {
            let name_str = op
                .name
                .as_ref()
                .map(|n| n.value.to_string())
                .unwrap_or_else(|| "<anonymous>".to_string());

            let kind = op.operation_kind();

            match kind {
                OperationKind::Query => query_count += 1,
                OperationKind::Mutation => mutation_count += 1,
                OperationKind::Subscription => subscription_count += 1,
            }

            let op_def_name = ExecutableDefinitionName::OperationDefinitionName(
                graphql_ir::OperationDefinitionName(intern::string_key::Intern::intern(
                    name_str.as_str(),
                )),
            );

            let direct_refs = dep_map.get(&op_def_name);
            let direct_fragment_count = direct_refs.map_or(0, |refs| refs.len());

            let transitive_fragment_count = count_transitive_fragments(dep_map, &op_def_name);
            let max_fragment_depth = direct_refs.map_or(0, |refs| {
                refs.iter()
                    .map(|f| 1 + depth_cache.get(f).copied().unwrap_or(0))
                    .max()
                    .unwrap_or(0)
            });

            operations.push(OperationStats {
                name: name_str,
                kind,
                direct_fragment_count,
                transitive_fragment_count,
                max_fragment_depth,
            });
        }
    }

    // Sort by transitive fragment count descending, then by name ascending for ties
    operations.sort_by(|a, b| {
        b.transitive_fragment_count
            .cmp(&a.transitive_fragment_count)
            .then_with(|| a.name.cmp(&b.name))
    });

    QueryStatsReport {
        operations,
        query_count,
        mutation_count,
        subscription_count,
    }
}

/// Precompute the max fragment depth for every node in the dependency map.
/// depth(F) = 0 if F has no fragment refs, else 1 + max(depth(child)).
fn precompute_max_depths(
    dep_map: &ExecutableDefinitionNameMap<ExecutableDefinitionNameSet>,
) -> ExecutableDefinitionNameMap<usize> {
    let mut cache: ExecutableDefinitionNameMap<usize> = Default::default();
    for name in dep_map.keys() {
        compute_depth(name, dep_map, &mut cache, &mut Default::default());
    }
    cache
}

/// Recursive memoized depth computation with cycle detection.
fn compute_depth(
    name: &ExecutableDefinitionName,
    dep_map: &ExecutableDefinitionNameMap<ExecutableDefinitionNameSet>,
    cache: &mut ExecutableDefinitionNameMap<usize>,
    visiting: &mut ExecutableDefinitionNameSet,
) -> usize {
    if let Some(&d) = cache.get(name) {
        return d;
    }
    if !visiting.insert(*name) {
        // Cycle detected — treat as depth 0 to break the loop.
        return 0;
    }
    let depth = dep_map.get(name).map_or(0, |refs| {
        refs.iter()
            .map(|child| 1 + compute_depth(child, dep_map, cache, visiting))
            .max()
            .unwrap_or(0)
    });
    visiting.remove(name);
    cache.insert(*name, depth);
    depth
}

/// Count unique fragments transitively reachable from `start`.
/// Simple visited-set DFS — each node is visited at most once, giving O(V+E).
fn count_transitive_fragments(
    dep_map: &ExecutableDefinitionNameMap<ExecutableDefinitionNameSet>,
    start: &ExecutableDefinitionName,
) -> usize {
    let Some(direct_refs) = dep_map.get(start) else {
        return 0;
    };
    let mut visited = ExecutableDefinitionNameSet::default();
    let mut stack: Vec<ExecutableDefinitionName> = direct_refs.iter().copied().collect();
    while let Some(name) = stack.pop() {
        if !visited.insert(name) {
            continue;
        }
        if let Some(refs) = dep_map.get(&name) {
            for child in refs {
                if !visited.contains(child) {
                    stack.push(*child);
                }
            }
        }
    }
    visited.len()
}

impl Distribution {
    fn from_values(values: &[usize]) -> Option<Self> {
        if values.is_empty() {
            return None;
        }
        let mut sorted = values.to_vec();
        sorted.sort_unstable();
        let n = sorted.len();
        let sum: usize = sorted.iter().sum();
        let mean = sum as f64 / n as f64;
        let median = if n.is_multiple_of(2) {
            (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        } else {
            sorted[n / 2]
        };
        let p90 = sorted[((n as f64 * 0.9).ceil() as usize).min(n) - 1];
        let p99 = sorted[((n as f64 * 0.99).ceil() as usize).min(n) - 1];

        Some(Distribution {
            min: sorted[0],
            max: sorted[n - 1],
            mean,
            median,
            p90,
            p99,
        })
    }
}

impl QueryStatsReport {
    /// Format the report as a deterministic text string.
    /// `limit` controls how many operations appear in the ranked list;
    /// summary, distribution, and histogram always reflect the full dataset.
    pub fn format_report_with_limit(&self, limit: usize) -> String {
        let mut out = String::new();
        let total = self.operations.len();

        // Per-operation table
        writeln!(
            out,
            "== Operations (by transitive fragments, descending) =="
        )
        .unwrap();
        for op in self.operations.iter().take(limit) {
            writeln!(
                out,
                "{:>3} {} ({}) [direct: {}, depth: {}]",
                op.transitive_fragment_count,
                op.name,
                kind_str(op.kind),
                op.direct_fragment_count,
                op.max_fragment_depth,
            )
            .unwrap();
        }
        if total > limit {
            writeln!(out, "... and {} more operations", total - limit).unwrap();
        }

        // Summary
        writeln!(out).unwrap();
        writeln!(out, "== Summary ==").unwrap();
        writeln!(out, "Total operations: {total}").unwrap();
        writeln!(
            out,
            "  Queries: {}, Mutations: {}, Subscriptions: {}",
            self.query_count, self.mutation_count, self.subscription_count,
        )
        .unwrap();

        let zero_count = self
            .operations
            .iter()
            .filter(|op| op.transitive_fragment_count == 0)
            .count();
        writeln!(
            out,
            "Operations with 0 fragments: {} ({})",
            zero_count,
            format_pct(zero_count, total),
        )
        .unwrap();

        // Distribution
        let values: Vec<usize> = self
            .operations
            .iter()
            .map(|op| op.transitive_fragment_count)
            .collect();

        if let Some(dist) = Distribution::from_values(&values) {
            writeln!(out).unwrap();
            writeln!(out, "== Distribution (transitive fragments) ==").unwrap();
            writeln!(
                out,
                "Min: {}  Max: {}  Mean: {:.2}  Median: {}",
                dist.min, dist.max, dist.mean, dist.median,
            )
            .unwrap();
            writeln!(out, "P90: {}  P99: {}", dist.p90, dist.p99).unwrap();
        }

        // Histogram
        let buckets: &[(usize, usize, &str)] = &[
            (0, 0, "    0 fragments"),
            (1, 5, "  1-5 fragments"),
            (6, 20, " 6-20 fragments"),
            (21, 50, "21-50 fragments"),
            (51, usize::MAX, "  51+ fragments"),
        ];
        writeln!(out).unwrap();
        writeln!(out, "== Histogram ==").unwrap();
        for (lo, hi, label) in buckets {
            let count = values.iter().filter(|v| **v >= *lo && **v <= *hi).count();
            writeln!(out, "{}: {} ({})", label, count, format_pct(count, total)).unwrap();
        }

        out
    }

    /// Format the report showing all operations (no limit).
    pub fn format_report(&self) -> String {
        self.format_report_with_limit(usize::MAX)
    }

    /// Append CSV rows (without header) for all operations to the given string.
    pub fn append_csv_rows(&self, out: &mut String, project_name: &str) {
        for op in &self.operations {
            writeln!(
                out,
                "{},{},{},{},{},{}",
                project_name,
                op.name,
                kind_str(op.kind),
                op.direct_fragment_count,
                op.transitive_fragment_count,
                op.max_fragment_depth,
            )
            .unwrap();
        }
    }
}

fn kind_str(kind: OperationKind) -> &'static str {
    match kind {
        OperationKind::Query => "query",
        OperationKind::Mutation => "mutation",
        OperationKind::Subscription => "subscription",
    }
}

fn format_pct(count: usize, total: usize) -> String {
    if total == 0 {
        "0.0%".to_string()
    } else {
        format!("{:.1}%", count as f64 / total as f64 * 100.0)
    }
}

impl fmt::Display for QueryStatsReport {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.format_report())
    }
}
