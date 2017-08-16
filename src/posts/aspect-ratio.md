---
title: Aspect ratios in CSS
author: Matthias Reuter
id: aspect-ratio
date: 2017-07-31
layout: article.html
---

The aspect ratio describes a relationship between the width and the height of something. Say, we have an image that is 400 pixels wide and 300 pixels high.

<figure>
  <img src="/assets/images/amsterdam.jpg" width="400" style="max-width: 100%">
  <figcaption>Skyline of Amsterdam, 400x300</figcaption>
</figure>

The aspect ratio of that image is 400/300. Taking what we remember of maths, we can simplify this to 4/3.

This means we can divide the width into four parts and the height into three parts of the same size (resulting in 12 squares).

<figure>
    <svg width="400" viewBox="0 0 400 300" style="background-image: url(/assets/images/amsterdam.jpg); background-size: cover; max-width: 100%">
    <g stroke="#fff" stroke-dasharray="10 10">
        <line x1="0" y1="0" x2="400" y2="0" />
        <line x1="0" y1="100" x2="400" y2="100" />
        <line x1="0" y1="200" x2="400" y2="200" />
        <line x1="0" y1="300" x2="400" y2="300" />
        <line x1="0" y1="0" x2="0" y2="300" />
        <line x1="100" y1="0" x2="100" y2="300" />
        <line x1="200" y1="0" x2="200" y2="300" />
        <line x1="300" y1="0" x2="300" y2="300" />
        <line x1="400" y1="0" x2="400" y2="300" />
    </g>
    </svg>
    <figcaption>Gridlines above the image</figcaption>
</figure>

If we know the height, we can calculate the width by dividing the height by three and multiplying the result with four:

    300 / 3 * 4 = 400

Which is the same as multiplying the height with the aspect ratio:

    300 * 4/3 = 400

If we know the width, we can calculate the height by dividing the width by four and multiplying the result with three:

    400 / 4 * 3 = 300

Which is the same as dividing the width by the aspect ratio:

    400 / 4/3 = 300

As a general formula we get this:

    height * aspect-ratio = width
    width / aspect-ratio = height


## Images

The aspect ratio is important, because if we display this image in a width of 200 pixels, the height should be adapted accordingly, otherwise the image gets distorted.

<figure>
  <img src="/assets/images/amsterdam.jpg" width="200" height="300">
  <figcaption>Skyline of Amsterdam, distorted</figcaption>
</figure>

Luckily, the browser does that for us. If we set only one dimension of an image or a video, the browser calculates the other value from the image's or video's original dimensions.

*(To get the distorted image above, I had to explicitly set the original height as well as the new width.)*


## Other elements

For other elements, the browser cannot help. This is because there are no original dimensions of a paragraph or a div. Elements in HTML are as wide as there is space, and as high as their content.

If for some reason we want the dimensions of an element to follow a certain aspect ratio, we have a problem.

(Why would we want that? One very valid reason is to avoid jumping content. If we have an image with a flexible width - as said before - the browser will set the height automatically. But to do that, it has to know the image's original dimensions, for which the image has to be downloaded, at least partially. At first the browser doesn't reserve any space for the image. And while the image downloads, the browser renders the content below that image. When the browser finally knows the height, the content below will jump down, which is annoying if the user already scrolled past the image. To avoid this, we could wrap the image in an element that acts as a placeholder, following the aspect ratio of the image.)

Back to our problem. Of course, we can set both width and height to specific dimensions.

```css
p {
    width: 400px;
    height: 300px;
}
```

(This works for many more units like `em`, `pt`, `rem`, even `vw` and `vh`.)

But we cannot set the height depending on the width. Setting the height to `75%` doesn't work, because percentages in CSS mostly mean *in relation to the parent element or containing block*. Setting the height to 75% means 75% of the containing block's height. Setting the font size to 75% means 75% of the font size of the parent element. 

We simply cannot say `height: 75% of the width`.

There are exemptions to the *in relation to the parent element* rule. For example, if you set the padding of an element in percent, it means *in percent of the **width** of the containing block*. We can exploit this behaviour and hack a way towards a fixed aspect ratio for a div.

## The aspect ratio hack

Let's try this. We have a div with a padding-left of 50%:

```css
div {
    border: 1px solid;
    padding-left: 50%;
    background-color: darkseagreen;
    background-clip: content-box;
}
```

