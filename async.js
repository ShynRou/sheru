

async function test() {
  function jeehaa() {
    // return new Promise((resolve) => {
    //   setTimeout(() => resolve("JEEHHAA"), 1000);
    // });
    return "JEEHHAA";
  }


  console.log('start');
  var asyncCall = jeehaa();
  var interval = setInterval(() => console.log('nope'), 100);
  var result = await asyncCall;
  console.log(result);
  clearInterval(interval);
}

test().then(() => console.log('done'));