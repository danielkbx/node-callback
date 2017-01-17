/**
 * ISC License:
 * Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
 * Copyright (c) 1995-2003 by Internet Software Consortium
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted,
 * provided that the above copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND ISC DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL ISC BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF
 * CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS
 * SOFTWARE.
 */
'use strict';

var setupTick = function() {
	let instance = this;
	process.nextTick(() => {
		instance._ticked = true;
	});
};

class Callback {

	constructor(args) {
		this.arguments = [];
		this.callback = null;
		this._ticked = false;
		this._called = false;

		if (Callback.prototype.isPrototypeOf(args)) {
			// we're build with another instance of ourself
			// we copy every bit since we want to have the exact same behaviour
			this.arguments = args.arguments;
			this.callback = args.callback;
			this._ticked = args._ticked;
			this._called = args._called;
			return;
		}

		if (typeof args === 'function') {
			this.callback = args;
		} else if (typeof args !== 'undefined') {
			for (var i = args.length - 1; i >= 0; i--) {
				var arg = args[i];
				if (typeof arg === 'function' && !this.callback) {
					this.callback = arg;
				} else {
					this.arguments.push(arg);
				}
			}
		}

		this.arguments = this.arguments.reverse();

		if (this.callback) {
			setupTick.bind(this)();
		}
	}

	/**
	 * Returns the argument at the given position. If no argument at the position is found, null is returned.
	 * @param {Integer} index
	 * @returns {*}
	 */
	argumentAtPosition(index, defaultValue) {
		if (typeof defaultValue === 'undefined') {
			defaultValue = null;
		}

		if (index >= this.arguments.length) {
			return defaultValue;
		}

		return this.arguments[index];
	}
	
	/**
	 * Executes the callback and passes all arguments.
	 */
	call() {

		if (!this.hasCallback) {
			return false;
		}

		if (this._called) {
			return true;
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

		return true;
	}

	get hasCallback() {
		return (typeof this.callback === 'function');
	}
}

module.exports = Callback;