<div style="border: 1px solid; padding-left: 50%; background-color: darkseagreen; background-clip: content-box">
  50%
</div>

*(`background-clip: content-box` sets the background to only cover the content, not the padding area. So the green part is the content, whereas the white part is the padding)*

Except for the two pixel border, the padding and the content should have the same width.

However, we made a slight mistake. The padding-left value is in relation to the width *of the containing block*, not of the element. So if the element is only 80% wide, it doesn't work as we hoped for:

<div style="border: 1px solid; padding-left: 50%; background-color: darkseagreen; background-clip: content-box; width: 80%">
  50%
</div>

We need a new child element for the padding, because then the outer element is the new child's containing block. We avoid an explicit new element by using a pseudo-element:

```css
div {
    width: 80%;
    border: 1px solid;
    background: darkseagreen;
}
div::before {
    content: '';
    display: inline-block;
    padding-left: 50%;
    height: 2px;
    background: white;
}
```

*(The height on the pseudo element is only needed to make it visible. A height of 0 is fine, too.)*

<style>
.example-1 {
    background: darkseagreen;
    border: 1px solid;
}
.example-1::before {
    content: '';
    display: inline-block;
    padding-left: 50%;
    height: 2px;
    background: white;
}
</style>

<div class="example-1" style="width: 80%">
  50%
</div>

Still, we want to change the *height* of the element, not the width. Previously, we set the padding-left. The weird thing is, setting the *padding-bottom* to a percentage still relates to the element's *width*:

```css
div {
    border: 1px solid;
    background: darkseagreen;
}
div::before {
    content: '';
    display: inline-block;
    padding-bottom: 75%;
    width: 2px;
    background: white;
}
```

*(Again, the width on the pseudo element is only needed to make it visible. A width of 0 is fine, too.)*

