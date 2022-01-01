import { mutableHandlers, readonlyHandlers } from "./baseHandlers"
export const enum ReactiveFlags {
    IS_REACTIVE = "_v_isReactive"
}
export function reactive(raw) {
    return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers)
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE]
}

function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers)
}