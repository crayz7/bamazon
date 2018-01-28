var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host     : 'localhost',
  port	   :  3307,
  user     : 'root',
  password : 'root',
  database : 'bamazon'
});
 
connection.connect(function(err){
	if (err) throw err;
	start();
});
 
function start() {
	connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push("Item: " + results[i].product_name + ", Department: " + results[i].department_name + ", Price: " + results[i].price);
            }
            return choiceArray;
          },
          message: "Which product ID would you like to buy?"
        },
        {
          name: "buy",
          type: "input",
          message: "How many would you like to buy?"
        }
      ]).then(function(answer) {
      	  // Get information of the chosen item
      	  var chosenItem;
          for (var i = 0; i < results.length; i++) {
            if (results[i].product_name === answer.choice) {
              chosenItem = results[i];
              console.log(chosenItem.stock_quantity);
              start();
            }
          }
 		  
 		  // Determine if there is enough quantity       
          //if (parseInt(answer.buy) > chosenItem.stock_quantity) {
      	    //console.log("Insufficient supply, order cancelled!");
      	    //start();
      	//} else {
      	    //console.log(chosenItem.product_name);
      	//}
      
      });
   })
}
 
//connection.end();