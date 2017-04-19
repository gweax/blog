---
title: 'Javascript Challenge: Lotto Number Generator'
author: Matthias Reuter
date: 2009-09-23
layout: article.html
originalPublishUrl: http://united-coders.com/christian-harms/javascript-challenge-lotto-number-generator/
originalPublishText: united-coders.com
originalPublishNote: Somehow it's credited to a different author there.
---

The German lottery currently holds a jackpot of about 30 million Euro. A friend of mine took the bait and participated yesterday. Since he is a software developer, he wrote a small program to get him six random numbers in the range of 1 and 49.

Well, it's not difficult to write such a program. The challenge is to do so in little bytes. So I challenge you:

Write a JavaScript function that generates random lotto numbers. This function has to return an array of six different numbers from 1 to 49 (including both) in ascending order. You may use features of ECMA-262-3 only, that means no Array.contains and stuff. You must not induce global variables.

The function has to look like this

    function getRandomLottoNumbers() {
        // your implementation here
    }

Minify your function using JSMin or any other minfier and count the bytes between the outer curly braces.

To participate in this challenge, simply post your solution as a comment.

**Spoiler warning** In the following I describe the steps I took for my solution. Don't read if you want to submit your own.

## First steps

First attempt. My idea is to generate an array containing the numbers from 1 to 49 and then remove elements until six remain. 117 bytes.

    function getRandomLottoNumbers() {
        var n = [];

        for (var i = 1; i < 50; i++) {
            n.push(i);
        }

        while (n.length > 6) {
            n.splice(Math.floor(Math.random() * n.length), 1);
        }

        return n;
    }

First optimization: n.length is used twice, so store it in a variable. Use i, since that is defined already. 114 bytes.

    function getRandomLottoNumbers() {
        var n = [];

        for (var i = 1; i < 50; i++) {
            n.push(i);
        }

        while ((i = n.length) > 6) {
            n.splice(Math.floor(Math.random() * i), 1);
        }

        return n;
    }

Next step: optimize variable declaration. Saves one var. 112 bytes.

    function getRandomLottoNumbers() {
        var n = [], i;

        for (i = 1; i < 50; i++) {
            n.push(i);
        }

        while ((i = n.length) > 6) {
            n.splice(Math.floor(Math.random() * i), 1);
        }

        return n;
    }

Now I changed the algorithm. I switched from a while-loop to a for-loop, which saves another four bytes: 108 bytes.

    function getRandomLottoNumbers() {
        var n = [], i;

        for (i = 1; i < 50; i++) {
            n.push(i);
        }

        for (i = 49; i > 6; i--) {
            n.splice(Math.floor(Math.random() * i), 1);
        }

        return n;
    }

## Below 100 bytes

Don't you think, `Math.floor(Math.random() * i)` could be written shorter? Yes, it can. I accidentally stumbled upon a way today. Replace it by `Math.random() * i | 0`. Saves 10 bytes, we're down to 98.

    function getRandomLottoNumbers() {
        var n = [], i;

        for (i = 1; i < 50; i++) {
            n.push(i);
        }

        for (i = 49; i > 6; i--) {
            n.splice(i * Math.random() | 0, 1);
        }

        return n;
    }

Save another byte moving the initializing of i one line up. This leaves an empty first statement in the for-loop, but that's still valid JS. 97 bytes.

    function getRandomLottoNumbers() {
        var n = [], i = 1;

        for (; i < 50; i++) {
            n.push(i);
        }

        for (i = 49; i > 6; i--) {
            n.splice(i * Math.random() | 0, 1);
        }

        return n;
    }

Now if the first loop starts at 0 and runs until 49, we don't have to initialize the second for-loop. Saves two bytes, down to 95.

    function getRandomLottoNumbers() {
        var n = [], i = 0;

        for (; i < 49; i++) {
            n.push(i + 1);
        }

        for (; i > 6; i--) {
            n.splice(i * Math.random() | 0, 1);
        }

        return n;
    }

Save another four bytes by moving the incrementation and decrementation of i. 91 bytes.

    function getRandomLottoNumbers() {
        var n = [], i = 0;

        for (; ++i < 50;) {
            n.push(i);
        }

        for (; --i > 6;) {
            n.splice(i * Math.random() | 0, 1);
        }

        return n;
    }

## <s>Final</s> solution

Now, Douglas Crockford will hate me for this, but some semicolons are optional in Javascript. Remove them to get my final solution of 88 bytes:

    function getRandomLottoNumbers() {
        var n = [], i = 0;

        for (; ++i < 50;) {
            n.push(i)
        }

        for (; --i > 6;) {
            n.splice(i * Math.random() | 0, 1)
        }

        return n
    }

## Addendum, 09/23/2009 16:02

Aww, curly braces are optional in my case. Needs two semicolons again, but saves four braces. 86 bytes

    function getRandomLottoNumbers() {
        var n = [], i = 0;

        for (; ++i < 50;) n.push(i);

        for (; --i > 6;) n.splice(i * Math.random() | 0, 1);

        return n
    }

Minimized it's this:

    function getRandomLottoNumbers() {
    var n=[],i=0;for(;++i<50;)n.push(i);for(;--i>6;)n.splice(i*Math.random()|0,1);return n
    }
