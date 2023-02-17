import { ShapeFlages, isString } from '@vue/shared';
import { isObject } from '../../shared/src/index';
export function isVNode(val) {
	return !!val?.__v_isVNode;
}
export const Text = Symbol('Text');
export const Fragment = Symbol('Fragment');
export function createVNode(type, props, children = null) {
	const shapeFlag = isString(type)
		? ShapeFlages.ELEMENT
		: isObject(type)
		? ShapeFlages.STATEFUL_COMPONENT
		: 0;
	const vnode = {
		__v_isVNode: true, // 判断是否是虚拟节点
		type,
		props,
		children,
		key: props?.key, // 虚拟节点key，用于diff算法
		el: null, // 虚拟节点对应的真实节点
		shapeFlag, // 虚拟节点的类型
	};
	if (children) {
		let type = 0;
		if (Array.isArray(children)) {
			type = ShapeFlages.ARRAY_CHILDREN;
		} else {
			vnode.children = String(children);
			type = ShapeFlages.TEXT_CHILDREN;
		}
		vnode.shapeFlag |= type;
	}
	return vnode;
}
