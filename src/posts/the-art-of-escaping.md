---
title: The art of escaping
author: Matthias Reuter
date: 2009-11-27
layout: article.html
originalPublishUrl: http://united-coders.com/matthias-reuter/the-art-of-escaping/
originalPublishText: united-coders.com
---

Escaping is the art of transforming a text into a transport format from which it can be extracted again without any modification.

That’s something every developer does – to a certain level. For example take the sentence

    Matthias says: "I love Javascript".

Now put this sentence in a Java source code:

    String s = "Matthias says: "I love Javascript".";

If you don’t complain about this, your compiler will. In Java (any many other programming languages) the quotation mark `"` has a special meaning, it defines a string. So if you have a string containing the quotation mark, you need to escape it:

    String s = "Matthias says: \"I love Javascript\".";

If you print out s, the original text is shown:

    System.out.print(s); // Matthias says: "I love Javascript".

That’s something we learnt in one of the first programming lessons, and even absolute beginners learn this quickly. Unfortunately, the knowledge of escaping ends here for many. Escaping is not just putting a backslash before a quotation mark. Let’s take a step back and think about why we need escaping.

We have a sequence of characters (like the above sentence) that needs to be put in some environment (like as a String in Java source code). We have to be able to extract that exact sequence of characters from that environment again (like by printing it to a console or a file).

The sequence might as well be some user input that has to be stored in a MySQL database and later be read from that database. Or maybe it’s some user input coming from a database that has to be embedded within an HTML page.

So that’s the first step for escaping:

### 1. The goal is to embed a sequence of characters in some environment so that we later are able to extract the exact sequence.

Since the environments differ, so does the need of escaping. In Java, we have to escape quotation marks, since they have a special meaning. We also have to escape some control characters like line breaks and tabs. In HTML it’s different. We have to escape angle brackets (`<` and `>`), characters not contained in the page’s charset (like `€` in an ISO-8859-1 page) and some more. That leads to step two:

### 2. We need to know which characters have a special meaning or are forbidden in the environment.

The environments do not only differ in the characters that need escaping, but in the way to do escaping as well. The escape sequence in Java is a backslash followed by the original character. In HTML the escape sequence has the form `&foo;`, where foo is a textual representation of the escaped character (`>` becomes `&gt;`, greater than). So step three is:

### 3. Know how to escape.

When I wrote my own blog software, I stored the entries in a SQL database. Of course I escaped the entries using `mysql_real_escape_string`, but I went a step further. Since the entry was to be embedded in an HTML page, I also escaped it via `htmlspecialchars` before putting it into the database. That wasn't a good idea. I later added an interface to retrieve entries as JSON and so had to unescape them again. Actually, what I did in the first place was a violation of step one: *“…so that we later are able to extract the exact sequence”*. I could not extract the same sequence, since I modified it twice.

The right way was: Escape the entry for a MySQL query when storing it. When embedding the stored entry in an HTML page, read it from the database (resulting in the exact sequence) and then escape it for HTML. When embedding it in JSON, read it from the database (resulting again in the exact sequence) and then escape it for JSON. So we have step four:

### 4. Don’t double escape.

A last step concerns the reinvention of the wheel. Where possible, do not manually escape. There’s no way around it when embedding a quotation mark within a string in Java source code, but for embedding in HTML, SQL, JSON and so on use methods provided by the language you use. In PHP that might be `mysql_real_escape_string`, `json_encode` and `htmlspecialchars`. These methods often cover edge cases of which the normal mind never thinks of.

### 5. Use methods provided by the language where possible.

## Examples

Let’s look at some examples:

### URLs

If you search twitter, the url is http://twitter.com/search?q=searchterm. Now if you search for a hashtag (that is a term starting with a `#`), you need to escape the `#` because it has a special meaning in an url (it denotes a fragment identifier). Escaping a character in an ul is done by replacing it by a `%xy` sequence, where xy is the hex presentation of that character. So a `#` must be replaced by `%23` and thus the search url becomes e.g. http://twitter.com/search?q=%23songsincode

Formally, we did this:

1. The goal is to embed `#searchterm` within a URL (precisely in the query part).
2. Slash `/` and hash `#` and `%` and `?` have a special meaning in a URL, and most non-ascii characters are forbidden.
3. The escape character in a URL is the percent sign, followed by the hex representation of the character to escape.
4. Does not apply here.
5. In Javascript for example you escape a query part by `encodeURIComponent()`.

### HTML

If you want to explain how to make an HTML paragraph, you might give an example:

    <p>This is an HTML paragraph.</p>

If your explanation is within an HTML page, you need to escape it, because `<p>` obviously has a special meaning in HTML. You need to write it that way:

    &lt;p&gt;This is an HTML paragraph.&lt;/p&gt;

`<` and `>` are special characters in HTML as well as `"` and `&`, so they need escaping. (By the way, how would I have to escape the above code to have it displayed as it is in HTML?)

Again, formally:

1. The goal is to embed `<p>This is a paragraph.</p>` within HTML.
2. Characters with a special meaning in HTML are `<`, `>`, `&` and `"`.
3. These are escaped by `&lt;` `&gt;`, `&amp;` and `&quot;`
5. In JSP for example it is done by `<c:out value="${foo}" />` which by default escapes the value.

### SQL

Of course you need to escape text if you want to embed it in an SQL query, as seen in this famous cartoon from xkcd.com:

![Bobby Tables (from xkcd.com)][1]

## Case study: A complete failure

There is a real life example of how a website completely failed because its developers were unaware of the rules of escaping. The website is not publicly available, so I cannot give you a link. All of the mistakes mentioned here have been fixed in the meantime.

The website represents a virtual pin board where you can pin messages to. The messages are generated using Javascript, the data (position, message text and background color) are stored in JSON (Javascript Object Notation). So the message text has to be escaped to embed in JSON. In an early version, this was not done. So having a quotation mark in your message text broke the JSON and as a consequence could not be altered, since generating of the notes failed.

I had to wait until this bug was fixed before I could try to break the board again.

The JSON then was part of an HTML page, embedded in a script element. Fortunately, the special characters of HTML need not to be escaped within a script element, with one exception. The HTML parser looks for a closing script tag anywhere. It especially does not parse the Javascript to see if </script> is part of a Javascript string. So having a `</script>` in your message text broke the HTML again with the consequence of completly breaking the application.

A message could be altered inline, that means the div containing the text was replaced by a textarea. On blur, the text was saved in the background using an HttpRequest and the textarea was again replaced by a div containing the altered text.

The text was not meant to allow HTML, but the altered text was inserted to the page using innerHTML, and thus, HTML could be injected. Until page reload. Since HTML was not allowed, the special characters of HTML needed escaping. Unfortunately a very common mistake was made. Instead of escaping the special characters, they were stripped. This generally is wrong, and was additionally done wrongly. Any sequence of characters surrounded by angle brackets was removed. So the mathematical truth (redundant though) of `3<5 and 5>3` was replaced by `33`.

The problem was the developers did not think about how user input could break the application. As long as the user behaves like a model citizen, all went right. But users don’t, trust me.

## Further reading

A nice overview of how to escape for different environments can be found at [codecodex.com][2].

[1]: http://imgs.xkcd.com/comics/exploits_of_a_mom.png
[2]: http://codecodex.com/wiki/Escape_sequences_and_escape_characters
