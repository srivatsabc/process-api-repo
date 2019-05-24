function strictAddition(x, y, callback) {
  console.log("Inside addition: " + x);
  if(typeof x !== 'number') {
    callback( new Error('First argument is not a number') );
    return;
  }
  if(typeof y !== 'number') {
    callback( new Error('Second argument is not a number') );
    return;
  }
  var result = x + y;
  setTimeout(function() {
    callback(null, result);
  }, 500);
}

// The Callback
function callback(err, data) {
  if(err) {
    console.log(err);
    return;
  }
  console.log(data);
}


// Examples
strictAddition(2,  10, callback); // 12
console.log("After 1st add");
strictAddition(-2, 10, callback); // 8
console.log("After 2nd add");
strictAddition('uh oh', 10, callback); // Error = "First argument is not a number"
console.log("After 3rd add");
strictAddition(2, '10', callback); // // Error = "Second argument is not a number"
console.log("After 4th add");
