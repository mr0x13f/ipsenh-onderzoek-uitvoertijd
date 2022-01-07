// Contain everything in a scope
myServerlessFunction = (function() {
 
    // Construct hello world string
    let helloWorld = function() {
   
        return "Hello " + "World!";
   
    }
   
    // This function is never used
    let unused = function() {
   
        return "Foobar";
   
    }
   
    // Serverless function
    return function run() {
   
        if (true) {
            return helloWorld();
        } else {
            return "Unreachable code!";
        }
   
    }
 
})();
