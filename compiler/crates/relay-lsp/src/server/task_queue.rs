/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{sync::Arc, thread, time::Instant};

use crossbeam::channel::{unbounded, Receiver, Sender};
use log::debug;

pub struct TaskQueue<S, T> {
    processor: Arc<dyn TaskProcessor<S, T>>,
    pub receiver: Receiver<T>,
    scheduler: Arc<TaskScheduler<T>>,
}

pub trait TaskProcessor<S, T>: Send + Sync + 'static {
    fn process(&self, state: Arc<S>, task: T);
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
        }
    }

    pub fn get_scheduler(&self) -> Arc<TaskScheduler<T>> {
        Arc::clone(&self.scheduler)
    }

    pub fn process(&self, state: Arc<S>, task: T) {
        let task_str = format!("{:?}", &task);
        let now = Instant::now();
        debug!("Processing task {:?}", &task_str);
        let processor = Arc::clone(&self.processor);
        thread::spawn(move || {
            processor.process(state, task);
            debug!(
                "task {} completed in {}ms",
                task_str,
                now.elapsed().as_millis()
            );
        });
    }
}
