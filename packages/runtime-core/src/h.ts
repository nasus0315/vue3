import { isObject } from '@vue/shared';
import { isVNode, createVNode } from './createVNode';
export function h(type, propsOrChildren?, children?) {
	// 返回虚拟dom
	const l = arguments.length;
	if (l === 2) {
		if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
			if (isVNode(propsOrChildren)) {
                // 是儿子的情况
				return createVNode(type, null, [propsOrChildren]);
			}
            // 是属性的情况
			return createVNode(type, propsOrChildren);
		} else {
            // 可能是数组，也可能是文本  --.  也可能是儿子
			return createVNode(type, null, propsOrChildren);
		}
	} else {
		if (l > 3) {
			children = Array.from(arguments).slice(2);
		}
		if (l === 3 && isVNode(children)) {
			children = [children];
		}
        // 参数大于3 前2个之外都是儿子
        // 等于三 第三个参数是虚拟节点，要包装成数组
		return createVNode(type, propsOrChildren, children);
	}
}
