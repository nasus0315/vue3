import { isObject } from '@vue/shared';
import { reactive } from './reactive';
import { trackEffect, triggerEffects, track } from './effect';

export function isRef(value) {
	return !!(value && value.__v_isRef);
}

export function toReactive(value) {
	return isObject(value) ? reactive(value) : value;
}

class RefImpl {
	public _value;
	public __v_isRef = true;
	public dep = new Set();
	constructor(public rawValue) {
		this._value = toReactive(rawValue);
	}
	get value() {
		trackEffect(this.dep);
		return this._value;
	}
	set value(newValue) {
		if (newValue !== this.rawValue) {
			this.rawValue = newValue;
			this._value = toReactive(newValue);
			triggerEffects(this.dep);
		}
	}
}
export function ref(value) {
	debugger;
	return new RefImpl(value);
}

class ObjectRefImpl {
	public _v_isRef = true;
	constructor(private _object, private _key) {}
	get value() {
		return this._object[this._key];
	}
	set value(newValue) {
		this._object[this._key] = newValue;
	}
}
export function toRef(object, key) {
	return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
	let res = Array.isArray(object)
		? new Array(object.length)
		: Object.create(null);
	for (let key in object) {
		// 将每一项都转换成ref类型
		res[key] = toRef(object, key);
	}
	return res;
}

export function proxyRefs(object) { // 模版渲染的时候，会调用这个方法，将ref的value去掉 拆包
	return new Proxy(object, {
		get(target, key, receiver) {
			let v = Reflect.get(target, key, receiver);
			return isRef(v) ? v.value : v;
		},
		set(target, key, value, receiver) {
			let oldValue = Reflect.get(target, key, receiver);
			if (isRef(oldValue)) {
				oldValue.value = value;
				return true;
			} else {
				return Reflect.set(target, key, value, receiver);
			}
		},
	});
}
