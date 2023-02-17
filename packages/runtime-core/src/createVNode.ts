import { isObject, isString, ShapeFlags } from '@vue/shared';
export const Text = Symbol();
export const Fragment = Symbol();
export function isVNode(value) {
	return !!value.__v_isVNode; // 用来判断是否是虚拟节点
}
export function isSameVnode(n1, n2) {
	// 如果前后没key 都是undefiend ，认为key是一样的
	return n1.type === n2.type && n1.key === n2.key;
}
export function createVNode(type, props, children = null) {
	// 虚拟节点需要有一些重要的属性
	const shapeFlag = isString(type)
		? ShapeFlags.ELEMENT
		: isObject(type) // type 是对象说明是一个组件了
		? ShapeFlags.STATEFUL_COMPONENT
		: 0;
	const vnode = {
		__v_isVNode: true, // 判断对象是不是虚拟节点可以采用这个字段
		type,
		props,
		children,
		key: props?.key, // 虚拟节点的key，主要用于diff算法
		el: null, // 虚拟节点对应的真实节点
		shapeFlag,
	};
	if (children) {
		let type = 0;
		if (Array.isArray(children)) {
			// 自己是元素，儿子是数组
			type = ShapeFlags.ARRAY_CHILDREN;
		} else {
			vnode.children = String(children);
			type = ShapeFlags.TEXT_CHILDREN;
		}
		vnode.shapeFlag |= type;
	}

	// 这里返回了虚拟节点，并且标识了虚拟节点的类型
	return vnode;
}
