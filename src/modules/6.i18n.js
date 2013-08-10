// internationalization - i18n
window.verifyMessages = window.verifyMessages || {};

(function ($){
  window.verifyMessages = $.extend(window.verifyMessages, {
    currency: "Invalid monetary value",
    email: "Invalid email address",
    url: "Invalid URL",
    alphanumeric: "Use digits and letters only",
    street_number: "Street Number only",
    number: "Use digits only",
    numberSpace: "Use digits and spaces only",
    postcode: "Invalid postcode",
    date: {
      invalid: "Invalid date",
      start: "Invalid Start Date",
      end: "Invalid End Date",
      startEnd: "Start Date must come before End Date"
    },
    required: {
      all: "This field is required",
      multiple: "Please select an option",
      single: "This checkbox is required"
    },
    regex: "Invalid format",
    phone: [
      "Use digits and spaces only",
      "Number must start with 0",
      "Must be 10 digits long"
    ],
    size: [
      "Must be %s characters",
      "Must be between %s and %s characters"
    ],
    min: "Must be at least %s characters",
    max: "Must be at most %s characters",
    decimal: "Invalid decimal value",
    minVal: "Must be greater than %s",
    maxVal: "Must be less than %s",
    rangeVal: "Must be between %s\nand %s",
    agreement: "You must agree to continue",
    minAge: "You must be at least %s",
    compare: "The value not match with %s field",
    check: "The value specified is already in use"
  });
})(window.jQuery);