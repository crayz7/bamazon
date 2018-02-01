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
          choices: [
          	"View Products for Sale",
          	"View Low Inventory",
          	"Add to Inventory",
          	"Add New Product",
          	"End Program"
          ],
          message: "What would you like to do?"
        } 
      ]).then(function(answer) {
      	// Determine which function to run
      	if (answer.choice === "View Products for Sale") {
      		viewProducts();
      	} else if (answer.choice === "View Low Inventory") {
      		viewLow();
      	} else if (answer.choice === "Add to Inventory") {
      		addInventory();
      	} else if (answer.choice === "Add New Product") {
      		addProduct();
      	} else if (answer.choice === "End Program") {
      		connection.end();
      	}
    });
  });
}

function viewProducts() {
  connection.query("SELECT * FROM products", function(err, results) {
  	if (err) throw err;
	  // Loop through items and get their attributes
    for (var i = 0; i < results.length; i++) {
      console.log("Item #" + results[i].item_id + ", Product: " + results[i].product_name + ", Dept: " + results[i].department_name + ", Price: $" + results[i].price + ", Stock quantity: " + results[i].stock_quantity);
     }
  })
  start();
}

function viewLow() {
  connection.query("SELECT * FROM products", function(err, results) {
  	if (err) throw err;
    for (var i = 0; i < results.length; i++) {
      if (results[i].stock_quantity < 6) {
      	console.log("Item #" + results[i].item_id + ", Product: " + results[i].product_name + ", Stock quantity: " + results[i].stock_quantity);
      }
    }
  })
  start();
}

function addInventory() {
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
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "Which item would you like to add more of?"
        },
        {
          name: "amount",
          type: "input",
          message: "How many would you like to add?"
        } 
      ]).then(function(answer) {
      	var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }
      	connection.query(
          "UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: parseInt(chosenItem.stock_quantity) + parseInt(answer.amount) //its appending answer.amount to the end instead of adding
              },
              {
                item_id: chosenItem.item_id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Inventory added successfully!");
              start();
            }
         );
      })
  })
}

function addProduct() {
  connection.query("SELECT * FROM products", function(err, results) {
  	if (err) throw err;

  inquirer
      .prompt([
        {
          name: "name",
          type: "input",
          message: "Name of product to add?"
        },
        {
          name: "dept",
          type: "input",
          message: "Department to add product to?"
        },
        {
          name: "price",
          type: "input",
          message: "Price of the product?",
          validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
         }
        },
        {
          name: "quantity",
          type: "input",
          message: "Quantity of the product?",
          validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
         }
        }
      ]).then(function(answer) {
      	connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.name,
          department_name: answer.dept,
          price: answer.price,
          stock_quantity: answer.quantity
        },
        function(err) {
          if (err) throw err;
          console.log("Your product was added successfully!");
          start();
        }
      );
    })
  })
}