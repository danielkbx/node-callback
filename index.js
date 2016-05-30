'use strict';

var setupTick = function() {
	let instance = this;
	process.nextTick(() => {
		instance._ticked = true;
	});
};

class Callback {

	constructor(args) {
		this.callback = null;
		this._ticked = false;
		this._called = false;

		if (typeof args === 'function') {
			this.callback = args;
		} else if (typeof args !== 'undefined') {
			for (var i = args.length; i >= 0; i--) {
				var arg = args[i];
				if (typeof arg === 'function') {
					this.callback = arg;
					break;
				}
			}
		}

		if (this.callback) {
			setupTick.bind(this)();
		}
	}

	/**
	 * Executes the callback and passes all arguments.
	 */
	call() {
		if (this._called) {
			return;
		}
		
		if (this._ticked) {
			if (typeof this.callback === 'function') {
				this._called = true;
				this.callback.apply(this, arguments);
			}
		} else {
			var functionToCall = this.callback;
			var argumentsToUse = arguments;
			this._called = true;
			process.nextTick(function () {
				if (typeof functionToCall === 'function') {
					functionToCall.apply(this, argumentsToUse);
				}
			});
		}
	}
}

module.exports = Callback;