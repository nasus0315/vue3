import {
	activeEffect,
	ReactiveEffect,
	trackEffect,
	triggerEffects,
} from './effect';
import { isFunction } from '../../shared/src/index';
class CompoutedRefImpl {
	public effect;
	public _value;
	public _dirty = true;
	public dep = new Set();
    public _v_isRef = true //可以增加拆包逻辑（使用计算属性和ref可不不加.value）
	constructor(getter, public setter) {
		this.effect = new ReactiveEffect(getter, () => {
			if (!this._dirty) {
				this._dirty = true;
				triggerEffects(this.dep);
			}
		});
	}
	get value() {
		trackEffect(this.dep);
		if (this._dirty) {
			this._dirty = false;
			this._value = this.effect.run();
		}
		return this._value;
	}
	set value(newVal) {
		this.setter(newVal);
	}
}
export function computed(getterOrOptions) {
	let getter, setter;
	const isGetter = isFunction(getterOrOptions);
	if (isGetter) {
		getter = getterOrOptions;
		setter = () => {
			console.log('warning');
		};
	} else {
		getter = getterOrOptions.get;
		setter = getterOrOptions.set;
	}
	return new CompoutedRefImpl(getter, setter);
}
