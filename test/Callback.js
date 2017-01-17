'use strict';

var expect = require('chai').expect;

var Callback = require('../index');
var _ = require('underscore');

describe('A callback object', function() {

	it('does not accept a number', function() {
		// given
		let sut = new Callback(5);

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).not.to.be.ok;
		expect(_.isFunction(internalCallback)).to.be.false;
		expect(sut.hasCallback).to.be.false;
		expect(sut.call()).to.be.false;
	});

	it('does not accept a string', function() {
		// given
		let sut = new Callback('a string');

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).not.to.be.ok;
		expect(_.isFunction(internalCallback)).to.be.false;
		expect(sut.hasCallback).to.be.false;
		expect(sut.call()).to.be.false;
	});

	it('does not accept an object', function() {
		// given
		let sut = new Callback({key: 'value'});

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).not.to.be.ok;
		expect(_.isFunction(internalCallback)).to.be.false;
		expect(sut.hasCallback).to.be.false;
		expect(sut.call()).to.be.false;
	});

	it('does not accept an array of something but functions', function() {
		// given
		let sut = new Callback([4, 5]);

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).not.to.be.ok;
		expect(_.isFunction(internalCallback)).to.be.false;
		expect(sut.hasCallback).to.be.false;
		expect(sut.call()).to.be.false;
	});

	it('does accept an array with a function as callback', function() {
		let sut = new Callback([() => {}, 5]);

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).to.be.ok;
		expect(_.isFunction(internalCallback)).to.be.true;
		expect(sut.hasCallback).to.be.true;
		expect(sut.call()).to.be.true;
	});

	it('chooses the last function in an array as callback', function() {
		// given
		let function1 = function() {};
		let function2 = function() {};
		let sut = new Callback(['a string', function1, 5, function2]);

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).to.be.ok;
		expect(internalCallback).to.be.equal(function2);
		expect(sut.hasCallback).to.be.true;
		expect(sut.call()).to.be.true;
	});

	it('accepts another Callback object', () => {
		// given
		let function1 = function() {};
		let cb = new Callback(function1);

		// when
		let cb2 = new Callback(cb);

		// then
		expect(cb2.callback).to.be.equal(function1);
		expect(cb2.hasCallback).to.be.true;
		expect(cb2.call()).to.be.true;
	});

	it('does not allow to run a copy again', (done) => {
		// given
		let numberOfCalls = 0;

		let function1 = function() {numberOfCalls++};
		let cb = new Callback(function1);

		// when
		let return1 = cb.call(); // first, call it
		let cb2 = new Callback(cb); // then create a copy (which has already been called)
		let return2 = cb2.call(); // and call the copy

		// then
		// then
		setTimeout(() => {
			expect(return1).to.be.true;
			expect(return2).to.be.true; // this is true though the call is not executed
			expect(numberOfCalls).to.equal(1);
			done();
		}, 10);
	});

	it('runs the callback async when called async', function(done) {
		// given
		let sut = new Callback(() => {
			// then
			done();
		});

		// when
		setTimeout(() => {
			expect(sut.call()).to.be.true;
		}, 10);
	});

	it('runs the callback async when called sync', function(done) {
		// given
		let calledAsync = false;
		process.nextTick(() => {
			calledAsync = true;
		});

		let returnValue = false;
		let sut = new Callback(() => {
			// then
			expect(calledAsync).to.be.true;
			expect(returnValue).to.be.true;
			done();
		});

		// when
		returnValue = sut.call();
	});

	it('passes the arguments to the callback function', function(done) {
		// given
		let sut = new Callback((a, b, c ,d ,e) => {
			// then
			expect(a).to.be.equal(1);
			expect(b).to.be.equal('two');
			expect(c.message).to.be.equal('this is an error');
			expect(d).not.be.ok;
			expect(e).to.be.an('Array');
			expect(e.length).to.be.equal(0);
			done();
		});

		// when
		sut.call(1, 'two', new Error('this is an error'), null, []);
	});

	it('calls the callback only once', function(done) {
		// given
		let numberOfCalls = 0;
		let sut = new Callback(() => {
			numberOfCalls++;
		});

		// when
		sut.call();
		sut.call();

		// then
		setTimeout(() => {
			expect(numberOfCalls).to.equal(1);
			done();
		}, 10);
	});

	describe('Magic Arguments', () => {

		it('does except the arguments objects', () => {
			// given
			let cb = function() {};
			let fn = function() {
				// then
				let sut = new Callback(arguments);
				expect(_.isFunction(sut.callback)).is.true;
				expect(sut.callback).is.equal(cb);
			};

			// when
			fn('one', 2, cb);
		});

		it('chooses the last function in the parameter list', function() {
			// given
			let function1 = function() {};
			let function2 = function() {};

			var runTest = function() {
				let sut = new Callback(arguments);

				// when
				let internalCallback = sut.callback;

				// then
				expect(internalCallback).to.be.ok;
				expect(internalCallback).to.be.equal(function2);
			}

			runTest(5, 'some string', function1, [], {}, function2);
		});

		it('returns the correct argument', () => {
			// given
			let cb = function() {};
			let fn = function(arg1, arg2, callback) {
				// then
				let sut = new Callback(arguments);
				expect(sut.callback).to.be.equal(cb);
				expect(sut.argumentAtPosition(0)).to.equal('one');
				expect(sut.argumentAtPosition(1)).to.equal(2);
			};

			// when
			fn('one', 2, cb);
		});

		it('returns null for an not-passed argument', () => {
			// given
			let cb = function() {};
			let fn = function(arg1, arg2, callback) {
				// then
				let sut = new Callback(arguments);
				expect(sut.callback).to.be.equal(cb);
				expect(sut.argumentAtPosition(0)).to.equal('one');
				expect(sut.argumentAtPosition(1)).to.be.null;
			};

			// when
			fn('one', cb);
		});

		it('returns the default value for an not-passed argument', () => {
			// given
			let cb = function() {};
			let fn = function(arg1, arg2, callback) {
				// then
				let sut = new Callback(arguments);
				expect(sut.callback).to.be.equal(cb);
				expect(sut.argumentAtPosition(0)).to.equal('one');
				expect(sut.argumentAtPosition(1, 'a string')).to.equal('a string');
			};

			// when
			fn('one', cb);
		});

	});

});