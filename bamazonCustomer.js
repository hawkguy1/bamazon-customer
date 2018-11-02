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
        console.log(table.toString());
        start()
    });
};

function start() {
    inquirer.prompt([
        {
            type: "input",
            name: "beerID",
            message: "WHAT IS THE ID OF THE BEER YOU'D LIKE TO BUY? (TYPE Q TO QUIT)",
            validate: function (beerID) {
                //if users enter q or Q, exit the program.
                if (beerID.toLowerCase() === "q") {
                    connection.end();
                    process.exit();
                }
                //users need to enter a number between 1 to 10 because there are 10 items in the table.
                else if ((!isNaN(beerID)) && (beerID <= 10) && (beerID > 0)) {
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
            message: "HOW MANY WOULD YOU LIKE? (TYPE Q TO QUIT)",
            validate: function (beerQ) {
                if (beerQ.toLowerCase() === "q") {
                    connection.end();
                    process.exit();
                }
                //users need to enter a number
                else if (!isNaN(beerQ)) {
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
                        console.log("\nTHANK YOU! HAPPY DRINKING! YOU HAVE CHOSEN " + answer.beerQuantity + " " + chosenBeer.product_name + "(S).");
                        console.log("YOUR TOTAL COST IS: $" + totalCost + ".");
                        console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                        display();
                    }
                );
            }
            else {
                console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                console.log("\nSORRY. SOMETHING WENT WRONG HERE. CHECK TO MAKE SURE YOUR ITEMS ARE IN STOCK");
                console.log("\n*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*");
                start();
            }
        });
    });
}
