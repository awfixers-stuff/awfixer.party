import { t as __commonJSMin } from "../_runtime.mjs";
//#region ../node_modules/.bun/wrappy@1.0.2/node_modules/wrappy/wrappy.js
var require_wrappy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = wrappy;
	function wrappy(fn, cb) {
		if (fn && cb) return wrappy(fn)(cb);
		if (typeof fn !== "function") throw new TypeError("need wrapper function");
		Object.keys(fn).forEach(function(k) {
			wrapper[k] = fn[k];
		});
		return wrapper;
		function wrapper() {
			var args = new Array(arguments.length);
			for (var i = 0; i < args.length; i++) args[i] = arguments[i];
			var ret = fn.apply(this, args);
			var cb = args[args.length - 1];
			if (typeof ret === "function" && ret !== cb) Object.keys(cb).forEach(function(k) {
				ret[k] = cb[k];
			});
			return ret;
		}
	}
}));
//#endregion
//#region ../node_modules/.bun/once@1.3.3/node_modules/once/once.js
var require_once = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_wrappy()(once);
	once.proto = once(function() {
		Object.defineProperty(Function.prototype, "once", {
			value: function() {
				return once(this);
			},
			configurable: true
		});
	});
	function once(fn) {
		var f = function() {
			if (f.called) return f.value;
			f.called = true;
			return f.value = fn.apply(this, arguments);
		};
		f.called = false;
		return f;
	}
}));
//#endregion
//#region ../node_modules/.bun/end-of-stream@1.1.0/node_modules/end-of-stream/index.js
var require_end_of_stream = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var once = require_once();
	var noop = function() {};
	var isRequest = function(stream) {
		return stream.setHeader && typeof stream.abort === "function";
	};
	var isChildProcess = function(stream) {
		return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3;
	};
	var eos = function(stream, opts, callback) {
		if (typeof opts === "function") return eos(stream, null, opts);
		if (!opts) opts = {};
		callback = once(callback || noop);
		var ws = stream._writableState;
		var rs = stream._readableState;
		var readable = opts.readable || opts.readable !== false && stream.readable;
		var writable = opts.writable || opts.writable !== false && stream.writable;
		var onlegacyfinish = function() {
			if (!stream.writable) onfinish();
		};
		var onfinish = function() {
			writable = false;
			if (!readable) callback();
		};
		var onend = function() {
			readable = false;
			if (!writable) callback();
		};
		var onexit = function(exitCode) {
			callback(exitCode ? /* @__PURE__ */ new Error("exited with error code: " + exitCode) : null);
		};
		var onclose = function() {
			if (readable && !(rs && rs.ended)) return callback(/* @__PURE__ */ new Error("premature close"));
			if (writable && !(ws && ws.ended)) return callback(/* @__PURE__ */ new Error("premature close"));
		};
		var onrequest = function() {
			stream.req.on("finish", onfinish);
		};
		if (isRequest(stream)) {
			stream.on("complete", onfinish);
			stream.on("abort", onclose);
			if (stream.req) onrequest();
			else stream.on("request", onrequest);
		} else if (writable && !ws) {
			stream.on("end", onlegacyfinish);
			stream.on("close", onlegacyfinish);
		}
		if (isChildProcess(stream)) stream.on("exit", onexit);
		stream.on("end", onend);
		stream.on("finish", onfinish);
		if (opts.error !== false) stream.on("error", callback);
		stream.on("close", onclose);
		return function() {
			stream.removeListener("complete", onfinish);
			stream.removeListener("abort", onclose);
			stream.removeListener("request", onrequest);
			if (stream.req) stream.req.removeListener("finish", onfinish);
			stream.removeListener("end", onlegacyfinish);
			stream.removeListener("close", onlegacyfinish);
			stream.removeListener("finish", onfinish);
			stream.removeListener("exit", onexit);
			stream.removeListener("end", onend);
			stream.removeListener("error", callback);
			stream.removeListener("close", onclose);
		};
	};
	module.exports = eos;
}));
//#endregion
export { require_wrappy as n, require_end_of_stream as t };