*(To save space especially on large screens from now on I limit the element's width to 300 pixels.)*

<style>
.example-2 {
    background: darkseagreen;
    border: 1px solid;
    max-width: 300px;
}
.example-2::before {
    content: '';
    display: inline-block;
    padding-bottom: 75%;
    width: 2px;
    background: white;
}
</style>

<div class="example-2">
  4/3?
</div>

However, the pseudo element is still in the flow and thus the content is displayed as if they were in one line. We have to take the pseudo element out of the flow, while still considering it for the outer element's height. This can be done by a combination of `float: left` and `overflow: hidden`.

```css
div {
    overflow: hidden;
}
div::before {
    content: '';
    float: left;
    padding-bottom: 75%;
}
```

<style>
.example-3 {
    background: darkseagreen;
    border: 1px solid;
    overflow: hidden;
    max-width: 300px;
}
.example-3::before {
    content: '';
    float: left;
    padding-bottom: 75%;
    width: 2px;
    background: white;
}
</style>

<div class="example-3">
  4/3!
</div>

Hooray! We are done!

(*dramatic voice*) **Or are we?**

This works fine, until the content exceeds the pseudo element's height. As mentioned before, the height of an element is defined by its content, as you can see:

<div class="example-3">
Minions ipsum tulaliloo me want bananaaa! Poulet tikka masala underweaaar. Underweaaar butt me want bananaaa! Ti aamoo! Poulet tikka masala underweaaar wiiiii potatoooo belloo! La bodaaa poopayee. Jiji chasy po kass belloo! Butt. Gelatooo uuuhhh baboiii jeje tatata bala tu po kass butt potatoooo aaaaaah tank yuuu! Daa. Belloo! wiiiii para tú hahaha bee do bee do bee do bee do bee do bee do. Po kass tank yuuu! Uuuhhh baboiii hahaha gelatooo. Poopayee hahaha pepete tank yuuu! Pepete jiji baboiii.
</div>

We somehow have to limit the content height to the element's height and show scroll bars if necessary. The only way to do so is to put the content in an extra element and position this element absolutely within the outer element:

```html
<div class="outer">
  <div class="inner">4/3</div>
</div>
```

```css
.outer {
  position: relative;
  overflow: hidden;
}
.outer::before {
  content: '';
  float: left;
  padding-bottom: 75%;
}
.inner {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
}
```

<style>
.example-3-outer {
    position: relative;
    overflow: hidden;
    max-width: 300px;
}
.example-3-outer::before {
    content: '';
    float: left;
    padding-bottom: 75%;
}
.example-3-inner {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;    
    background: darkseagreen;
    overflow: auto;
}
</style>

<div class="example-3-outer">
  <div class="example-3-inner">
  Bananaaaa aaaaaah la bodaaa me want bananaaa! Pepete tulaliloo. Para tú uuuhhh bananaaaa bee do bee do bee do underweaaar jiji me want bananaaa! Pepete bee do bee do bee do ti aamoo! Bappleees pepete hana dul sae tatata bala tu. Me want bananaaa! poopayee me want bananaaa! Me want bananaaa! Para tú wiiiii wiiiii belloo! Belloo! Uuuhhh para tú bappleees bananaaaa poopayee hana dul sae. La bodaaa baboiii gelatooo daa tank yuuu! Hahaha jeje. Bappleees bappleees tulaliloo uuuhhh tulaliloo uuuhhh gelatooo para tú bappleees chasy jeje. Hahaha tank yuuu! Daa poopayee tulaliloo gelatooo bananaaaa jiji la bodaaa. 
  </div>
</div>

And thus we - finally - have a div with an aspect ratio of 4/3.

## Generalizing

Until now, we have one fixed aspect ratio. If we wanted another, say 16/9 or 1/1 (a square) or the [golden ratio](https://en.wikipedia.org/wiki/Golden_ratio), we would have to add more classes:

```css
.aspect-ratio-16-9::before {
  padding-bottom: calc(100% / 16 * 9);
}
.aspect-ratio-1-1::before {
  padding-bottom: 100%;
}
.golden-ratio::before {
  padding-bottom: calc(100% / 1.61803);
}
```

Can we make the aspect ratio more dynamic? It would be nice if we could set the aspect ratio on the element itself, for example as an attribute:

```html
<div data-aspect-ratio="16/9"></div>
```

And then by some CSS <del>magic</del> <ins>cleverness</ins> we could calculate the padding-bottom value:

```css
[data-aspect-ratio]::before {
  padding-bottom: calc(100% / attr(data-aspect-ratio number));
}
```

The `attr()` function of CSS reads out the value of the given attribute. The `number` keyword tells the browser to interpret the value as a number. The `calc()` function is used to do calculations. But we cannot have nice things. As the [Mozilla Developer Network page](https://developer.mozilla.org/en-US/docs/Web/CSS/attr) states:

> The attr() function can be used with any CSS property, but support for properties other than content is experimental.

## CSS variables

However, with the help of CSS variables (officially named *custom properties*) we can have nice things. At least in [all modern browsers](http://caniuse.com/#search=css%20variables).

A CSS variable is declared by two dashes and a name, and accessed via the `var()` function. In the following example, we calculate the padding-bottom value using a variable:

```css
.outer {
  --aspect-ratio: calc(4/3);
}
.outer::before {
  padding-bottom: calc(100% / var(--aspect-ratio));
}
```

<style>
.example-custom-properties-outer {
    position: relative;
    overflow: hidden;
    max-width: 300px;
    --aspect-ratio: calc(4/3);
}
.example-custom-properties-outer::before {
    content: '';
    float: left;
    padding-bottom: calc(100% / var(--aspect-ratio));
}

.example-custom-properties-inner {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: darkseagreen;
}
</style>

<div class="example-custom-properties-outer">
  <div class="example-custom-properties-inner">4/3</div>
</div>

This works, but we have not gained anything yet, because we still declared the aspect ratio within the CSS. Now if we overwrite the variable in an inline style, we are finally able to dynamically set the aspect ratio:

```html
<div class="outer" style="--aspect-ratio: calc(16/9)">
  <div class="inner">16/9</div>
</div>
```

<div class="example-custom-properties-outer" style="--aspect-ratio: calc(16/9)">
    <div class="example-custom-properties-inner">16/9</div>
</div>


## What about...

Now we are able to set the height of an element following an aspect ratio, depending on the elements width. What about the other way round? Can we set the width in dependance to an element's height?

No, we cannot. There is no CSS property we could use for another hack. No percentage value refers to the element's height (remember, elements normally are as high as their content, so setting the height is seen as an uncommon usecase).

There is a special case where we can set the width following a certain aspect ratio, depending on the height of the viewport. But that's the story for another day.
