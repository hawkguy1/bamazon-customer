var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
});

display();

function display() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var table = new Table({
            head: ["ID", "BEER NAME", "TYPE", "PRICE", "IN STOCK"],
            colWidths: [5, 25, 20, 10, 10]
        });
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity],
            );
        }
        console.log("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*\n")
        console.log(table.toString());
        console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*\n")
        start()
    });
};

function start() {
    inquirer.prompt([
        {
            type: "input",
            name: "beerID",
            message: "WHAT IS THE ID OF THE BEER YOU'D LIKE TO BUY?",
            validate: function (beerID) {
                if ((!isNaN(beerID)) && (beerID <= 10) && (beerID > 0)) {
                    return true;
                }
                console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                console.log("\nENTER VALID ID.");
                console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                return false;
            }
        },
        {
            type: "input",
            name: "beerQuantity",
            message: "HOW MANY WOULD YOU LIKE?",
            validate: function (beerQ) {
                if (!isNaN(beerQ)) {
                    return true;
                }
                console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                console.log("\nENTER VALID QUANTITY.");
                console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                return false;
            }
        }
    ]).then(function (answer) {

        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;
            var chosenBeer = "";
            for (var i = 0; i < res.length; i++) {
                if (res[i].item_id === parseInt(answer.beerID)) {
                    chosenBeer = res[i];
                }
            }

            if (chosenBeer.stock_quantity >= parseInt(answer.beerQuantity)) {
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: chosenBeer.stock_quantity -= parseInt(answer.beerQuantity)
                        },
                        {
                            item_id: chosenBeer.item_id
                        }
                    ],
                    function (error) {
                        if (error) throw err;
                        var totalCost = answer.beerQuantity * chosenBeer.price;
                        console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                        console.log("\nTHANK YOU! HAPPY DRINKING!");
                        console.log("YOU HAVE RESERVED " + answer.beerQuantity + " " + chosenBeer.product_name + "(S).");
                        console.log("YOUR TOTAL COST IS: $" + totalCost + ".");
                        console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                        display();
                    }
                );
            }
            else {
                console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                console.log("\nOOPS! SOMETHING WENT WRONG. CHECK TO MAKE SURE YOUR ITEMS ARE IN STOCK.");
                console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                start();
            }
        });
    });
}
