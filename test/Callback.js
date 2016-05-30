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
	});

	it('does not accept a string', function() {
		// given
		let sut = new Callback('a string');

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).not.to.be.ok;
		expect(_.isFunction(internalCallback)).to.be.false;
	});

	it('does not accept an object', function() {
		// given
		let sut = new Callback({key: 'value'});

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).not.to.be.ok;
		expect(_.isFunction(internalCallback)).to.be.false;
	});

	it('does not accept an array of something but functions', function() {
		// given
		let sut = new Callback([4, 5]);

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).not.to.be.ok;
		expect(_.isFunction(internalCallback)).to.be.false;
	});

	it('does accept an array with a function as callback', function() {
		let sut = new Callback([() => {}, 5]);

		// when
		let internalCallback = sut.callback;

		// then
		expect(internalCallback).to.be.ok;
		expect(_.isFunction(internalCallback)).to.be.true;
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

	it('runs the callback async when called async', function(done) {
		// given
		let sut = new Callback(() => {
			// then
			done();
		});

		// when
		setTimeout(() => {sut.call()}, 10);
	});

	it('runs the callback async when called sync', function(done) {
		// given
		let calledAsync = false;
		process.nextTick(() => {
			calledAsync = true;
		});

		let sut = new Callback(() => {
			// then
			expect(calledAsync).to.be.true;
			done();
		});

		// when
		sut.call();
	});

	it('passed the arguments to the callback function', function(done) {
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

});