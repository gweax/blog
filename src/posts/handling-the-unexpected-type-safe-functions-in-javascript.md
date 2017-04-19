---
title: Handling the unexpected – Type safe functions in Javascript
author: Matthias Reuter
date: 2009-08-05
layout: article.html
originalPublishUrl: http://united-coders.com/matthias-reuter/handling-the-unexpected-type-safe-functions-in-javascript/
originalPublishText: united-coders.com
---

Javascript is a weird language. Great but weird. Take functions for example. You cannot only pass any type of arguments, you can also pass any number of arguments. This may be quite disturbing, especially for Java developers. Recently I had a discussion with a Java developer who complained about missing code assistance in Javascript, by which he meant no hint about the type of an argument.

This is of course due to the dynamically typed nature of Javascript. While in Java you denote the expected type of a parameter, and it's the caller's duty to pass the correct type (even more, you cannot pass a different type), in Javascript it's the function's duty to handle the given parameters and do something reasonable with unexpected types. The question arises: How do you write type safe functions in Javascript? Let me explain this by an example implementation to calculate the greatest common divisor of two numbers.

<aside>The greatest common divisor of two integers is the largest integer that divides these integers without a remainder. The greatest common divisor (or gcd for short) of 24 and 15 is 3, since 24 = 3 · 8 and 15 = 3 · 5.</aside>

This is a basic implementation to calculate the greatest common divisor. It's based upon the fact that `gcd(n,m) = gcd(n-m,m)` and `gcd(n,n) = n`. This is a very easy algorithm, though not the fastest.

    function greatestCommonDivisor (n, m) {
        if (n === m) {
            return n;
        }
        if (n < m) {
            return greatestCommonDivisor(n, m - n);
        }
        return greatestCommonDivisor(n - m, n);
    }

So now, how do you make this function type safe? It's a function for integers, how do you handle, for example, strings?

## Leave it to the user

The easiest answer is, you don't. Just leave the responsibility to the user. If he's to dumb to provide integers let him handle the consequences.

<aside>By the way, what happens when calling this function with strings? Interestingly, you might get the right result, `greatestCommonDivisor("24", "15")` returns 3, but this is sheer luck. `greatestCommonDivisor("9", "24")` results in an infinite loop.</aside>

The consequences could be (a) the right result (unlikely but possible), (b) an error thrown (ugly, but the user asked for it), (c) unexpected results like `NaN`, `null` or `undefined` (still ugly) or (d) an infinite loop. This last possibility should make us discard the easy answer. We might accept a (we surly would), b and c; d however is out of question.

## Type check arguments

So the second answer is to type check the arguments. We want numbers, so we reject anything else. How do we reject unexpected types? Throw an error, at least for now.

    function greatestCommonDivisor (n, m) {
        if (typeof n !== "number" || typeof m !== "number") {
            throw "Arguments must be numbers";
        )

        if (n === m) {
            return n;
        }
        if (n < m) {
            return greatestCommonDivisor(n, m - n);
        }
        return greatestCommonDivisor(n - m, n);
    }

## Convert arguments

While this is a valid solution, there are better. If n and m come from user input, it's likely they might be strings. Strings can be easily converted to numbers, so instead of rejecting them, we should convert them. This can be done by calling Number as a function:

    function greatestCommonDivisor (n, m) {
        n = Number(n);
        m = Number(m);

        // We had to change that check, since Number() might return NaN
        if (isNaN(n) || isNaN(m)) {
            throw new TypeError("Arguments must be numbers");
        )

        if (n === m) {
            return n;
        }
        if (n < m) {
            return greatestCommonDivisor(n, m - n);
        }
        return greatestCommonDivisor(n - m, n);
    }

## Better design

So now you know three concepts of handling unexpected types: Ignore them (might result in infinitive loops, bad), reject them (why give up so easily, bad) and convert them (good). The concept might be good, but the implementation lacks something. I'll show you what.

First (and that is a minor point) the algorithm is bad. If you pass negative numbers or zero, it results in an infinitive loop. This can be solved by taking the absolute value (`gcd(n,m)` equals `gcd(-n,m)`).

Second (a minor point as well) the greatest common divisor expects integers but conversion to number results in float values. This can be solved by using `parseInt()` instead of `Number()`.

The third point is a major. The function greatestCommonDivisor is called recursively. That means in every call we type convert and check the arguments, although after the first call we know the arguments have the correct type. There is an elegant solution. First, we convert and check the arguments. Then we define an inner function to do the calculation, which is then called recursively. Since we provide the arguments for the inner function, we don't have to check them again there.

The fourth is a minor point again. When dealing with numbers I'd rather not throw an error but return `NaN` instead. If the user provides arguments which result in `NaN`, we should just tell him so.

Therefore we get the following solution to how to write a type safe function in Javascript:

    function greatestCommonDivisor (n, m) {
        // convert n to an integer using parseInt,
        // take the absolute value to prevent infinitive loops
        n = Math.abs(parseInt(n, 10));

        // do the same for m
        m = Math.abs(parseInt(m, 10));

        // check if conversion led to NaN
        if (isNaN(n) || isNaN(m)) {
            return NaN;
        )

        // prevent infinite loop when one argument is zero
        if (n === 0) {
            return m;
        }
        if (m === 0) {
            return n;
        }

        // now the inner function
        var gcd = function (n, m) {
            // gcd(n,1) is 1, so prevent recursion to speed things up
            if (n === 1 || m === 1) {
                return 1;
            }
            if (n === m) {
                return n;
            }
            if (n < m) {
                return gcd(n, m - n);
            }
            return gcd(n - m, n);
        };

        // invoke the inner function
        return gcd(n, m);
    }

