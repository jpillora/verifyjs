/**
 * Core - English Translation
 *  >>> Warning: This file is redundant as english is included
 * @author Jaime Pillora
 */
(function($) {
  $.verify.addUpdateRules({
    email: {
      message: "Invalid email address"
    },
    url: {
      message: "Invalid URL"
    },
    alphanumeric: {
      message: "Use digits and letters only"
    },
    number: {
      message: "Use digits only"
    },
    required: {
      messages: {
        "all": "This field is required",
        "multiple": "Please select an option",
        "single": "This checkbox is required"
      }
    },
    regex: {
      message: "Invalid format"
    },
    min: {
      message: "Must be at least {{ min }} characters"
    },
    max: {
      message: "Must be at most {{ max }} characters"
    },
    size: {
      messages: {
        range: "Must be between {{ min }} and {{ max }} characters",
        exact: "Must be {{ min }} characters"
      }
    }
  });
})(jQuery);

