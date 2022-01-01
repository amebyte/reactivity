import { extend } from "../shared"

let activeEffect
let shouldTrack
class ReactiveEffect {
    private _fn: any
    deps = []
    active = true
    onStop?: () => void
    constructor(fn, public scheduler?) {
        this._fn = fn
    }
    run() {
        if(!this.active) {
            return this._fn()
        }

        activeEffect = this
        shouldTrack = true
        const result = this._fn()
        shouldTrack = false
        return result
    }
    stop() {
        if(this.active) {
            cleanupEffect(this)
            if(this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
    effect.deps.length = 0
}

export function effect(fn, options: any = {}) {
    const _effect  = new ReactiveEffect(fn, options.scheduler)
    extend(_effect, options)
    _effect.run()
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export function stop(runner) {
    runner.effect.stop()
}

const targetMap = new Map()
export function track(target, key) {
    if(!isTacking()) return
    let depsMap = targetMap.get(target)
    if(!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)
    if(!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    if(dep.has(activeEffect)) return
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

export function isTacking() {
    return activeEffect && shouldTrack
}

export function trigger(target, key) {
    let depsMap = targetMap.get(target)
    const deps = depsMap.get(key)
    deps.forEach(effect => {
        if(effect.scheduler){
            effect.scheduler()
        } else {
            effect.run()
        }
    });
}