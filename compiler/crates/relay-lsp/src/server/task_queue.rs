/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;
use std::time::Instant;

use crossbeam::channel::Receiver;
use crossbeam::channel::Sender;
use crossbeam::channel::unbounded;
use log::debug;
use log::error;
use tokio::sync::Semaphore;

pub struct TaskQueue<S, T> {
    processor: Arc<dyn TaskProcessor<S, T>>,
    pub receiver: Receiver<T>,
    handles: Vec<tokio::task::JoinHandle<()>>,
    scheduler: Arc<TaskScheduler<T>>,
    permits: Arc<Semaphore>,
}

pub trait TaskProcessor<S, T>: Send + Sync + 'static {
    fn process(&self, state: Arc<S>, task: T);
    fn is_serial_task(&self, task: &T) -> bool;
}

pub struct TaskScheduler<T> {
    sender: Sender<T>,
}

impl<T> TaskScheduler<T> {
    pub fn schedule(&self, task: T) {
        self.sender
            .send(task)
            .expect("Unable to send task to a channel.")
    }
}

const MAX_PARALLEL_TASKS: u32 = 10;

impl<S, T> TaskQueue<S, T>
where
    S: Send + Sync + 'static,
    T: Send + Sync + std::fmt::Debug + 'static,
{
    pub fn new(processor: Arc<dyn TaskProcessor<S, T>>) -> Self {
        let (sender, receiver) = unbounded();

        Self {
            processor,
            receiver,
            handles: Default::default(),
            scheduler: Arc::new(TaskScheduler { sender }),
            permits: Arc::new(Semaphore::new(MAX_PARALLEL_TASKS as usize)),
        }
    }

    pub fn get_scheduler(&self) -> Arc<TaskScheduler<T>> {
        Arc::clone(&self.scheduler)
    }

    /// Process a task.
    ///
    /// NOTE: This should not do any heavy work and expensive processing should be moved into
    ///       `tokio::spawn_blocking` or other appropriate handling.
    pub async fn process(&mut self, state: Arc<S>, task: T) {
        // check for finished tasks to potentially propagate errors
        for finished_handle in self.handles.extract_if(.., |handle| handle.is_finished()) {
            if let Err(err) = finished_handle.await {
                error!("Task finished with error in Relay Compiler TaskQueue: {err:?}");
            }
        }

        let processor = Arc::clone(&self.processor);
        let is_serial_task = processor.is_serial_task(&task);

        let permit = if is_serial_task {
            // Acquire all permits, ensuring that no other tasks are running in parallel
            Arc::clone(&self.permits)
                .acquire_many_owned(MAX_PARALLEL_TASKS)
                .await
        } else {
            Arc::clone(&self.permits).acquire_owned().await
        }
        .expect("Semaphore unexpectedly closed");

        let task_str = format!("{:?}", &task);
        let now = Instant::now();
        debug!("Processing task {:?}", &task_str);

        let handle = tokio::task::spawn_blocking(move || {
            processor.process(state, task);

            debug!(
                "Task {} completed in {}ms",
                task_str,
                now.elapsed().as_millis()
            );

            // explicitly move the permit into this task and only
            // release after the async task was completed
            drop(permit);
        });

        self.handles.push(handle);
    }
}
