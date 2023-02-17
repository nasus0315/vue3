import { isObject, isFunction } from '@vue/shared';
import { isReactive } from './reactive';
import { ReactiveEffect } from './effect';
function traverse(value, seen = new Set()) {
	if (!isObject(value)) return value;
	if (seen.has(value)) return value;
	seen.add(value);
	for (const key in value) {
		traverse(value[key], seen);
	}
	return value;
}

export function watch(source, cb, options) {
	// effect+scheduler
	return dowatch(source, cb, options);
}
export function watchEffect(source, options) {
	// effect
	return dowatch(source, null, options);
}

export function dowatch(source, cb, options) {
	// effect + scheduler
	// souece: 传入的数据 响应式数据（对象、函数）
	let getter;
	if (isReactive(source)) {
		getter = () => traverse(source);
	} else if (isFunction(source)) {
		getter = source;
	}
	let oldValue;
	let clear;
	let onClearup = (fn) => { //清理上一次操作
		clear = fn;
	};
	const job = () => {
		if (cb) {
            if(clear) clear()
			const newValue = effect.run();
			cb(newValue, oldValue, onClearup);
			oldValue = newValue;
		} else {
			effect.run();
		}
	};
	const effect = new ReactiveEffect(getter, job);
	oldValue = effect.run();
}
