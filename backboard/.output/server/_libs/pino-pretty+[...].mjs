import { n as __require, t as __commonJSMin } from "../_runtime.mjs";
import { n as require_sonic_boom } from "./pino+[...].mjs";
import { t as require_on_exit_leak_free } from "./on-exit-leak-free.mjs";
import { t as require_colorette } from "./colorette.mjs";
import { t as require_end_of_stream } from "./end-of-stream+once+wrappy.mjs";
import { t as require_once } from "./once.mjs";
import { t as require_pino_abstract_transport } from "./pino-abstract-transport+split2.mjs";
import { t as require_cjs } from "./fast-copy.mjs";
import { t as require_dateformat } from "./dateformat.mjs";
import { t as require_fast_safe_stringify } from "./fast-safe-stringify.mjs";
//#region ../node_modules/.bun/pump@3.0.4/node_modules/pump/index.js
var require_pump = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var once = require_once();
	var eos = require_end_of_stream();
	var fs;
	try {
		fs = __require("fs");
	} catch (e) {}
	var noop = function() {};
	var ancient = typeof process === "undefined" ? false : /^v?\.0/.test(process.version);
	var isFn = function(fn) {
		return typeof fn === "function";
	};
	var isFS = function(stream) {
		if (!ancient) return false;
		if (!fs) return false;
		return (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close);
	};
	var isRequest = function(stream) {
		return stream.setHeader && isFn(stream.abort);
	};
	var destroyer = function(stream, reading, writing, callback) {
		callback = once(callback);
		var closed = false;
		stream.on("close", function() {
			closed = true;
		});
		eos(stream, {
			readable: reading,
			writable: writing
		}, function(err) {
			if (err) return callback(err);
			closed = true;
			callback();
		});
		var destroyed = false;
		return function(err) {
			if (closed) return;
			if (destroyed) return;
			destroyed = true;
			if (isFS(stream)) return stream.close(noop);
			if (isRequest(stream)) return stream.abort();
			if (isFn(stream.destroy)) return stream.destroy();
			callback(err || /* @__PURE__ */ new Error("stream was destroyed"));
		};
	};
	var call = function(fn) {
		fn();
	};
	var pipe = function(from, to) {
		return from.pipe(to);
	};
	var pump = function() {
		var streams = Array.prototype.slice.call(arguments);
		var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop;
		if (Array.isArray(streams[0])) streams = streams[0];
		if (streams.length < 2) throw new Error("pump requires two streams per minimum");
		var error;
		var destroys = streams.map(function(stream, i) {
			var reading = i < streams.length - 1;
			return destroyer(stream, reading, i > 0, function(err) {
				if (!error) error = err;
				if (err) destroys.forEach(call);
				if (reading) return;
				destroys.forEach(call);
				callback(error);
			});
		});
		return streams.reduce(pipe);
	};
	module.exports = pump;
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	/**
	* A set of property names that indicate the value represents an error object.
	*
	* @typedef {string[]} K_ERROR_LIKE_KEYS
	*/
	module.exports = {
		DATE_FORMAT: "yyyy-mm-dd HH:MM:ss.l o",
		DATE_FORMAT_SIMPLE: "HH:MM:ss.l",
		ERROR_LIKE_KEYS: ["err", "error"],
		MESSAGE_KEY: "msg",
		LEVEL_KEY: "level",
		LEVEL_LABEL: "levelLabel",
		TIMESTAMP_KEY: "time",
		LEVELS: {
			default: "USERLVL",
			60: "FATAL",
			50: "ERROR",
			40: "WARN",
			30: "INFO",
			20: "DEBUG",
			10: "TRACE"
		},
		LEVEL_NAMES: {
			fatal: 60,
			error: 50,
			warn: 40,
			info: 30,
			debug: 20,
			trace: 10
		},
		LOGGER_KEYS: [
			"pid",
			"hostname",
			"name",
			"level",
			"time",
			"timestamp",
			"caller"
		]
	};
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/get-level-label-data.js
var require_get_level_label_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = getLevelLabelData;
	const { LEVELS, LEVEL_NAMES } = require_constants();
	/**
	* Given initial settings for custom levels/names and use of only custom props
	* get the level label that corresponds with a given level number
	*
	* @param {boolean} useOnlyCustomProps
	* @param {object} customLevels
	* @param {object} customLevelNames
	*
	* @returns {function} A function that takes a number level and returns the level's label string
	*/
	function getLevelLabelData(useOnlyCustomProps, customLevels, customLevelNames) {
		const levels = useOnlyCustomProps ? customLevels || LEVELS : Object.assign({}, LEVELS, customLevels);
		const levelNames = useOnlyCustomProps ? customLevelNames || LEVEL_NAMES : Object.assign({}, LEVEL_NAMES, customLevelNames);
		return function(level) {
			let levelNum = "default";
			if (Number.isInteger(+level)) levelNum = Object.prototype.hasOwnProperty.call(levels, level) ? level : levelNum;
			else levelNum = Object.prototype.hasOwnProperty.call(levelNames, level.toLowerCase()) ? levelNames[level.toLowerCase()] : levelNum;
			return [levels[levelNum], levelNum];
		};
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/colors.js
var require_colors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const nocolor = (input) => input;
	const plain = {
		default: nocolor,
		60: nocolor,
		50: nocolor,
		40: nocolor,
		30: nocolor,
		20: nocolor,
		10: nocolor,
		message: nocolor,
		greyMessage: nocolor,
		property: nocolor
	};
	const { createColors } = require_colorette();
	const getLevelLabelData = require_get_level_label_data();
	const availableColors = createColors({ useColor: true });
	const { white, bgRed, red, yellow, green, blue, gray, cyan, magenta } = availableColors;
	const colored = {
		default: white,
		60: bgRed,
		50: red,
		40: yellow,
		30: green,
		20: blue,
		10: gray,
		message: cyan,
		greyMessage: gray,
		property: magenta
	};
	function resolveCustomColoredColorizer(customColors) {
		return customColors.reduce(function(agg, [level, color]) {
			agg[level] = typeof availableColors[color] === "function" ? availableColors[color] : white;
			return agg;
		}, {
			default: white,
			message: cyan,
			greyMessage: gray,
			property: magenta
		});
	}
	function colorizeLevel(useOnlyCustomProps) {
		return function(level, colorizer, { customLevels, customLevelNames } = {}) {
			const [levelStr, levelNum] = getLevelLabelData(useOnlyCustomProps, customLevels, customLevelNames)(level);
			return Object.prototype.hasOwnProperty.call(colorizer, levelNum) ? colorizer[levelNum](levelStr) : colorizer.default(levelStr);
		};
	}
	function plainColorizer(useOnlyCustomProps) {
		const newPlainColorizer = colorizeLevel(useOnlyCustomProps);
		const customColoredColorizer = function(level, opts) {
			return newPlainColorizer(level, plain, opts);
		};
		customColoredColorizer.message = plain.message;
		customColoredColorizer.greyMessage = plain.greyMessage;
		customColoredColorizer.property = plain.property;
		customColoredColorizer.colors = createColors({ useColor: false });
		return customColoredColorizer;
	}
	function coloredColorizer(useOnlyCustomProps) {
		const newColoredColorizer = colorizeLevel(useOnlyCustomProps);
		const customColoredColorizer = function(level, opts) {
			return newColoredColorizer(level, colored, opts);
		};
		customColoredColorizer.message = colored.message;
		customColoredColorizer.property = colored.property;
		customColoredColorizer.greyMessage = colored.greyMessage;
		customColoredColorizer.colors = availableColors;
		return customColoredColorizer;
	}
	function customColoredColorizerFactory(customColors, useOnlyCustomProps) {
		const onlyCustomColored = resolveCustomColoredColorizer(customColors);
		const customColored = useOnlyCustomProps ? onlyCustomColored : Object.assign({}, colored, onlyCustomColored);
		const colorizeLevelCustom = colorizeLevel(useOnlyCustomProps);
		const customColoredColorizer = function(level, opts) {
			return colorizeLevelCustom(level, customColored, opts);
		};
		customColoredColorizer.colors = availableColors;
		customColoredColorizer.message = customColoredColorizer.message || customColored.message;
		customColoredColorizer.property = customColoredColorizer.property || customColored.property;
		customColoredColorizer.greyMessage = customColoredColorizer.greyMessage || customColored.greyMessage;
		return customColoredColorizer;
	}
	/**
	* Applies colorization, if possible, to a string representing the passed in
	* `level`. For example, the default colorizer will return a "green" colored
	* string for the "info" level.
	*
	* @typedef {function} ColorizerFunc
	* @param {string|number} level In either case, the input will map to a color
	* for the specified level or to the color for `USERLVL` if the level is not
	* recognized.
	* @property {function} message Accepts one string parameter that will be
	* colorized to a predefined color.
	* @property {Colorette.Colorette} colors Available color functions based on `useColor` (or `colorize`) context
	*/
	/**
	* Factory function get a function to colorized levels. The returned function
	* also includes a `.message(str)` method to colorize strings.
	*
	* @param {boolean} [useColors=false] When `true` a function that applies standard
	* terminal colors is returned.
	* @param {array[]} [customColors] Tuple where first item of each array is the
	* level index and the second item is the color
	* @param {boolean} [useOnlyCustomProps] When `true`, only use the provided
	* custom colors provided and not fallback to default
	*
	* @returns {ColorizerFunc} `function (level) {}` has a `.message(str)` method to
	* apply colorization to a string. The core function accepts either an integer
	* `level` or a `string` level. The integer level will map to a known level
	* string or to `USERLVL` if not known.  The string `level` will map to the same
	* colors as the integer `level` and will also default to `USERLVL` if the given
	* string is not a recognized level name.
	*/
	module.exports = function getColorizer(useColors = false, customColors, useOnlyCustomProps) {
		if (useColors && customColors !== void 0) return customColoredColorizerFactory(customColors, useOnlyCustomProps);
		else if (useColors) return coloredColorizer(useOnlyCustomProps);
		return plainColorizer(useOnlyCustomProps);
	};
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/noop.js
var require_noop = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function noop() {};
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/build-safe-sonic-boom.js
var require_build_safe_sonic_boom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = buildSafeSonicBoom;
	const { isMainThread } = __require("node:worker_threads");
	const SonicBoom = require_sonic_boom();
	const noop = require_noop();
	/**
	* Creates a safe SonicBoom instance
	*
	* @param {object} opts Options for SonicBoom
	*
	* @returns {object} A new SonicBoom stream
	*/
	function buildSafeSonicBoom(opts) {
		const stream = new SonicBoom(opts);
		stream.on("error", filterBrokenPipe);
		if (!opts.sync && isMainThread) setupOnExit(stream);
		return stream;
		function filterBrokenPipe(err) {
			if (err.code === "EPIPE") {
				stream.write = noop;
				stream.end = noop;
				stream.flushSync = noop;
				stream.destroy = noop;
				return;
			}
			stream.removeListener("error", filterBrokenPipe);
		}
	}
	function setupOnExit(stream) {
		/* istanbul ignore next */
		if (global.WeakRef && global.WeakMap && global.FinalizationRegistry) {
			const onExit = require_on_exit_leak_free();
			onExit.register(stream, autoEnd);
			stream.on("close", function() {
				onExit.unregister(stream);
			});
		}
	}
	/* istanbul ignore next */
	function autoEnd(stream, eventName) {
		if (stream.destroyed) return;
		if (eventName === "beforeExit") {
			stream.flush();
			stream.on("drain", function() {
				stream.end();
			});
		} else stream.flushSync();
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/is-valid-date.js
var require_is_valid_date = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = isValidDate;
	/**
	* Checks if the argument is a JS Date and not 'Invalid Date'.
	*
	* @param {Date} date The date to check.
	*
	* @returns {boolean} true if the argument is a JS Date and not 'Invalid Date'.
	*/
	function isValidDate(date) {
		return date instanceof Date && !Number.isNaN(date.getTime());
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/create-date.js
var require_create_date = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = createDate;
	const isValidDate = require_is_valid_date();
	/**
	* Constructs a JS Date from a number or string. Accepts any single number
	* or single string argument that is valid for the Date() constructor,
	* or an epoch as a string.
	*
	* @param {string|number} epoch The representation of the Date.
	*
	* @returns {Date} The constructed Date.
	*/
	function createDate(epoch) {
		let date = new Date(epoch);
		if (isValidDate(date)) return date;
		date = /* @__PURE__ */ new Date(+epoch);
		return date;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/split-property-key.js
var require_split_property_key = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = splitPropertyKey;
	/**
	* Splits the property key delimited by a dot character but not when it is preceded
	* by a backslash.
	*
	* @param {string} key A string identifying the property.
	*
	* @returns {string[]} Returns a list of string containing each delimited property.
	* e.g. `'prop2\.domain\.corp.prop2'` should return [ 'prop2.domain.com', 'prop2' ]
	*/
	function splitPropertyKey(key) {
		const result = [];
		let backslash = false;
		let segment = "";
		for (let i = 0; i < key.length; i++) {
			const c = key.charAt(i);
			if (c === "\\") {
				backslash = true;
				continue;
			}
			if (backslash) {
				backslash = false;
				segment += c;
				continue;
			}
			if (c === ".") {
				result.push(segment);
				segment = "";
				continue;
			}
			segment += c;
		}
		if (segment.length) result.push(segment);
		return result;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/get-property-value.js
var require_get_property_value = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = getPropertyValue;
	const splitPropertyKey = require_split_property_key();
	/**
	* Gets a specified property from an object if it exists.
	*
	* @param {object} obj The object to be searched.
	* @param {string|string[]} property A string, or an array of strings, identifying
	* the property to be retrieved from the object.
	* Accepts nested properties delimited by a `.`.
	* Delimiter can be escaped to preserve property names that contain the delimiter.
	* e.g. `'prop1.prop2'` or `'prop2\.domain\.corp.prop2'`.
	*
	* @returns {*}
	*/
	function getPropertyValue(obj, property) {
		const props = Array.isArray(property) ? property : splitPropertyKey(property);
		for (const prop of props) {
			if (!Object.prototype.hasOwnProperty.call(obj, prop)) return;
			obj = obj[prop];
		}
		return obj;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/delete-log-property.js
var require_delete_log_property = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = deleteLogProperty;
	const getPropertyValue = require_get_property_value();
	const splitPropertyKey = require_split_property_key();
	/**
	* Deletes a specified property from a log object if it exists.
	* This function mutates the passed in `log` object.
	*
	* @param {object} log The log object to be modified.
	* @param {string} property A string identifying the property to be deleted from
	* the log object. Accepts nested properties delimited by a `.`
	* Delimiter can be escaped to preserve property names that contain the delimiter.
	* e.g. `'prop1.prop2'` or `'prop2\.domain\.corp.prop2'`
	*/
	function deleteLogProperty(log, property) {
		const props = splitPropertyKey(property);
		const propToDelete = props.pop();
		log = getPropertyValue(log, props);
		/* istanbul ignore else */
		if (log !== null && typeof log === "object" && Object.prototype.hasOwnProperty.call(log, propToDelete)) delete log[propToDelete];
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/filter-log.js
var require_filter_log = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = filterLog;
	const { createCopier } = require_cjs();
	const fastCopy = createCopier({});
	const deleteLogProperty = require_delete_log_property();
	/**
	* @typedef {object} FilterLogParams
	* @property {object} log The log object to be modified.
	* @property {PrettyContext} context The context object built from parsing
	* the options.
	*/
	/**
	* Filter a log object by removing or including keys accordingly.
	* When `includeKeys` is passed, `ignoredKeys` will be ignored.
	* One of ignoreKeys or includeKeys must be pass in.
	*
	* @param {FilterLogParams} input
	*
	* @returns {object} A new `log` object instance that
	*  either only includes the keys in ignoreKeys
	*  or does not include those in ignoredKeys.
	*/
	function filterLog({ log, context }) {
		const { ignoreKeys, includeKeys } = context;
		const logCopy = fastCopy(log);
		if (includeKeys) {
			const logIncluded = {};
			includeKeys.forEach((key) => {
				logIncluded[key] = logCopy[key];
			});
			return logIncluded;
		}
		ignoreKeys.forEach((ignoreKey) => {
			deleteLogProperty(logCopy, ignoreKey);
		});
		return logCopy;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/format-time.js
var require_format_time = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = formatTime;
	const { DATE_FORMAT, DATE_FORMAT_SIMPLE } = require_constants();
	const dateformat = require_dateformat();
	const createDate = require_create_date();
	const isValidDate = require_is_valid_date();
	/**
	* Converts a given `epoch` to a desired display format.
	*
	* @param {number|string} epoch The time to convert. May be any value that is
	* valid for `new Date()`.
	* @param {boolean|string} [translateTime=false] When `false`, the given `epoch`
	* will simply be returned. When `true`, the given `epoch` will be converted
	* to a string at UTC using the `DATE_FORMAT_SIMPLE` constant. If `translateTime` is
	* a string, the following rules are available:
	*
	* - `<format string>`: The string is a literal format string. This format
	* string will be used to interpret the `epoch` and return a display string
	* at UTC.
	* - `SYS:STANDARD`: The returned display string will follow the `DATE_FORMAT`
	* constant at the system's local timezone.
	* - `SYS:<format string>`: The returned display string will follow the given
	* `<format string>` at the system's local timezone.
	* - `UTC:<format string>`: The returned display string will follow the given
	* `<format string>` at UTC.
	*
	* @returns {number|string} The formatted time.
	*/
	function formatTime(epoch, translateTime = false) {
		if (translateTime === false) return epoch;
		const instant = createDate(epoch);
		if (!isValidDate(instant)) return epoch;
		if (translateTime === true) return dateformat(instant, DATE_FORMAT_SIMPLE);
		const upperFormat = translateTime.toUpperCase();
		if (upperFormat === "SYS:STANDARD") return dateformat(instant, DATE_FORMAT);
		const prefix = upperFormat.substr(0, 4);
		if (prefix === "SYS:" || prefix === "UTC:") {
			if (prefix === "UTC:") return dateformat(instant, translateTime);
			return dateformat(instant, translateTime.slice(4));
		}
		return dateformat(instant, `UTC:${translateTime}`);
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/handle-custom-levels-names-opts.js
var require_handle_custom_levels_names_opts = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = handleCustomLevelsNamesOpts;
	/**
	* Parse a CSV string or options object that maps level
	* labels to level values.
	*
	* @param {string|object} cLevels An object mapping level
	* names to level values, e.g. `{ info: 30, debug: 65 }`, or a
	* CSV string in the format `level_name:level_value`, e.g.
	* `info:30,debug:65`.
	*
	* @returns {object} An object mapping levels names to level values
	* e.g. `{ info: 30, debug: 65 }`.
	*/
	function handleCustomLevelsNamesOpts(cLevels) {
		if (!cLevels) return {};
		if (typeof cLevels === "string") return cLevels.split(",").reduce((agg, value, idx) => {
			const [levelName, levelNum = idx] = value.split(":");
			agg[levelName.toLowerCase()] = levelNum;
			return agg;
		}, {});
		else if (Object.prototype.toString.call(cLevels) === "[object Object]") return Object.keys(cLevels).reduce((agg, levelName) => {
			agg[levelName.toLowerCase()] = cLevels[levelName];
			return agg;
		}, {});
		else return {};
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/handle-custom-levels-opts.js
var require_handle_custom_levels_opts = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = handleCustomLevelsOpts;
	/**
	* Parse a CSV string or options object that specifies
	* configuration for custom levels.
	*
	* @param {string|object} cLevels An object mapping level
	* names to values, e.g. `{ info: 30, debug: 65 }`, or a
	* CSV string in the format `level_name:level_value`, e.g.
	* `info:30,debug:65`.
	*
	* @returns {object} An object mapping levels to labels that
	* appear in logs, e.g. `{ '30': 'INFO', '65': 'DEBUG' }`.
	*/
	function handleCustomLevelsOpts(cLevels) {
		if (!cLevels) return {};
		if (typeof cLevels === "string") return cLevels.split(",").reduce((agg, value, idx) => {
			const [levelName, levelNum = idx] = value.split(":");
			agg[levelNum] = levelName.toUpperCase();
			return agg;
		}, { default: "USERLVL" });
		else if (Object.prototype.toString.call(cLevels) === "[object Object]") return Object.keys(cLevels).reduce((agg, levelName) => {
			agg[cLevels[levelName]] = levelName.toUpperCase();
			return agg;
		}, { default: "USERLVL" });
		else return {};
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/interpret-conditionals.js
var require_interpret_conditionals = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = interpretConditionals;
	const getPropertyValue = require_get_property_value();
	/**
	* Translates all conditional blocks from within the messageFormat. Translates
	* any matching {if key}{key}{end} statements and returns everything between
	* if and else blocks if the key provided was found in log.
	*
	* @param {MessageFormatString|MessageFormatFunction} messageFormat A format
	* string or function that defines how the logged message should be
	* conditionally formatted.
	* @param {object} log The log object to be modified.
	*
	* @returns {string} The parsed messageFormat.
	*/
	function interpretConditionals(messageFormat, log) {
		messageFormat = messageFormat.replace(/{if (.*?)}(.*?){end}/g, replacer);
		messageFormat = messageFormat.replace(/{if (.*?)}/g, "");
		messageFormat = messageFormat.replace(/{end}/g, "");
		return messageFormat.replace(/\s+/g, " ").trim();
		function replacer(_, key, value) {
			const propertyValue = getPropertyValue(log, key);
			if (propertyValue && value.includes(key)) return value.replace(new RegExp("{" + key + "}", "g"), propertyValue);
			else return "";
		}
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/is-object.js
var require_is_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = isObject;
	function isObject(input) {
		return Object.prototype.toString.apply(input) === "[object Object]";
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/join-lines-with-indentation.js
var require_join_lines_with_indentation = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = joinLinesWithIndentation;
	/**
	* @typedef {object} JoinLinesWithIndentationParams
	* @property {string} input The string to split and reformat.
	* @property {string} [ident] The indentation string. Default: `    ` (4 spaces).
	* @property {string} [eol] The end of line sequence to use when rejoining
	* the lines. Default: `'\n'`.
	*/
	/**
	* Given a string with line separators, either `\r\n` or `\n`, add indentation
	* to all lines subsequent to the first line and rejoin the lines using an
	* end of line sequence.
	*
	* @param {JoinLinesWithIndentationParams} input
	*
	* @returns {string} A string with lines subsequent to the first indented
	* with the given indentation sequence.
	*/
	function joinLinesWithIndentation({ input, ident = "    ", eol = "\n" }) {
		const lines = input.split(/\r?\n/);
		for (let i = 1; i < lines.length; i += 1) lines[i] = ident + lines[i];
		return lines.join(eol);
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/parse-factory-options.js
var require_parse_factory_options = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = parseFactoryOptions;
	const { LEVEL_NAMES } = require_constants();
	const colors = require_colors();
	const handleCustomLevelsOpts = require_handle_custom_levels_opts();
	const handleCustomLevelsNamesOpts = require_handle_custom_levels_names_opts();
	const handleLevelLabelData = require_get_level_label_data();
	/**
	* A `PrettyContext` is an object to be used by the various functions that
	* process log data. It is derived from the provided {@link PinoPrettyOptions}.
	* It may be used as a `this` context.
	*
	* @typedef {object} PrettyContext
	* @property {string} EOL The escape sequence chosen as the line terminator.
	* @property {string} IDENT The string to use as the indentation sequence.
	* @property {ColorizerFunc} colorizer A configured colorizer function.
	* @property {Array[Array<number, string>]} customColors A set of custom color
	* names associated with level numbers.
	* @property {object} customLevelNames A hash of level numbers to level names,
	* e.g. `{ 30: "info" }`.
	* @property {object} customLevels A hash of level names to level numbers,
	* e.g. `{ info: 30 }`.
	* @property {CustomPrettifiers} customPrettifiers A hash of custom prettifier
	* functions.
	* @property {object} customProperties Comprised of `customLevels` and
	* `customLevelNames` if such options are provided.
	* @property {string[]} errorLikeObjectKeys The key names in the log data that
	* should be considered as holding error objects.
	* @property {string[]} errorProps A list of error object keys that should be
	* included in the output.
	* @property {function} getLevelLabelData Pass a numeric level to return [levelLabelString,levelNum]
	* @property {boolean} hideObject Indicates the prettifier should omit objects
	* in the output.
	* @property {string[]} ignoreKeys Set of log data keys to omit.
	* @property {string[]} includeKeys Opposite of `ignoreKeys`.
	* @property {boolean} levelFirst Indicates the level should be printed first.
	* @property {string} levelKey Name of the key in the log data that contains
	* the message.
	* @property {string} levelLabel Format token to represent the position of the
	* level name in the output string.
	* @property {MessageFormatString|MessageFormatFunction} messageFormat
	* @property {string} messageKey Name of the key in the log data that contains
	* the message.
	* @property {string|number} minimumLevel The minimum log level to process
	* and output.
	* @property {ColorizerFunc} objectColorizer
	* @property {boolean} singleLine Indicates objects should be printed on a
	* single output line.
	* @property {string} timestampKey The name of the key in the log data that
	* contains the log timestamp.
	* @property {boolean} translateTime Indicates if timestamps should be
	* translated to a human-readable string.
	* @property {boolean} useOnlyCustomProps
	*/
	/**
	* @param {PinoPrettyOptions} options The user supplied object of options.
	*
	* @returns {PrettyContext}
	*/
	function parseFactoryOptions(options) {
		const EOL = options.crlf ? "\r\n" : "\n";
		const IDENT = "    ";
		const { customPrettifiers, errorLikeObjectKeys, hideObject, levelFirst, levelKey, levelLabel, messageFormat, messageKey, minimumLevel, singleLine, timestampKey, translateTime } = options;
		const errorProps = options.errorProps.split(",");
		const useOnlyCustomProps = typeof options.useOnlyCustomProps === "boolean" ? options.useOnlyCustomProps : options.useOnlyCustomProps === "true";
		const customLevels = handleCustomLevelsOpts(options.customLevels);
		const customLevelNames = handleCustomLevelsNamesOpts(options.customLevels);
		const getLevelLabelData = handleLevelLabelData(useOnlyCustomProps, customLevels, customLevelNames);
		let customColors;
		if (options.customColors) if (typeof options.customColors === "string") customColors = options.customColors.split(",").reduce((agg, value) => {
			const [level, color] = value.split(":");
			const levelNum = (useOnlyCustomProps ? options.customLevels : customLevelNames[level] !== void 0) ? customLevelNames[level] : LEVEL_NAMES[level];
			const colorIdx = levelNum !== void 0 ? levelNum : level;
			agg.push([colorIdx, color]);
			return agg;
		}, []);
		else if (typeof options.customColors === "object") customColors = Object.keys(options.customColors).reduce((agg, value) => {
			const [level, color] = [value, options.customColors[value]];
			const levelNum = (useOnlyCustomProps ? options.customLevels : customLevelNames[level] !== void 0) ? customLevelNames[level] : LEVEL_NAMES[level];
			const colorIdx = levelNum !== void 0 ? levelNum : level;
			agg.push([colorIdx, color]);
			return agg;
		}, []);
		else throw new Error("options.customColors must be of type string or object.");
		const customProperties = {
			customLevels,
			customLevelNames
		};
		if (useOnlyCustomProps === true && !options.customLevels) {
			customProperties.customLevels = void 0;
			customProperties.customLevelNames = void 0;
		}
		const includeKeys = options.include !== void 0 ? new Set(options.include.split(",")) : void 0;
		const ignoreKeys = !includeKeys && options.ignore ? new Set(options.ignore.split(",")) : void 0;
		const colorizer = colors(options.colorize, customColors, useOnlyCustomProps);
		const objectColorizer = options.colorizeObjects ? colorizer : colors(false, [], false);
		return {
			EOL,
			IDENT,
			colorizer,
			customColors,
			customLevelNames,
			customLevels,
			customPrettifiers,
			customProperties,
			errorLikeObjectKeys,
			errorProps,
			getLevelLabelData,
			hideObject,
			ignoreKeys,
			includeKeys,
			levelFirst,
			levelKey,
			levelLabel,
			messageFormat,
			messageKey,
			minimumLevel,
			objectColorizer,
			singleLine,
			timestampKey,
			translateTime,
			useOnlyCustomProps
		};
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/prettify-error.js
var require_prettify_error = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = prettifyError;
	const joinLinesWithIndentation = require_join_lines_with_indentation();
	/**
	* @typedef {object} PrettifyErrorParams
	* @property {string} keyName The key assigned to this error in the log object.
	* @property {string} lines The STRINGIFIED error. If the error field has a
	*  custom prettifier, that should be pre-applied as well.
	* @property {string} ident The indentation sequence to use.
	* @property {string} eol The EOL sequence to use.
	*/
	/**
	* Prettifies an error string into a multi-line format.
	*
	* @param {PrettifyErrorParams} input
	*
	* @returns {string}
	*/
	function prettifyError({ keyName, lines, eol, ident }) {
		let result = "";
		const splitLines = `${ident}${keyName}: ${joinLinesWithIndentation({
			input: lines,
			ident,
			eol
		})}${eol}`.split(eol);
		for (let j = 0; j < splitLines.length; j += 1) {
			if (j !== 0) result += eol;
			const line = splitLines[j];
			if (/^\s*"stack"/.test(line)) {
				const matches = /^(\s*"stack":)\s*(".*"),?$/.exec(line);
				/* istanbul ignore else */
				if (matches && matches.length === 3) {
					const indentSize = /^\s*/.exec(line)[0].length + 4;
					const indentation = " ".repeat(indentSize);
					const stackMessage = matches[2];
					result += matches[1] + eol + indentation + JSON.parse(stackMessage).replace(/\n/g, eol + indentation);
				} else result += line;
			} else result += line;
		}
		return result;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/prettify-object.js
var require_prettify_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = prettifyObject;
	const { LOGGER_KEYS } = require_constants();
	const stringifySafe = require_fast_safe_stringify();
	const joinLinesWithIndentation = require_join_lines_with_indentation();
	const prettifyError = require_prettify_error();
	/**
	* @typedef {object} PrettifyObjectParams
	* @property {object} log The object to prettify.
	* @property {boolean} [excludeLoggerKeys] Indicates if known logger specific
	* keys should be excluded from prettification. Default: `true`.
	* @property {string[]} [skipKeys] A set of object keys to exclude from the
	*  * prettified result. Default: `[]`.
	* @property {PrettyContext} context The context object built from parsing
	* the options.
	*/
	/**
	* Prettifies a standard object. Special care is taken when processing the object
	* to handle child objects that are attached to keys known to contain error
	* objects.
	*
	* @param {PrettifyObjectParams} input
	*
	* @returns {string} The prettified string. This can be as little as `''` if
	* there was nothing to prettify.
	*/
	function prettifyObject({ log, excludeLoggerKeys = true, skipKeys = [], context }) {
		const { EOL: eol, IDENT: ident, customPrettifiers, errorLikeObjectKeys: errorLikeKeys, objectColorizer, singleLine, colorizer } = context;
		const keysToIgnore = [].concat(skipKeys);
		/* istanbul ignore else */
		if (excludeLoggerKeys === true) Array.prototype.push.apply(keysToIgnore, LOGGER_KEYS);
		let result = "";
		const { plain, errors } = Object.entries(log).reduce(({ plain, errors }, [k, v]) => {
			if (keysToIgnore.includes(k) === false) {
				const pretty = typeof customPrettifiers[k] === "function" ? customPrettifiers[k](v, k, log, { colors: colorizer.colors }) : v;
				if (errorLikeKeys.includes(k)) errors[k] = pretty;
				else plain[k] = pretty;
			}
			return {
				plain,
				errors
			};
		}, {
			plain: {},
			errors: {}
		});
		if (singleLine) {
			/* istanbul ignore else */
			if (Object.keys(plain).length > 0) result += objectColorizer.greyMessage(stringifySafe(plain));
			result += eol;
			result = result.replace(/\\\\/gi, "\\");
		} else Object.entries(plain).forEach(([keyName, keyValue]) => {
			let lines = typeof customPrettifiers[keyName] === "function" ? keyValue : stringifySafe(keyValue, null, 2);
			if (lines === void 0) return;
			lines = lines.replace(/\\\\/gi, "\\");
			const joinedLines = joinLinesWithIndentation({
				input: lines,
				ident,
				eol
			});
			result += `${ident}${objectColorizer.property(keyName)}:${joinedLines.startsWith(eol) ? "" : " "}${joinedLines}${eol}`;
		});
		Object.entries(errors).forEach(([keyName, keyValue]) => {
			const lines = typeof customPrettifiers[keyName] === "function" ? keyValue : stringifySafe(keyValue, null, 2);
			if (lines === void 0) return;
			result += prettifyError({
				keyName,
				lines,
				eol,
				ident
			});
		});
		return result;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/prettify-error-log.js
var require_prettify_error_log = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = prettifyErrorLog;
	const { LOGGER_KEYS } = require_constants();
	const isObject = require_is_object();
	const joinLinesWithIndentation = require_join_lines_with_indentation();
	const prettifyObject = require_prettify_object();
	/**
	* @typedef {object} PrettifyErrorLogParams
	* @property {object} log The error log to prettify.
	* @property {PrettyContext} context The context object built from parsing
	* the options.
	*/
	/**
	* Given a log object that has a `type: 'Error'` key, prettify the object and
	* return the result. In other
	*
	* @param {PrettifyErrorLogParams} input
	*
	* @returns {string} A string that represents the prettified error log.
	*/
	function prettifyErrorLog({ log, context }) {
		const { EOL: eol, IDENT: ident, errorProps: errorProperties, messageKey } = context;
		const stack = log.stack;
		let result = `${ident}${joinLinesWithIndentation({
			input: stack,
			ident,
			eol
		})}${eol}`;
		if (errorProperties.length > 0) {
			const excludeProperties = LOGGER_KEYS.concat(messageKey, "type", "stack");
			let propertiesToPrint;
			if (errorProperties[0] === "*") propertiesToPrint = Object.keys(log).filter((k) => excludeProperties.includes(k) === false);
			else propertiesToPrint = errorProperties.filter((k) => excludeProperties.includes(k) === false);
			for (let i = 0; i < propertiesToPrint.length; i += 1) {
				const key = propertiesToPrint[i];
				if (key in log === false) continue;
				if (isObject(log[key])) {
					const prettifiedObject = prettifyObject({
						log: log[key],
						excludeLoggerKeys: false,
						context: {
							...context,
							IDENT: ident + ident
						}
					});
					result = `${result}${ident}${key}: {${eol}${prettifiedObject}${ident}}${eol}`;
					continue;
				}
				result = `${result}${ident}${key}: ${log[key]}${eol}`;
			}
		}
		return result;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/prettify-level.js
var require_prettify_level = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = prettifyLevel;
	const getPropertyValue = require_get_property_value();
	/**
	* @typedef {object} PrettifyLevelParams
	* @property {object} log The log object.
	* @property {PrettyContext} context The context object built from parsing
	* the options.
	*/
	/**
	* Checks if the passed in log has a `level` value and returns a prettified
	* string for that level if so.
	*
	* @param {PrettifyLevelParams} input
	*
	* @returns {undefined|string} If `log` does not have a `level` property then
	* `undefined` will be returned. Otherwise, a string from the specified
	* `colorizer` is returned.
	*/
	function prettifyLevel({ log, context }) {
		const { colorizer, customLevels, customLevelNames, levelKey, getLevelLabelData } = context;
		const prettifier = context.customPrettifiers?.level;
		const output = getPropertyValue(log, levelKey);
		if (output === void 0) return void 0;
		const labelColorized = colorizer(output, {
			customLevels,
			customLevelNames
		});
		if (prettifier) {
			const [label] = getLevelLabelData(output);
			return prettifier(output, levelKey, log, {
				label,
				labelColorized,
				colors: colorizer.colors
			});
		}
		return labelColorized;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/prettify-message.js
var require_prettify_message = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = prettifyMessage;
	const { LEVELS } = require_constants();
	const getPropertyValue = require_get_property_value();
	const interpretConditionals = require_interpret_conditionals();
	/**
	* @typedef {object} PrettifyMessageParams
	* @property {object} log The log object with the message to colorize.
	* @property {PrettyContext} context The context object built from parsing
	* the options.
	*/
	/**
	* Prettifies a message string if the given `log` has a message property.
	*
	* @param {PrettifyMessageParams} input
	*
	* @returns {undefined|string} If the message key is not found, or the message
	* key is not a string, then `undefined` will be returned. Otherwise, a string
	* that is the prettified message.
	*/
	function prettifyMessage({ log, context }) {
		const { colorizer, customLevels, levelKey, levelLabel, messageFormat, messageKey, useOnlyCustomProps } = context;
		if (messageFormat && typeof messageFormat === "string") {
			const parsedMessageFormat = interpretConditionals(messageFormat, log);
			const message = String(parsedMessageFormat).replace(/{([^{}]+)}/g, function(match, p1) {
				let level;
				if (p1 === levelLabel && (level = getPropertyValue(log, levelKey)) !== void 0) return (useOnlyCustomProps ? customLevels === void 0 : customLevels[level] === void 0) ? LEVELS[level] : customLevels[level];
				const value = getPropertyValue(log, p1);
				return value !== void 0 ? value : "";
			});
			return colorizer.message(message);
		}
		if (messageFormat && typeof messageFormat === "function") {
			const msg = messageFormat(log, messageKey, levelLabel, { colors: colorizer.colors });
			return colorizer.message(msg);
		}
		if (messageKey in log === false) return void 0;
		if (typeof log[messageKey] !== "string" && typeof log[messageKey] !== "number" && typeof log[messageKey] !== "boolean") return void 0;
		return colorizer.message(log[messageKey]);
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/prettify-metadata.js
var require_prettify_metadata = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = prettifyMetadata;
	/**
	* @typedef {object} PrettifyMetadataParams
	* @property {object} log The log that may or may not contain metadata to
	* be prettified.
	* @property {PrettyContext} context The context object built from parsing
	* the options.
	*/
	/**
	* Prettifies metadata that is usually present in a Pino log line. It looks for
	* fields `name`, `pid`, `hostname`, and `caller` and returns a formatted string using
	* the fields it finds.
	*
	* @param {PrettifyMetadataParams} input
	*
	* @returns {undefined|string} If no metadata is found then `undefined` is
	* returned. Otherwise, a string of prettified metadata is returned.
	*/
	function prettifyMetadata({ log, context }) {
		const { customPrettifiers: prettifiers, colorizer } = context;
		let line = "";
		if (log.name || log.pid || log.hostname) {
			line += "(";
			if (log.name) line += prettifiers.name ? prettifiers.name(log.name, "name", log, { colors: colorizer.colors }) : log.name;
			if (log.pid) {
				const prettyPid = prettifiers.pid ? prettifiers.pid(log.pid, "pid", log, { colors: colorizer.colors }) : log.pid;
				if (log.name && log.pid) line += "/" + prettyPid;
				else line += prettyPid;
			}
			if (log.hostname) {
				const prettyHostname = prettifiers.hostname ? prettifiers.hostname(log.hostname, "hostname", log, { colors: colorizer.colors }) : log.hostname;
				line += `${line === "(" ? "on" : " on"} ${prettyHostname}`;
			}
			line += ")";
		}
		if (log.caller) {
			const prettyCaller = prettifiers.caller ? prettifiers.caller(log.caller, "caller", log, { colors: colorizer.colors }) : log.caller;
			line += `${line === "" ? "" : " "}<${prettyCaller}>`;
		}
		if (line === "") return;
		else return line;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/prettify-time.js
var require_prettify_time = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = prettifyTime;
	const formatTime = require_format_time();
	/**
	* @typedef {object} PrettifyTimeParams
	* @property {object} log The log object with the timestamp to be prettified.
	* @property {PrettyContext} context The context object built from parsing
	* the options.
	*/
	/**
	* Prettifies a timestamp if the given `log` has either `time`, `timestamp` or custom specified timestamp
	* property.
	*
	* @param {PrettifyTimeParams} input
	*
	* @returns {undefined|string} If a timestamp property cannot be found then
	* `undefined` is returned. Otherwise, the prettified time is returned as a
	* string.
	*/
	function prettifyTime({ log, context }) {
		const { timestampKey, translateTime: translateFormat } = context;
		const prettifier = context.customPrettifiers?.time;
		let time = null;
		if (timestampKey in log) time = log[timestampKey];
		else if ("timestamp" in log) time = log.timestamp;
		if (time === null) return void 0;
		const output = translateFormat ? formatTime(time, translateFormat) : time;
		return prettifier ? prettifier(output) : `[${output}]`;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/utils/index.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		buildSafeSonicBoom: require_build_safe_sonic_boom(),
		createDate: require_create_date(),
		deleteLogProperty: require_delete_log_property(),
		filterLog: require_filter_log(),
		formatTime: require_format_time(),
		getPropertyValue: require_get_property_value(),
		handleCustomLevelsNamesOpts: require_handle_custom_levels_names_opts(),
		handleCustomLevelsOpts: require_handle_custom_levels_opts(),
		interpretConditionals: require_interpret_conditionals(),
		isObject: require_is_object(),
		isValidDate: require_is_valid_date(),
		joinLinesWithIndentation: require_join_lines_with_indentation(),
		noop: require_noop(),
		parseFactoryOptions: require_parse_factory_options(),
		prettifyErrorLog: require_prettify_error_log(),
		prettifyError: require_prettify_error(),
		prettifyLevel: require_prettify_level(),
		prettifyMessage: require_prettify_message(),
		prettifyMetadata: require_prettify_metadata(),
		prettifyObject: require_prettify_object(),
		prettifyTime: require_prettify_time(),
		splitPropertyKey: require_split_property_key(),
		getLevelLabelData: require_get_level_label_data()
	};
}));
/**
* A hash of log property names mapped to prettifier functions. When the
* incoming log data is being processed for prettification, any key on the log
* that matches a key in a custom prettifiers hash will be prettified using
* that matching custom prettifier. The value passed to the custom prettifier
* will the value associated with the corresponding log key.
*
* The hash may contain any arbitrary keys for arbitrary log properties, but it
* may also contain a set of predefined key names that map to well-known log
* properties. These keys are:
*
* + `time` (for the timestamp field)
* + `level` (for the level label field; value may be a level number instead
* of a level label)
* + `hostname`
* + `pid`
* + `name`
* + `caller`
*
* @typedef {Object.<string, CustomPrettifierFunc>} CustomPrettifiers
*/
/**
* A synchronous function to be used for prettifying a log property. It must
* return a string.
*
* @typedef {function} CustomPrettifierFunc
* @param {any} value The value to be prettified for the key associated with
* the prettifier.
* @returns {string}
*/
/**
* A tokenized string that indicates how the prettified log line should be
* formatted. Tokens are either log properties enclosed in curly braces, e.g.
* `{levelLabel}`, `{pid}`, or `{req.url}`, or conditional directives in curly
* braces. The only conditional directives supported are `if` and `end`, e.g.
* `{if pid}{pid}{end}`; every `if` must have a matching `end`. Nested
* conditions are not supported.
*
* @typedef {string} MessageFormatString
*
* @example
* `{levelLabel} - {if pid}{pid} - {end}url:{req.url}`
*/
/**
* @typedef {object} PrettifyMessageExtras
* @property {object} colors Available color functions based on `useColor` (or `colorize`) context
* the options.
*/
/**
* A function that accepts a log object, name of the message key, and name of
* the level label key and returns a formatted log line.
*
* Note: this function must be synchronous.
*
* @typedef {function} MessageFormatFunction
* @param {object} log The log object to be processed.
* @param {string} messageKey The name of the key in the `log` object that
* contains the log message.
* @param {string} levelLabel The name of the key in the `log` object that
* contains the log level name.
* @param {PrettifyMessageExtras} extras Additional data available for message context
* @returns {string}
*
* @example
* function (log, messageKey, levelLabel) {
*   return `${log[levelLabel]} - ${log[messageKey]}`
* }
*/
//#endregion
//#region ../node_modules/.bun/secure-json-parse@4.1.0/node_modules/secure-json-parse/index.js
var require_secure_json_parse = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const hasBuffer = typeof Buffer !== "undefined";
	const suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
	const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
	/**
	* @description Internal parse function that parses JSON text with security checks.
	* @private
	* @param {string|Buffer} text - The JSON text string or Buffer to parse.
	* @param {Function} [reviver] - The JSON.parse() optional reviver argument.
	* @param {import('./types').ParseOptions} [options] - Optional configuration object.
	* @returns {*} The parsed object.
	* @throws {SyntaxError} If a forbidden prototype property is found and `options.protoAction` or
	* `options.constructorAction` is `'error'`.
	*/
	function _parse(text, reviver, options) {
		if (options == null) {
			if (reviver !== null && typeof reviver === "object") {
				options = reviver;
				reviver = void 0;
			}
		}
		if (hasBuffer && Buffer.isBuffer(text)) text = text.toString();
		if (text && text.charCodeAt(0) === 65279) text = text.slice(1);
		const obj = JSON.parse(text, reviver);
		if (obj === null || typeof obj !== "object") return obj;
		const protoAction = options && options.protoAction || "error";
		const constructorAction = options && options.constructorAction || "error";
		if (protoAction === "ignore" && constructorAction === "ignore") return obj;
		if (protoAction !== "ignore" && constructorAction !== "ignore") {
			if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) return obj;
		} else if (protoAction !== "ignore" && constructorAction === "ignore") {
			if (suspectProtoRx.test(text) === false) return obj;
		} else if (suspectConstructorRx.test(text) === false) return obj;
		return filter(obj, {
			protoAction,
			constructorAction,
			safe: options && options.safe
		});
	}
	/**
	* @description Scans and filters an object for forbidden prototype properties.
	* @param {Object} obj - The object being scanned.
	* @param {import('./types').ParseOptions} [options] - Optional configuration object.
	* @returns {Object|null} The filtered object, or `null` if safe mode is enabled and issues are found.
	* @throws {SyntaxError} If a forbidden prototype property is found and `options.protoAction` or
	* `options.constructorAction` is `'error'`.
	*/
	function filter(obj, { protoAction = "error", constructorAction = "error", safe } = {}) {
		let next = [obj];
		while (next.length) {
			const nodes = next;
			next = [];
			for (const node of nodes) {
				if (protoAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "__proto__")) {
					if (safe === true) return null;
					else if (protoAction === "error") throw new SyntaxError("Object contains forbidden prototype property");
					delete node.__proto__;
				}
				if (constructorAction !== "ignore" && Object.prototype.hasOwnProperty.call(node, "constructor") && node.constructor !== null && typeof node.constructor === "object" && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
					if (safe === true) return null;
					else if (constructorAction === "error") throw new SyntaxError("Object contains forbidden prototype property");
					delete node.constructor;
				}
				for (const key in node) {
					const value = node[key];
					if (value && typeof value === "object") next.push(value);
				}
			}
		}
		return obj;
	}
	/**
	* @description Parses a given JSON-formatted text into an object.
	* @param {string|Buffer} text - The JSON text string or Buffer to parse.
	* @param {Function} [reviver] - The `JSON.parse()` optional reviver argument, or options object.
	* @param {import('./types').ParseOptions} [options] - Optional configuration object.
	* @returns {*} The parsed object.
	* @throws {SyntaxError} If the JSON text is malformed or contains forbidden prototype properties
	* when `options.protoAction` or `options.constructorAction` is `'error'`.
	*/
	function parse(text, reviver, options) {
		const { stackTraceLimit } = Error;
		Error.stackTraceLimit = 0;
		try {
			return _parse(text, reviver, options);
		} finally {
			Error.stackTraceLimit = stackTraceLimit;
		}
	}
	/**
	* @description Safely parses a given JSON-formatted text into an object.
	* @param {string|Buffer} text - The JSON text string or Buffer to parse.
	* @param {Function} [reviver] - The `JSON.parse()` optional reviver argument.
	* @returns {*|null|undefined} The parsed object, `null` if security issues found, or `undefined` on parse error.
	*/
	function safeParse(text, reviver) {
		const { stackTraceLimit } = Error;
		Error.stackTraceLimit = 0;
		try {
			return _parse(text, reviver, { safe: true });
		} catch {
			return;
		} finally {
			Error.stackTraceLimit = stackTraceLimit;
		}
	}
	module.exports = parse;
	module.exports.default = parse;
	module.exports.parse = parse;
	module.exports.safeParse = safeParse;
	module.exports.scan = filter;
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/lib/pretty.js
var require_pretty = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = pretty;
	const sjs = require_secure_json_parse();
	const isObject = require_is_object();
	const prettifyErrorLog = require_prettify_error_log();
	const prettifyLevel = require_prettify_level();
	const prettifyMessage = require_prettify_message();
	const prettifyMetadata = require_prettify_metadata();
	const prettifyObject = require_prettify_object();
	const prettifyTime = require_prettify_time();
	const filterLog = require_filter_log();
	const { LEVELS, LEVEL_KEY, LEVEL_NAMES } = require_constants();
	const jsonParser = (input) => {
		try {
			return { value: sjs.parse(input, { protoAction: "remove" }) };
		} catch (err) {
			return { err };
		}
	};
	/**
	* Orchestrates processing the received log data according to the provided
	* configuration and returns a prettified log string.
	*
	* @typedef {function} LogPrettifierFunc
	* @param {string|object} inputData A log string or a log-like object.
	* @returns {string} A string that represents the prettified log data.
	*/
	function pretty(inputData) {
		let log;
		if (!isObject(inputData)) {
			const parsed = jsonParser(inputData);
			if (parsed.err || !isObject(parsed.value)) return inputData + this.EOL;
			log = parsed.value;
		} else log = inputData;
		if (this.minimumLevel) {
			let condition;
			if (this.useOnlyCustomProps) condition = this.customLevels;
			else condition = this.customLevelNames[this.minimumLevel] !== void 0;
			let minimum;
			if (condition) minimum = this.customLevelNames[this.minimumLevel];
			else minimum = LEVEL_NAMES[this.minimumLevel];
			if (!minimum) minimum = typeof this.minimumLevel === "string" ? LEVEL_NAMES[this.minimumLevel] : LEVEL_NAMES[LEVELS[this.minimumLevel].toLowerCase()];
			if (log[this.levelKey === void 0 ? LEVEL_KEY : this.levelKey] < minimum) return;
		}
		const prettifiedMessage = prettifyMessage({
			log,
			context: this.context
		});
		if (this.ignoreKeys || this.includeKeys) log = filterLog({
			log,
			context: this.context
		});
		const prettifiedLevel = prettifyLevel({
			log,
			context: {
				...this.context,
				...this.context.customProperties
			}
		});
		const prettifiedMetadata = prettifyMetadata({
			log,
			context: this.context
		});
		const prettifiedTime = prettifyTime({
			log,
			context: this.context
		});
		let line = "";
		if (this.levelFirst && prettifiedLevel) line = `${prettifiedLevel}`;
		if (prettifiedTime && line === "") line = `${prettifiedTime}`;
		else if (prettifiedTime) line = `${line} ${prettifiedTime}`;
		if (!this.levelFirst && prettifiedLevel) if (line.length > 0) line = `${line} ${prettifiedLevel}`;
		else line = prettifiedLevel;
		if (prettifiedMetadata) if (line.length > 0) line = `${line} ${prettifiedMetadata}:`;
		else line = prettifiedMetadata;
		if (line.endsWith(":") === false && line !== "") line += ":";
		if (prettifiedMessage !== void 0) if (line.length > 0) line = `${line} ${prettifiedMessage}`;
		else line = prettifiedMessage;
		if (line.length > 0 && !this.singleLine) line += this.EOL;
		if (log.type === "Error" && typeof log.stack === "string") {
			const prettifiedErrorLog = prettifyErrorLog({
				log,
				context: this.context
			});
			if (this.singleLine) line += this.EOL;
			line += prettifiedErrorLog;
		} else if (this.hideObject === false) {
			const skipKeys = [
				this.messageKey,
				this.levelKey,
				this.timestampKey
			].map((key) => key.replaceAll(/\\/g, "")).filter((key) => {
				return typeof log[key] === "string" || typeof log[key] === "number" || typeof log[key] === "boolean";
			});
			const prettifiedObject = prettifyObject({
				log,
				skipKeys,
				context: this.context
			});
			if (this.singleLine && !/^\s$/.test(prettifiedObject)) line += " ";
			line += prettifiedObject;
		}
		return line;
	}
}));
//#endregion
//#region ../node_modules/.bun/pino-pretty@13.1.3/node_modules/pino-pretty/index.js
var require_pino_pretty = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	const { isColorSupported } = require_colorette();
	const pump = require_pump();
	const { Transform } = __require("node:stream");
	const abstractTransport = require_pino_abstract_transport();
	const colors = require_colors();
	const { ERROR_LIKE_KEYS, LEVEL_KEY, LEVEL_LABEL, MESSAGE_KEY, TIMESTAMP_KEY } = require_constants();
	const { buildSafeSonicBoom, parseFactoryOptions } = require_utils();
	const pretty = require_pretty();
	/**
	* @typedef {object} PinoPrettyOptions
	* @property {boolean} [colorize] Indicates if colors should be used when
	* prettifying. The default will be determined by the terminal capabilities at
	* run time.
	* @property {boolean} [colorizeObjects=true] Apply coloring to rendered objects
	* when coloring is enabled.
	* @property {boolean} [crlf=false] End lines with `\r\n` instead of `\n`.
	* @property {string|null} [customColors=null] A comma separated list of colors
	* to use for specific level labels, e.g. `err:red,info:blue`.
	* @property {string|null} [customLevels=null] A comma separated list of user
	* defined level names and numbers, e.g. `err:99,info:1`.
	* @property {CustomPrettifiers} [customPrettifiers={}] A set of prettifier
	* functions to apply to keys defined in this object.
	* @property {K_ERROR_LIKE_KEYS} [errorLikeObjectKeys] A list of string property
	* names to consider as error objects.
	* @property {string} [errorProps=''] A comma separated list of properties on
	* error objects to include in the output.
	* @property {boolean} [hideObject=false] When `true`, data objects will be
	* omitted from the output (except for error objects).
	* @property {string} [ignore='hostname'] A comma separated list of log keys
	* to omit when outputting the prettified log information.
	* @property {undefined|string} [include=undefined] A comma separated list of
	* log keys to include in the prettified log information. Only the keys in this
	* list will be included in the output.
	* @property {boolean} [levelFirst=false] When true, the log level will be the
	* first field in the prettified output.
	* @property {string} [levelKey='level'] The key name in the log data that
	* contains the level value for the log.
	* @property {string} [levelLabel='levelLabel'] Token name to use in
	* `messageFormat` to represent the name of the logged level.
	* @property {null|MessageFormatString|MessageFormatFunction} [messageFormat=null]
	* When a string, defines how the prettified line should be formatted according
	* to defined tokens. When a function, a synchronous function that returns a
	* formatted string.
	* @property {string} [messageKey='msg'] Defines the key in incoming logs that
	* contains the message of the log, if present.
	* @property {undefined|string|number} [minimumLevel=undefined] The minimum
	* level for logs that should be processed. Any logs below this level will
	* be omitted.
	* @property {object} [outputStream=process.stdout] The stream to write
	* prettified log lines to.
	* @property {boolean} [singleLine=false] When `true` any objects, except error
	* objects, in the log data will be printed as a single line instead as multiple
	* lines.
	* @property {string} [timestampKey='time'] Defines the key in incoming logs
	* that contains the timestamp of the log, if present.
	* @property {boolean|string} [translateTime=true] When true, will translate a
	* JavaScript date integer into a human-readable string. If set to a string,
	* it must be a format string.
	* @property {boolean} [useOnlyCustomProps=true] When true, only custom levels
	* and colors will be used if they have been provided.
	*/
	/**
	* The default options that will be used when prettifying log lines.
	*
	* @type {PinoPrettyOptions}
	*/
	const defaultOptions = {
		colorize: isColorSupported,
		colorizeObjects: true,
		crlf: false,
		customColors: null,
		customLevels: null,
		customPrettifiers: {},
		errorLikeObjectKeys: ERROR_LIKE_KEYS,
		errorProps: "",
		hideObject: false,
		ignore: "hostname",
		include: void 0,
		levelFirst: false,
		levelKey: LEVEL_KEY,
		levelLabel: LEVEL_LABEL,
		messageFormat: null,
		messageKey: MESSAGE_KEY,
		minimumLevel: void 0,
		outputStream: process.stdout,
		singleLine: false,
		timestampKey: TIMESTAMP_KEY,
		translateTime: true,
		useOnlyCustomProps: true
	};
	/**
	* Processes the supplied options and returns a function that accepts log data
	* and produces a prettified log string.
	*
	* @param {PinoPrettyOptions} options Configuration for the prettifier.
	* @returns {LogPrettifierFunc}
	*/
	function prettyFactory(options) {
		const context = parseFactoryOptions(Object.assign({}, defaultOptions, options));
		return pretty.bind({
			...context,
			context
		});
	}
	/**
	* @typedef {PinoPrettyOptions} BuildStreamOpts
	* @property {object|number|string} [destination] A destination stream, file
	* descriptor, or target path to a file.
	* @property {boolean} [append]
	* @property {boolean} [mkdir]
	* @property {boolean} [sync=false]
	*/
	/**
	* Constructs a {@link LogPrettifierFunc} and a stream to which the produced
	* prettified log data will be written.
	*
	* @param {BuildStreamOpts} opts
	* @returns {Transform | (Transform & OnUnknown)}
	*/
	function build(opts = {}) {
		let pretty = prettyFactory(opts);
		let destination;
		return abstractTransport(function(source) {
			source.on("message", function pinoConfigListener(message) {
				if (!message || message.code !== "PINO_CONFIG") return;
				Object.assign(opts, {
					messageKey: message.config.messageKey,
					errorLikeObjectKeys: Array.from(new Set([...opts.errorLikeObjectKeys || ERROR_LIKE_KEYS, message.config.errorKey])),
					customLevels: message.config.levels.values
				});
				pretty = prettyFactory(opts);
				source.off("message", pinoConfigListener);
			});
			const stream = new Transform({
				objectMode: true,
				autoDestroy: true,
				transform(chunk, enc, cb) {
					cb(null, pretty(chunk));
				}
			});
			if (typeof opts.destination === "object" && typeof opts.destination.write === "function") destination = opts.destination;
			else destination = buildSafeSonicBoom({
				dest: opts.destination || 1,
				append: opts.append,
				mkdir: opts.mkdir,
				sync: opts.sync
			});
			source.on("unknown", function(line) {
				destination.write(line + "\n");
			});
			pump(source, stream, destination);
			return stream;
		}, {
			parse: "lines",
			close(err, cb) {
				destination.on("close", () => {
					cb(err);
				});
			}
		});
	}
	module.exports = build;
	module.exports.build = build;
	module.exports.PinoPretty = build;
	module.exports.prettyFactory = prettyFactory;
	module.exports.colorizerFactory = colors;
	module.exports.isColorSupported = isColorSupported;
	module.exports.default = build;
}));
//#endregion
export { require_pino_pretty as t };
