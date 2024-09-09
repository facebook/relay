/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;
use std::thread;
use std::thread::JoinHandle;
use std::time::Instant;

use crossbeam::channel::unbounded;
use crossbeam::channel::Receiver;
use crossbeam::channel::Sender;
use log::debug;

pub struct TaskQueue<S, T> {
    processor: Arc<dyn TaskProcessor<S, T>>,
    pub receiver: Receiver<T>,
    scheduler: Arc<TaskScheduler<T>>,
    active_thread_handles: Vec<JoinHandle<()>>,
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
            scheduler: Arc::new(TaskScheduler { sender }),
            active_thread_handles: Vec::new(),
        }
    }

    pub fn get_scheduler(&self) -> Arc<TaskScheduler<T>> {
        Arc::clone(&self.scheduler)
    }

    pub fn process(&mut self, state: Arc<S>, task: T) {
        let processor = Arc::clone(&self.processor);
        let is_serial_task = processor.is_serial_task(&task);
        let should_join_active_threads = self.active_thread_handles.len() > 10;

        if is_serial_task || should_join_active_threads {
            // Before starting a serial task, we need to make sure that all
            // previous tasks have been completed, otherwise the serial task
            // might interfere with them.
            // We also do this if there are too many "tracked" threads, since
            // the threads we spawn are now no longer "detached" and it's our
            // responsibility to join them at some point.
            self.ensure_previous_tasks_completed();
        }

        let task_str = format!("{:?}", &task);
        let now = Instant::now();
        debug!("Processing task {:?}", &task_str);

        let thread_builder = thread::Builder::new();
        let spawn_result = thread_builder.spawn(move || {
            processor.process(state, task);

            debug!(
                "Task {} completed in {}ms",
                task_str,
                now.elapsed().as_millis()
            );
        });

        match spawn_result {
            Ok(handle) => {
                if is_serial_task {
                    // If the task is serial, we need to wait for its thread
                    // to complete, before moving onto the next task.
                    if let Err(error) = handle.join() {
                        debug!("Thread panicked while joining serial task: {:?}", error);
                    }
                } else {
                    self.active_thread_handles.push(handle);
                }
            }
            Err(error) => {
                debug!("Failed to spawn thread to process task: {:?}", error);
            }
        }
    }

    fn ensure_previous_tasks_completed(&mut self) {
        for handle in self.active_thread_handles.drain(..) {
            if let Err(error) = handle.join() {
                debug!("Thread panicked while joining previous task: {:?}", error);
            }
        }
    }
}
