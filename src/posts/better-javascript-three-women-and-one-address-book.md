---
title: 'Better Javascript: Three women and one address book'
author: Matthias Reuter
date: 2010-02-16
layout: article.html
originalPublishUrl: http://united-coders.com/matthias-reuter/better-javascript-three-women-and-one-address-book/
originalPublishText: united-coders.com
---

This is about three women and a javascript address book. The first woman is my mom. Though she does have a first name and a last name, I have been referring to her as mom for my whole life, so her entry in my address book should be labelled “Mom”.

The second woman is my probation officer, a Mrs. Mathilda Wozzle. I do not have a nickname for her, and obviously I don’t want anybody who happens to look over my shoulder to see what she is. Her address book entry should therefore be labelled innocently “Mathilda Wozzle”.

The third woman is Jennifer. I met her in a pub last week, and I do not remember her last name. I’m not even sure she gave me a last name, can’t remember much of that night. The note she handed me contained only two bits, Jennifer and a phone number. I definitely want her in my address book and until further contact she has to go as “Jennifer”.

I’m afraid it’s getting technical now.

My address book now looks like this:

    var addresses = [{
        firstName : "",
        lastName  : "",
        nickName  : "Mom",
        phoneNumber : "555-69-666"
    },
    {
        firstName : "Mathilda",
        lastName  : "Wozzle",
        nickName  : "",
        phoneNumber : "555-343-37847"
    },
    {
        firstName : "Jennifer",
        lastName  : "",
        nickName  : "",
        phoneNumber : "555-467-4475"
    }];

Now I need to derive a display name from those three properties. This is done according to the following rule set:

1. If both first name and last name are given, the display name consists of those two, separated by a space.
2. If only one of first name and last name is given, the display name is that property.
3. If none of first name and last name is given, the display name is the nick name.

A straight-forward implementation would be this:

    var getDisplayName = function (address) {
        if (address.firstName != "" && address.lastName != "") {
            return address.firstName + " " + address.lastName;
        }
        else if (address.firstName != "" || address.lastName != "") {
            if (address.firstName != "") {
                return address.firstName;
            }
            else {
                return address.lastName;
            }
        }
        else {
            return address.nickName;
        }
    };

This is ugly to read and does a lot more checks than necessary, so here’s a better version:

    var getDisplayName = function (address) {
        if (address.firstName != "" && address.lastName != "") {
            return address.firstName + " " + address.lastName;
        }
        else if (address.firstName != "") {
            return address.firstName;
        }
        else if (address.lastName != "") {
            return address.lastName;
        }
        else {
            return address.nickName;
        }
    };

Now we might get smart:

    var getDisplayName = function (address) {
        var displayName = "";

        if (address.firstName != "") {
            displayName = address.firstName;
        }
        if (address.lastName != "") {
            if (address.firstName != "") {
                displayName += " ";
            }
            displayName += address.lastName;
        }
        if (address.firstName == "" && address.lastName == "") {
            displayName = address.nickName;
        }

        return displayName;
    };

Some like the ternary operator:

    var getDisplayName = function (address) {
        var displayName = (address.firstName != "") ? address.firstName : "";
        displayName = (address.firstName != "")
                ? (address.lastName != "") ? displayName + " " + address.lastName : displayName
                : (address.lastName != "") ? address.lastName : address.nickName;
        return displayName;
    };

So, which one do you like most? Actually, I hate them all. There’s a reason I do and that’s they all aren’t written the javascript-way. There is a javascripty solution and best of all, it’s a one-liner. So let’s have a closer look at some features of javascript that help a lot:

## Automatic type conversion

If `firstName` is a string, then the two statements `if (firstName != "")` and `if (firstName)` are equivalent. That’s because an empty string is converted to false, while any other string is converted to true.

## The operators && and ||

Those two operators do not return a boolean. Behind the scenes, they convert the operands to boolean values but return the last operand that got evaluated. They return the operands, not their boolean value.

## A flaw in concept

This has nothing to do with javascript features, but helps improving the code as well. Have a look at the first line of the function body of the last example (which is a real life example from a project I worked on):

    var displayName = (address.firstName != "") ? address.firstName : "";

What does this do? It checks if firstName is not an empty string and if so assigns firstName to displayName. Otherwise it assigns an empty string. Which is the value of firstName. So that line can be written as

    var displayName = address.firstName;

Furthermore, we’re dealing with strings, so we just can concatenate them without having to worry about null or undefined. An easy way to implement the first two items of the rule set is that:

    var displayName = address.firstName + separator + address.firstName;

for some separator, which is determined by that line:

    var separator = address.firstName && address.lastName ? " " : "";

Put together:

    var separator = address.firstName && address.lastName ? " " : "";
    var displayName = address.firstName + separator + address.firstName;
    return displayName;
    // for example:
    // Mathilda Wozzle: "Mathilda" + " " + "Wozzle"
    // Jennifer: "Jennifer" + "" + ""
    // Mom: "" + "" + ""

Now we have to handle that mom-case. But that’s easy. If displayName still is an empty string, take nickName:

    var separator = address.firstName && address.lastName ? " " : "";
    var displayName = address.firstName + separator + address.firstName;
    return displayName || address.nickName;

What does `displayName || nickName` do? It converts displayName to a boolean value. So if displayName is not an empty string, it is converted to true. Since no further operands need to be evaluated, displayName is returned. If displayName is an empty string, it is converted to false and address.nickName is evaluated (and since it is the last operand) returned.

I promised a one-liner. Here it is:

    return (address.firstName + (address.firstName && address.lastName ? " " : "") + address.lastName) || address.nickName;
