

// var guid = function() {
//   return (((1 + Math.random()) * 65536) | 0).toString(16).substring(1);
// };

var guid = function() {
  return guid.curr++;
};
guid.curr = 1;
