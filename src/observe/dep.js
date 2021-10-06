// 一个属性对应一个dep，做属性收集
let id = 0
class Dep {
    // 每一个属性都分配一个Dep，每一个Dep可以存放watcher，watch中要存放Dep
    constructor() {
        this.id = id++
        this.subs = [] // 用来存放watcher
    }
    depend() {
        // Dep.target dep里面要存放这个watcher watcher一样要存放dep
        if (Dep.target) {
            // 把dep给watcher，让watcher存放dep
            Dep.target.addDep(this)
        }
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(watcher => {
            watcher.update()
        })
    }
}
Dep.target = null
export function pushTarget(watcher) {
    Dep.target = watcher
}

export function popTarget() {
    Dep.target = null
}

export default Dep