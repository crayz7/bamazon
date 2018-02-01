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
          type: "list",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              // using the below for choiceArray breaks the for loop for getting item information
              // choiceArray.push("Item: " + results[i].product_name + ", Department: " + results[i].department_name + ", Price: " + results[i].price);
              choiceArray.push(results[i].product_name);
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
            }
          }
 		  
 		 // Determine if there is enough quantity       
           if (parseInt(answer.buy) > chosenItem.stock_quantity) {
      	     console.log("Insufficient supply, order cancelled!");
      	     start();
      	  } else {
      	     connection.query(
      	       "UPDATE products SET ? WHERE ?",
      	       [
      	         {
      	           stock_quantity: parseInt(chosenItem.stock_quantity) - parseInt(answer.buy)
      	         },
      	         {
                   item_id: chosenItem.item_id
                 }
      	       ],
      	         function(err) {
      	         	if (err) throw err;
      	         	console.log("Item purchased. Your price is $" + answer.buy * chosenItem.price);
      	         	start();
      	         }
      	      );
      	   }
      
      });
   })
}