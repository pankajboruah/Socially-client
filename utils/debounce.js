/* eslint-disable */
function debounce(callback, timer) {
	let timeoutNum;
	let callbackReturnVal;
	return function (args, flush) {
		function h() {
			timeoutNum = null;
			callbackReturnVal = callback.apply(that, [arg]);
			return callbackReturnVal;
		}
		var that = this;
		var arg = args;
		clearTimeout(timeoutNum);
		!flush && (timeoutNum = setTimeout(h, timer));
		flush && h();
		return callbackReturnVal;
	};
}

export default debounce;
