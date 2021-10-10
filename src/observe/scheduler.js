// 调度工作
import { nextTick } from '../util';
// 1. 去重 2. 防抖 
let queue = []
let has = {} // 列表维护存放了哪些watcher
function flushSchedulerQueue() {
    for (let i = 0; i < queue.length; i++) {
        queue[i].run()
    }
    queue = []
    has = {}
    pending = false
}
let pending = false
export function queueWatcher(watcher) {
    // 多次更新，会收到多个watcher
    const id = watcher.id
    if (has[id] == null) {
        queue.push(watcher)
        has[id] = true
        // 开启一次更新操作 批处理 （防抖）
        if (!pending) {
            nextTick(flushSchedulerQueue, 0)
            pending = true
        }
    }
}