There, we're done! Now… wouldn't it be great to make type checking automated? Something like

    var typeSafeGcd = makeTypeSafe(greatestCommonDivisor, ["int", "int"]);
    typeSafeGcd(21, 15);       // would still return 3
    typeSafeGcd(21.5, "abc");  // would fail

<aside>Message from present me: I don't know why I thought it a good idea to delve into this when I wrote this article, but now I'm sure it's not. Just because something can be done, it doesn't mean it should. So take the following as a theoretical study, not a practical guideline.</aside>

Yes, this can be done and I will show you how. There are some drawbacks though. First, how do you automatically convert an unexpected type? It's easy for some types, for example if you expect a number. However, how do you convert a string to an array? Simply wrap the string? Split it somehow? Converting requires some thought and depends on the context. Therefore I don't think it's a good idea to do so automatically. That leaves checking types and rejecting unsupported ones.

Second, how do you reject unsupported types? You could either return `null`, `undefined` or `NaN` (depending on the context) or throw an error. Both ways lead to the user having to check the results of function calls. In other words, you push the responsibility to provide correct parameters off to the user. Graceful conversion definitely is the better alternative.

So keep on reading, if you still want to know how to automatically make a function type safe. This is heavy stuff. I do not expect you to understand it, if you are a beginner in Javascript. I try to explain everything in detail, so maybe you should give it a try.

So what do we want? We want some way to automatically check the given arguments by just telling which types we expect. We want to reject all other values. We want to reject the incorrect number of arguments. Let's start step by step.

    var makeTypeSafe = function (f, parameterList) {
        return f;
    };

We define a `makeTypeSafe` function that accepts two parameters: f, the function to make type safe, and parameterList, the list of expected types of arguments of f. This function does nothing so far except returning the original function.

Now reject the wrong number of arguments:

    var makeTypeSafe = function (f, parameterList) {
        var p = parameterList.length;

        // return a function that first checks the arguments before calling the
        // original function
        return function () {
            // check number of arguments
            if (arguments.length !== p) {
                throw "Unexpected number of arguments. Expected " + p + ", got " + arguments.length;
            }

            // call f, passing the arguments, preserving the context
            return f.apply(this, arguments);
        };
    };

Here we no longer return the original function but a new function. This new function checks if the number of arguments (`arguments.length`) is different from the expected number of arguments (`parameterList.length`). If so, it throws an error. If not, f is called (and its return value returned).

Need an example of how to use it? Here you are.

    var add = function (a, b) {
        return a + b;
    };

    var addIntegers = makeTypeSafe(add, ["int", "int"]);

    addIntegers(21);        // will throw an error
    addIntegers(21, 15);     // will return 36
    addIntegers("abc", 42); // will not throw an error

Why doesn't the last call throw an error? Because until now we only check the number of arguments, not the type. Let's change that.

    var types = {
        "int" : function (n) {
            // by comparing n to its floor value we see if it's an integer
            return n === Math.floor(n);
        }
    };

Here we define an object with one property, a function called int, which checks if a given argument is an integer. Since there is no integer type in Javascript, we do this by comparing n to its floor value (which is the same for integers).

Extending the `makeTypeSafe` function to check the types of arguments leads to the following code:

    var types = {
        "int" : function (n) {
            return n === Math.floor(n);
        }
    };

    var makeTypeSafe = function (f, parameterList) {
        return function () {
            // check number of arguments
            if (arguments.length !== parameterList.length) {
                throw "Unexpected number of arguments. Expected " + p + ", got " + arguments.length + ".";
            }

            // check every argument using the types functions defined above
            for (var i = 0, l = arguments.length; i < l; i++) {
                if (!types[parameterList[i]](arguments[i])) {
                    throw "Invalid argument at " + i + ". Argument must be of type " + parameterList[i] + ".";
                }
            }

            // call original function
            return f.apply(this, arguments);
        };
    };

That's basically the way to automatically check parameters before executing the original function. Now we can extend the types object to accept more types:

    var types = {
        "int" : function (n) {
            // by comparing n to its floor value we see if it's an integer
            return n === Math.floor(n);
        },

        "double" : function (n) {
            // NaN is a number as well, so check that n is not NaN
            return typeof n === "number" && !isNaN(n);
        },

        "string" : function (n) {
            return typeof n === "string";
        }
    };

We could even add more sophisticated types like natural numbers or arrays of integers.

    types["natural"] = function (n) {
        // replace > by >= if 0 is natural to you
        return types["int"](n) && n > 0;
    };

    types["int[]"] = function (n) {
        // accept only arrays
        if (!(n instanceof Array)) {
            return false;
        }
        // check if every element is an integer
        for (var i = 0, l = n.length; i < l; i++) {
            if (!types["int"](n[i])) {
                return false;
            }
        }
        return true;
    };
