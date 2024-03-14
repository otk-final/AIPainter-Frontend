use lazy_static::lazy_static;
use rayon::ThreadPool;


// 线程池
lazy_static! {

    pub static ref POOL: ThreadPool = rayon::ThreadPoolBuilder::new()
        .num_threads(20)
        // .stack_size(100)
        .build()
        .unwrap();
}