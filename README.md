Verify.js
=====
v0.0.1

Summary
---
A jQuery plugin to provide fully customisable asynchronous client-side validations.

Optionally includes another plugin - [jQuery prompt](http://www.github.com/jpillora/jquery.prompt/) - for displaying coloured text prompts.

Full Documentation and Demos
---

###http://jpillora.github.com/verify/

*Note: These docs are a work in progress.*

Downloads
---

With `jquery.prompt`

* [Development Version including jquery.prompt](http://jpillora.github.com/verify/dist/verify.prompt.js)
* [Production Version including jquery.prompt](http://jpillora.github.com/verify/dist/verify.prompt.min.js)

Without `jquery.prompt`

* [Development Version](http://jpillora.github.com/verify/dist/verify.js)
* [Production Version](http://jpillora.github.com/verify/dist/verify.min.js)

Basic Usage
---

Use the following HTML:

``` html
<!-- jQuery -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>

<!-- Verify.js (with jQuery Prompt included) -->
<script src="http://jpillora.github.com/verify/dist/verify.prompt.js"></script>

<form>
  <input value="42" data-validate="number"/>
  <input value="abc" data-validate="number"/>
  <input type="submit"/>
</form>
```

Press *submit* and you should see:

![basic usage result](http://jpillora.github.com/verify/demo/demos/quickstart.png)

Todo
---
* Nested validation groups
* Internationalisation
* Create a validation result object type instead of using strings/nulls 
* Optimise Performance
* Enforce asynchronicity

Contributing
---
Issues and Pull-requests welcome, though please add tests. To build and test: `cd *dir*` then `npm install -g grunt` then `grunt`.

Credits
---
Thanks to [@posabsolute](https://github.com/posabsolute) as this plugin was originally a fork of [jQuery Validation Engine](https://github.com/posabsolute/jQuery-Validation-Engine) though it has been completely rewritten in OO style and is now more extendable and fully asynchronous. Many extra features have been added and many have not been reimplemented so I have decided give this project a new name instead of trying to do a massive pull-request that wouldn't be backwards compatible.

Change Log
---

v0.0.1

* Improved Group Validation API
* Added to jQuery plugin repository

* Released !

