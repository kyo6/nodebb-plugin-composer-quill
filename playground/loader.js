(function (global) {
	const definitions = new Map();
	const modules = new Map();

	function define(name, deps, factory) {
		if (typeof name !== 'string') {
			throw new Error('Anonymous define is not supported in playground loader.');
		}
		definitions.set(name, { deps, factory });
	}

	function resolve(name) {
		if (modules.has(name)) {
			return modules.get(name);
		}

		if (!definitions.has(name)) {
			throw new Error(`Module not defined: ${name}`);
		}

		const { deps, factory } = definitions.get(name);
		const exports = {};
		const module = { exports };
		const args = deps.map((dep) => {
			if (dep === 'require') {
				return require;
			}
			if (dep === 'exports') {
				return exports;
			}
			if (dep === 'module') {
				return module;
			}
			return resolve(dep);
		});

		const result = typeof factory === 'function' ? factory.apply(global, args) : factory;
		const value = result !== undefined ? result : module.exports;
		modules.set(name, value);
		return value;
	}

	function require(deps, callback) {
		const names = Array.isArray(deps) ? deps : [deps];
		const values = names.map(resolve);
		if (typeof callback === 'function') {
			callback.apply(global, values);
		}
		return values.length === 1 ? values[0] : values;
	}

	define.amd = {};
	global.define = define;
	global.require = require;
})(window);
