---
title: On the phone with Mom – Throttle and Delay DOM-Events in Javascript
author: Matthias Reuter
date: 2011-09-17
layout: article.html
originalPublishUrl: http://united-coders.com/matthias-reuter/on-the-phone-with-mom-throttle-and-delay-in-javascript/
originalPublishText: united-coders.com
---

Imagine you’re on the phone with your mom and she keeps on talking. And talking. And talking. And you keep on listening and listening. And listening. Every now and then your mom will throw in a “you still there?” to which you will murmur “uh huh”.

And while your mom keeps talking, you feel the increasing urge to answer to something she said, but being well raised, you don’t want to interrupt her, but wait until she is finished.

Now imagine being a Javascript (Come on, It’s not that hard, is it?).

    mom.addEventListener("talk", sayUhHuh, false);
    mom.addEventListener("talk", reply, false);

Depending on your mom, the `talk` event will fire frequently, and murmuring “uh huh” every tenth of a second might irritate her sooner or later. Worse, replying every tenth of a second will make the whole conversation incomprehensible.

So we somehow have to reduce the handling of the events. And we need two different ways. We want to say “uh huh”, but only, say every ten seconds. And we only want to reply once, when mom is finished. Since we don’t know for sure, when she is finished (unless she is a radio operator and finishes with “over”), we have to guess on the length of a pause. If she stops talking for half a second, we assume she’s just taking a huge breath (to rant about the neighbor’s dog), but if there’s a break for more than a second, we take our chance for a reply.

Let’s call the first way “throttle” and the second “delay”. How do we do that in Javascript?

    var throttleTimeout;

    function throttleUhHuh() {
      if (throttleTimeout) {
        return;
      }

      throttleTimeout = setTimeout(function () {
        throttleTimeout = null;
        sayUhHuh();
      }, 10000); // 10 seconds
    }

    mom.addEventListerner("talk", throttleUhHuh, false);

Here we do the throttling. Instead of calling the `sayUhHuh` function every time, we call a `throttleUhHuh` function. This function sets a timeout to call `sayUhHuh` after 10 seconds. If another `talk` event happens in the meantime, it is ignored (lines 4-6). We explicitly have to reset the `throttleTimeout` variable, so that future events after saying “uh huh” won’t be ignored (line 9).

    var delayTimeout;

    function delayReply() {
      clearTimeout(delayTimeout);

      delayTimeout = setTimeout(reply, 1000); // 1 second
    }

    mom.addEventListener("talk", delayReply, false);

This is how to do a delay. Again, instead of calling `reply` every time, we call a `delayReply` function. This function clears a previously set timeout (line 4) and sets a new one (line 6). Clearing a timeout even if there is none (or if the callback already was executed) does no harm, so we don’t have to check for the existence.

Now, apart from talking to your mom (I know, this is real important and stuff, but you might not be a Javascript and wonder how to apply what I said to your coding), where do we benefit from throttling and delaying in our every day work?

DOM events is the answer. Some of them happen too often, especially in certain browsers. A scroll event might fire 10-20 times in most browsers, but 400 times in Opera. If you do heavy calculations on scrolling, throttling is the answer. Mousemove is another one. If you implement some drag and drop behaviour, repositioning of the dragged object on every mousemove event will kill your script. You need throttling here too.

Form validation is another case, this time for a delay. If you want to validate the user input while it happens, you don’t want to do that on every keystroke, but wait until the user pauses for some time (usually a delay of 400ms is recommended). If you have an input field for an email, you should not blurt out “this is not a valid email address”, just after the user typed the first character.

You can have a look at a basic implementation of these usecases and fiddle around with them (try changing the timeout values) at [this JSFiddle][1].

[1]: http://jsfiddle.net/gweax/QfxEA/2/
