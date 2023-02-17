export const nodeOps = {
	//创建元素
	createElement: (element) => document.createElement(element),
	//创建文本
	createText: (text) => document.createTextNode(text),
	//对元素的插入
	insert: (element, container, anchor = null) => {
		container.insertBefore(element, anchor);
	},
	//对元素的删除
	remove: (child) => {
		const parent = child.parentNode;
		if (parent) {
			parent.removeChild(child);
		}
	},
	//元素查询
	querySelector: (selector) => document.querySelector(selector),
	//设置文本内容
	setElementText: (element, text) => {
		// 给元素节点设置内容 innerHTML
		element.textContent = text;
	},
	setText: (element, text) => {
		element.nodeValue = text;
	},
	createComment: (text) => document.createComment(text),
	nextSibling: (node) => node.nextSibing,
	parentNode: (node) => node.parentNode,
};
