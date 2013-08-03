define([], function() {
  return function(tagName) {
    return $(document.createElement(tagName));
  };
});