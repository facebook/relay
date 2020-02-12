/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::errors::{ValidationErrors, ValidationResult};
use rayon::prelude::*;

// Helpers for unwrapping multiple ValidationResults to either return a tuple of
// success values or a single, aggregated list of all errors.

pub fn try2<T1, T2, E1, E2>(
    t1: Result<T1, E1>,
    t2: Result<T2, E2>,
) -> Result<(T1, T2), ValidationErrors>
where
    E1: Into<ValidationErrors>,
    E2: Into<ValidationErrors>,
{
    match (t1, t2) {
        (Ok(t1), Ok(t2)) => Ok((t1, t2)),
        (Ok(_), Err(errors)) => Err(errors.into()),
        (Err(errors), Ok(_)) => Err(errors.into()),
        (Err(errors1), Err(errors2)) => {
            let mut errors1 = errors1.into();
            let errors2 = errors2.into();
            errors1.extend(errors2);
            Err(errors1)
        }
    }
}

pub fn try3<T1, T2, T3, E1, E2, E3>(
    t1: Result<T1, E1>,
    t2: Result<T2, E2>,
    t3: Result<T3, E3>,
) -> Result<(T1, T2, T3), ValidationErrors>
where
    E1: Into<ValidationErrors>,
    E2: Into<ValidationErrors>,
    E3: Into<ValidationErrors>,
{
    let mut errors: ValidationErrors = Default::default();
    let t1 = match t1 {
        Ok(t1) => Some(t1),
        Err(e) => {
            errors.extend(e.into());
            None
        }
    };
    let t2 = match t2 {
        Ok(t2) => Some(t2),
        Err(e) => {
            errors.extend(e.into());
            None
        }
    };
    let t3 = match t3 {
        Ok(t3) => Some(t3),
        Err(e) => {
            errors.extend(e.into());
            None
        }
    };
    if !errors.is_empty() {
        Err(errors)
    } else {
        Ok((t1.unwrap(), t2.unwrap(), t3.unwrap()))
    }
}

#[allow(dead_code)]
pub fn try4<T1, T2, T3, T4, E1, E2, E3, E4>(
    t1: Result<T1, E1>,
    t2: Result<T2, E2>,
    t3: Result<T3, E3>,
    t4: Result<T4, E3>,
) -> Result<(T1, T2, T3, T4), ValidationErrors>
where
    E1: Into<ValidationErrors>,
    E2: Into<ValidationErrors>,
    E3: Into<ValidationErrors>,
    E3: Into<ValidationErrors>,
{
    let mut errors: ValidationErrors = Default::default();
    let t1 = match t1 {
        Ok(t1) => Some(t1),
        Err(e) => {
            errors.extend(e.into());
            None
        }
    };
    let t2 = match t2 {
        Ok(t2) => Some(t2),
        Err(e) => {
            errors.extend(e.into());
            None
        }
    };
    let t3 = match t3 {
        Ok(t3) => Some(t3),
        Err(e) => {
            errors.extend(e.into());
            None
        }
    };
    let t4 = match t4 {
        Ok(t4) => Some(t4),
        Err(e) => {
            errors.extend(e.into());
            None
        }
    };
    if !errors.is_empty() {
        Err(errors)
    } else {
        Ok((t1.unwrap(), t2.unwrap(), t3.unwrap(), t4.unwrap()))
    }
}

pub fn try_all<T, U, I, F>(items: I, mut f: F) -> ValidationResult<Vec<T>>
where
    I: IntoIterator<Item = U>,
    F: FnMut(U) -> ValidationResult<T>,
{
    let iter = items.into_iter();
    let mut errors = ValidationErrors::new(Vec::new());
    let mut values = Vec::with_capacity(iter.size_hint().1.unwrap_or_default());
    for item in iter {
        match f(item) {
            Ok(value) => values.push(value),
            Err(error) => errors.extend(error),
        }
    }
    if errors.is_empty() {
        Ok(values)
    } else {
        Err(errors)
    }
}

#[allow(dead_code)]
pub fn par_try_all<T: Sync + Send, U: Sync + Send, I, F: Sync + Send>(
    items: I,
    f: F,
) -> Result<Vec<T>, ValidationErrors>
where
    I: IntoParallelIterator<Item = U>,
    F: Fn(U) -> ValidationResult<T>,
{
    let results: Vec<ValidationResult<T>> = items.into_par_iter().map(f).collect();
    let mut errors = ValidationErrors::new(Vec::new());
    let mut values = Vec::with_capacity(results.len());
    for result in results {
        match result {
            Ok(value) => values.push(value),
            Err(error) => errors.extend(error),
        }
    }
    if errors.is_empty() {
        Ok(values)
    } else {
        Err(errors)
    }
}
