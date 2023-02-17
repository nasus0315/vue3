import { mutableHandlers } from './handler';
import { isObject } from '@vue/shared';

const reactiveMap = new WeakMap();

export const enum ReactiveFlags {
	IS_REACTIVE = '__v_isReactive',
}
export function reactive(target) {
	if (!isObject(target)) return target;

	let existingProxy = reactiveMap.get(target); // 解决重复代理问题
	if (existingProxy) return existingProxy;
	if (target[ReactiveFlags.IS_REACTIVE]) return target; // 解决重复代理问题
	const proxy = new Proxy(target, mutableHandlers);
	reactiveMap.set(target, proxy);
	return proxy;
}

export function isReactive(value) {
	if(value[ReactiveFlags.IS_REACTIVE]) return true;
}