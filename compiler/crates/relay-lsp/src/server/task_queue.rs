/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::{sync::Arc, thread};

use crossbeam::channel::{unbounded, Receiver, Sender};
use rayon::{ThreadPool, ThreadPoolBuilder};

pub struct TaskQueue<S, T> {
    processor: fn(state: Arc<S>, task: T),
    receiver: Receiver<T>,
    scheduler: Arc<TaskScheduler<T>>,
    thread_pool: Arc<ThreadPool>,
}

pub struct TaskScheduler<T> {
    sender: Sender<T>,
}

impl<T> TaskScheduler<T> {
    pub fn schedule(&self, task: T) {
        self.sender.send(task).unwrap();
    }
}

impl<S: Send + Sync + 'static, T: Send + Sync + 'static> TaskQueue<S, T> {
    /// Creates a new instance of the TaskQueue
    /// Internally, this creates a thread_pool with
    /// `num_threads` available threads to handle incoming tasks.
    /// Scheduling and processing tasks implemented
    /// with Multi-producer single-consumer FIFO queue communication primitives.
    pub fn new(processor: fn(state: Arc<S>, task: T), num_threads: usize) -> Self {
        assert!(num_threads > 0);

        let thread_pool = ThreadPoolBuilder::new()
            .num_threads(num_threads)
            .build()
            .unwrap();

        let (sender, receiver) = unbounded();

        Self {
            processor,
            receiver,
            scheduler: Arc::new(TaskScheduler { sender }),
            thread_pool: Arc::new(thread_pool),
        }
    }

    pub fn get_scheduler(&self) -> Arc<TaskScheduler<T>> {
        Arc::clone(&self.scheduler)
    }

    /// run(...) start a new thread that
    /// consumes the schedule tasks and passes them to
    /// the thread_pool to be handled by `processor` function.
    /// run(...) can be called only once.
    pub fn run(self, state: Arc<S>) {
        let processor = self.processor;
        let receiver = self.receiver;
        let thread_pool = Arc::clone(&self.thread_pool);

        thread::spawn(move || {
            loop {
                let task = receiver.recv().expect("A message could not be received because the channel is empty and disconnected in the TaskQueue.");
                let state = Arc::clone(&state);
                thread_pool.install(|| {
                    processor(state, task);
                });
            }
        });
    }
}
