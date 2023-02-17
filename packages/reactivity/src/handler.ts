import { ReactiveFlags, reactive } from './reactive';
import { activeEffect, track, trigger } from './effect';
import { isRef } from './ref';
import { isObject } from '../../shared/src/index';
//使用Reflect是为了解决this指向问题
export const mutableHandlers = {
	get(target, key, receiver) {
		// 为了解决对象是否被代理，被代理的直接被返回，不让重复代理
		if (key === ReactiveFlags.IS_REACTIVE) {
			return true;
		}
		if (isRef(target[key])) {
			return target[key].value;
		}
		// 深层代理
		if (isObject(target[key])) {
			return reactive(target[key]);
		}
		const res = Reflect.get(target, key, receiver);
		// 收集依赖,让effect和属性依赖双向记忆
		track(target, key);
		return res;
	},
	set(target, key, value, receiver) {
		const oldValue = target[key];
		const res = Reflect.set(target, key, value, receiver);
		if (value !== oldValue) {
			// 触发更新
			trigger(target, key, value, oldValue);
		}
		return res;
	},
};
