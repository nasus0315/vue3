function createInvoker(nextVal) {
    const fn = (e) => fn.value(e);
    fn.value = nextVal;
    return fn;
}
export function patchEvent(el, rawName, nextVal) {
    const invokers = el._vei || (el._vei = {});
    let eventName = rawName.slice(2).toLowerCase();
    const existingInvoker = invokers[eventName];
    if(nextVal  && existingInvoker) { // 换绑
        existingInvoker.value = nextVal;
    } else {
        // 没有绑定过
        if(nextVal) {
           const invoker = invokers[eventName] = createInvoker(nextVal);
           el.addEventListener(eventName, invoker);
        } else if(existingInvoker){ // 没有新值，但是已经绑定过
            el.removeEventListener(eventName, existingInvoker);
            invokers[eventName] = null;
        }
    }
    
}