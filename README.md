jQuery Async Validator
=====
v0.0.2

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/a0bed67589ba85f50fbcda4bd6652813 "githalytics.com")](http://githalytics.com/jpillora/jquery.async.validator)

Summary
---
A jQuery plugin to provide fully customisable asynchronous client-side validations.

Optionally includes another plugin - [jQuery prompt](http://www.github.com/jpillora/jquery.prompt/) - for displaying coloured text prompts.

Full Documentation and Demos
---

###http://jpillora.github.com/jquery.async.validator/

*Note: These docs are a work in progress.*

Downloads
---

With `jquery.prompt`

* [Development Version including jquery.prompt](http://jpillora.github.com/jquery.async.validator/dist/jquery.async.validator.prompt.js)
* [Production Version including jquery.prompt](http://jpillora.github.com/jquery.async.validator/dist/jquery.async.validator.prompt.min.js)

Without `jquery.prompt`

* [Development Version](http://jpillora.github.com/jquery.async.validator/dist/jquery.async.validator.js)
* [Production Version](http://jpillora.github.com/jquery.async.validator/dist/jquery.async.validator.min.js)

Basic Usage
---

Use the following HTML:

``` html
<!-- jQuery -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>

<!-- jQuery Async Validator (with jQuery Prompt included) -->
<script src="http://jpillora.github.com/jquery.async.validator/dist/jquery.async.validator.prompt.js"></script>

<form>
  <input value="42" data-validate="number"/>
  <input value="abc" data-validate="number"/>
  <input type="submit"/>
</form>
```

Press *submit* and you should see:

![basic usage result](http://jpillora.github.com/jquery.async.validator/demo/demos/quickstart.png)

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

v0.0.2

* Improved Group Validation API

v0.0.1

* Added to jQuery plugin repository

* Released !

