# node-callback

node-callback is a little helper for easy and safe calling of callback functions. As in every asynchronous environment,
any function which accepts a callback parameter should either be **completely** synchronous **or** asynchronous.

That means, that even if the implementation of this function decides not to do anything, it should call the callback
function asynchronous when it does so in the other case.
Furthermore, callback parameters should always be optional.

So calling the callback parameter function results in a couple of lines to check the existance of the callback and to
 dispatch it to the next runloop if needed. Over and over again.

## Installation

As with every other node module run the following command

    npm install node-callback

and add a `--save` if needed.

## Test

Run the test suite with

    cd node_modules/node_callback
    npm test

## Usage

    var Callback = require('node-callback')

Assuming there is a function _asyncTask_ the callback could be handled like this

    function asyncTask(param1, callback) {
        let cb = new Callback(callback);

        if (!needToDoTheWork) {
            // nothing to do, we return here calling the callback
            return cb.call(null, result);
        } else {
            doTheWorkAsync((err) => {
                // after the async work is done we call the callback
                cb.call(err, result);
            });
        }
    };


For optional arguments, you can pass the _magical_ variable `arguments` to create the callback object:

    let cb = new Callback(arguments);

node-callback will use the last function that has been passed to the function. Applied to the example above:

    function asyncTask(param1, callback) {
        let cb = new Callback(arguments);

        if (!needToDoTheWork) {
            // nothing to do, we return here calling the callback
            return cb.call(null, result);
        } else {
            doTheWorkAsync((err) => {
                // after the async work is done we call the callback
                cb.call(err, result);
            });
        }
    };

`Callback.call()` will ensure that
- the function is only called if there really is a function to call
- the function is called not in the same runloop as the Callback object has been created
- only one call is executed
- parameters are passed to the _real_ callback in the same order

## Using _arguments_

Some functions might want to provide optional parameters. Since Javascript does not support default values for optional
parameters (or optional parameters at all), this causes a bunch of lines where the value of arguments is checked for null
so that the final list of arguments can be created.

When the callback object is created with the _arguments_ variable, the arguments of the function call be access by index:

    function task(value, options, mode, callback) {
        let cb = new Callback(arguments);
        console.log(cb.argumentAtPosition(2, 'asap'));
    }

    task(1, {key: 'value'}, 'slowly');
    // Output
    // 'slowly'

    task(1, {key: 'value'}, () => {});
    // Output
    // 'asap'

As always (in Javascript) this only works with optional arguments being expected at the end of the arguments list.