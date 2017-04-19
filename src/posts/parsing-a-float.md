---
title: Mr Parse-Float and his co-workers
author: Matthias Reuter
date: 2013-01-24
layout: article.html
---

Mr Parse-Float is a nice fella. He works in a number factory, where he turns strings into numbers. He has some co-workers, called Mr Implicit-Conversion and Mrs Number-Constructor. They all have the same task, but do it differently.

This is what they do:

    // parseFloat
    return parseFloat(s);

    // implicit conversion
    return +s;

    // Number constructor (without new)
    return Number(s);

Given a string like “436.26″, they all return the number 436.26, which is fine. However, given the slightly different string “436.28.2″, they do something different:

Mr Implicit-Conversion and Mrs Number-Constructor go: “436.28.2?” What is that? There should be only one point. That is not a number!

    Number("436.28.2") // NaN

Mr Parse-Float goes: “436″? OK, lets make that 436. “.28″? OK, add .28, so we have 436.28. “.2″? Hmmm. Weird. That can’t be part of a number. I’ll skip the rest. But hey, I have this 436.28, I’ll return that.

    parseFloat("436.28.2") // 436.28

So what’s the moral? When you’re not absolutely sure your string is syntactically a valid number, give it to parseFloat. Otherwise, you might end up with a hard to detect bug when checking the webkit version.

(Of course, Mr Implicit-Conversion and Mrs Number-Constructor work slightly faster in most factories aka browsers, but all three still manage to produce numbers by the million per second.)

----

Further reading:

- [ECMAScript on Number constructor called as a function][1]
- [ECMAScript on parseFloat][2]
- [Performance comparison of parseFloat and unary plus][3]

[1]: http://ecma262-5.com/ELS5_Section_15.htm#Section_15.7.1
[2]: http://ecma262-5.com/ELS5_Section_15.htm#Section_15.1.2.3
[3]: http://jsperf.com/parsefloat-versus-unary
