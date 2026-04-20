import { n as __require, t as __commonJSMin } from "../_runtime.mjs";
//#region ../node_modules/.bun/split2@4.2.0/node_modules/split2/index.js
var require_split2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { Transform } = __require("stream");
	const { StringDecoder } = __require("string_decoder");
	const kLast = Symbol("last");
	const kDecoder = Symbol("decoder");
	function transform(chunk, enc, cb) {
		let list;
		if (this.overflow) {
			list = this[kDecoder].write(chunk).split(this.matcher);
			if (list.length === 1) return cb();
			list.shift();
			this.overflow = false;
		} else {
			this[kLast] += this[kDecoder].write(chunk);
			list = this[kLast].split(this.matcher);
		}
		this[kLast] = list.pop();
		for (let i = 0; i < list.length; i++) try {
			push(this, this.mapper(list[i]));
		} catch (error) {
			return cb(error);
		}
		this.overflow = this[kLast].length > this.maxLength;
		if (this.overflow && !this.skipOverflow) {
			cb(/* @__PURE__ */ new Error("maximum buffer reached"));
			return;
		}
		cb();
	}
	function flush(cb) {
		this[kLast] += this[kDecoder].end();
		if (this[kLast]) try {
			push(this, this.mapper(this[kLast]));
		} catch (error) {
			return cb(error);
		}
		cb();
	}
	function push(self, val) {
		if (val !== void 0) self.push(val);
	}
	function noop(incoming) {
		return incoming;
	}
	function split(matcher, mapper, options) {
		matcher = matcher || /\r?\n/;
		mapper = mapper || noop;
		options = options || {};
		switch (arguments.length) {
			case 1:
				if (typeof matcher === "function") {
					mapper = matcher;
					matcher = /\r?\n/;
				} else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
					options = matcher;
					matcher = /\r?\n/;
				}
				break;
			case 2: if (typeof matcher === "function") {
				options = mapper;
				mapper = matcher;
				matcher = /\r?\n/;
			} else if (typeof mapper === "object") {
				options = mapper;
				mapper = noop;
			}
		}
		options = Object.assign({}, options);
		options.autoDestroy = true;
		options.transform = transform;
		options.flush = flush;
		options.readableObjectMode = true;
		const stream = new Transform(options);
		stream[kLast] = "";
		stream[kDecoder] = new StringDecoder("utf8");
		stream.matcher = matcher;
		stream.mapper = mapper;
		stream.maxLength = options.maxLength;
		stream.skipOverflow = options.skipOverflow || false;
		stream.overflow = false;
		stream._destroy = function(err, cb) {
			this._writableState.errorEmitted = false;
			cb(err);
		};
		return stream;
	}
	module.exports = split;
}));
//#endregion
//#region ../node_modules/.bun/pino-abstract-transport@3.0.0/node_modules/pino-abstract-transport/index.js
var require_pino_abstract_transport = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const metadata = Symbol.for("pino.metadata");
	const split = require_split2();
	const { Duplex } = __require("stream");
	const { parentPort, workerData } = __require("worker_threads");
	function createDeferred() {
		let resolve;
		let reject;
		const promise = new Promise((_resolve, _reject) => {
			resolve = _resolve;
			reject = _reject;
		});
		promise.resolve = resolve;
		promise.reject = reject;
		return promise;
	}
	module.exports = function build(fn, opts = {}) {
		const waitForConfig = opts.expectPinoConfig === true && workerData?.workerData?.pinoWillSendConfig === true;
		const parseLines = opts.parse === "lines";
		const parseLine = typeof opts.parseLine === "function" ? opts.parseLine : JSON.parse;
		const close = opts.close || defaultClose;
		const stream = split(function(line) {
			let value;
			try {
				value = parseLine(line);
			} catch (error) {
				this.emit("unknown", line, error);
				return;
			}
			if (value === null) {
				this.emit("unknown", line, "Null value ignored");
				return;
			}
			if (typeof value !== "object") value = {
				data: value,
				time: Date.now()
			};
			if (stream[metadata]) {
				stream.lastTime = value.time;
				stream.lastLevel = value.level;
				stream.lastObj = value;
			}
			if (parseLines) return line;
			return value;
		}, { autoDestroy: true });
		stream._destroy = function(err, cb) {
			const promise = close(err, cb);
			if (promise && typeof promise.then === "function") promise.then(cb, cb);
		};
		if (opts.expectPinoConfig === true && workerData?.workerData?.pinoWillSendConfig !== true) setImmediate(() => {
			stream.emit("error", /* @__PURE__ */ new Error("This transport is not compatible with the current version of pino. Please upgrade pino to the latest version."));
		});
		if (opts.metadata !== false) {
			stream[metadata] = true;
			stream.lastTime = 0;
			stream.lastLevel = 0;
			stream.lastObj = null;
		}
		if (waitForConfig) {
			let pinoConfig = {};
			const configReceived = createDeferred();
			parentPort.on("message", function handleMessage(message) {
				if (message.code === "PINO_CONFIG") {
					pinoConfig = message.config;
					configReceived.resolve();
					parentPort.off("message", handleMessage);
				}
			});
			Object.defineProperties(stream, {
				levels: { get() {
					return pinoConfig.levels;
				} },
				messageKey: { get() {
					return pinoConfig.messageKey;
				} },
				errorKey: { get() {
					return pinoConfig.errorKey;
				} }
			});
			return configReceived.then(finish);
		}
		return finish();
		function finish() {
			let res = fn(stream);
			if (res && typeof res.catch === "function") {
				res.catch((err) => {
					stream.destroy(err);
				});
				res = null;
			} else if (opts.enablePipelining && res) return Duplex.from({
				writable: stream,
				readable: res
			});
			return stream;
		}
	};
	function defaultClose(err, cb) {
		process.nextTick(cb, err);
	}
}));
//#endregion
export { require_pino_abstract_transport as t };
