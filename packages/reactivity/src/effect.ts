export let activeEffect = undefined;
function cleanupEffect(effect) {
	let deps = effect.deps;
	for (let i = 0; i < deps.length; i++) {
		deps[i].delete(effect);
	}
	effect.deps.length = 0; //清空依赖，重新收集
}
export class ReactiveEffect {
	constructor(private fn, public scheduler?) {}
	parent = undefined;
	deps = [];
	active = true;
	run() {
		if (!this.active) {
			return this.fn();
		}
		try {
			this.parent = activeEffect;
			activeEffect = this;
			// 清空依赖，防止更新的时候，数据没有在页面用到，也会执行effect
			cleanupEffect(this);
			return this.fn();
		} finally {
			activeEffect = this.parent;
			this.parent = undefined;
		}
	}
	stop() {
		//停止依赖收集
		this.active = false;
		cleanupEffect(this);
	}
}
export function effect(fn, option: any = {}) {
	const _effect = new ReactiveEffect(fn, option.scheduler);
	_effect.run();
	const runner = _effect.run.bind(_effect);
	runner.effect = _effect; // runner.run()
	return runner;
}
const targetMaps = new WeakMap();
// {{name:'aaa', age: 18},{name,[effect]}}
// 依赖收集
export function track(target, key) {
	if (activeEffect) {
		let depsMap = targetMaps.get(target);
		if (!depsMap) {
			targetMaps.set(target, (depsMap = new Map()));
		}
		let dep = depsMap.get(key);
		if (!dep) {
			depsMap.set(key, (dep = new Set()));
		}
		trackEffect(dep);
	}
}
export function trackEffect(dep) {
	let shouldTrack = !dep.has(activeEffect);
	if (shouldTrack) {
		dep.add(activeEffect);
		activeEffect.deps.push(dep);
	}
}
export function triggerEffects(dep) {
	let effects = [...dep];
	effects &&
		effects.forEach((effect) => {
			if (effect !== activeEffect) {
				if (effect.scheduler) {
					// 用户传递scheduler方法，可以自己控制执行更新操作（异步更新）
					effect.scheduler();
				} else {
					effect.run();
				}
			}
		});
}
export function trigger(target, key, value, oldValue) {
	const depsMap = targetMaps.get(target);
	if (!depsMap) return;
	let dep = depsMap.get(key);
	triggerEffects(dep);
}
