---
title: 'Better Javascript: Updates on the address book'
author: Matthias Reuter
date: 2010-03-02
layout: article.html
originalPublishUrl: http://united-coders.com/matthias-reuter/better-javascript-updates-on-the-address-book/
originalPublishText: united-coders.com
---

Last night I met Jennifer again and apart from being hot it turns out she’s pretty perceptive as well. When she read [my previous article][1], she objected to some aspects of my address book.

Her point is, it’s a waste of memory to store empty properties of an address. That’s true, so I sat down and threw away those unneccessary bits:

    var addresses = [{
        nickName  : "Mom",
        phoneNumber : "555-69-666"
    },
    {
        firstName : "Mathilda",
        lastName  : "Wozzle",
        phoneNumber : "555-343-37847"
    },
    {
        firstName : "Jennifer",
        phoneNumber : "555-467-4475"
    }];

Unfortunately, we now encounter some problems: First checking for an empty string no longer is sufficient, and second, since undefined is not a string, concatenating is a problem:

    var address = {
        nickName : "Mom",
        phoneNumber : "555-69-666"
    };
    address.firstName; // undefined
    address.firstName != ""; // true
    address.firstName + "" + address.lastName; // "undefinedundefined"

So what can we do to handle undefined as well? Several commenters liked the second implementation best, so let’s fix that first:

    var getDisplayName = function (address) {
        if (address.firstName != "" && address.firstName != undefined && address.lastName != "" && address.lastName != undefined) {

I stopped here because this definitely is not a good solution. Readability suffers greatly if we double check all properties this way. The solution to this – again – lies in the automatic type conversion of Javascript. Both empty strings and undefined convert to false.

    var getDisplayName = function (address) {
        if (address.firstName && address.lastName) {
            return address.firstName + " " + address.lastName;
        }
        else if (address.firstName) {
            return address.firstName;
        }
        else if (address.lastName) {
            return address.lastName;
        }
        else {
            return address.nickName;
        }
    };

Java developers might feel a bit uncomfortable with this, but hey, this is Javascript.

Now let’s try to fix the one-liner:

    return (address.firstName + (address.firstName && address.lastName ? " " : "") + address.lastName) || address.nickName;

We cannot just concatenate the different parts, because they might be undefined. We could instead provide default values like this

    return ((address.firstName || "") + (address.firstName && address.lastName ? " " : "") + (address.lastName || "")) || address.nickName;

but that is unreadable again. If we give up our goal of a one-liner, we could do this:

    var getDisplayName = function (address) {
        var first = address.firstName || "";
        var last  = address.lastName || "";
        var nick  = address.nickName || "";

        return (first + (first && last ? " " : "") + last) || nick;
    };

By renaming some variables, we can get a version even shorter than the original (103 bytes vs. 106 bytes, minified):

    var getDisplayName = function (address) {
        var f = address.firstName || "", l = address.lastName || "", n = address.nickName || "";
        return (f + (f && l ? " " : "") + l) || n;
    };

And still, there is a one-liner (shortened to improve legibility):

    return first && last ? first + " " + last : first || last || nick;

Jennifer had a second point. What’s the meaning of a nickname? It’s not the name I have for someone if he has no name. Instead it’s the name I have for someone even though he has a name. Therefore, the nickname should have precedence over first and last name. I assign the task of implementing to you.

[1]: https://gweax.de/blog/2010/02/better-javascript-three-women-and-one-address-book/
