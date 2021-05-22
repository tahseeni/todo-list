
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();

//tells the app to use ejs as view engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//connect to mongodb via mongoose
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true, useUnifiedTopology: true});

//mongoose schema
const itemSchema = { name: String };

//mongoose model based on the schema
const Item = mongoose.model("Item", itemSchema);

//DECLARE DEFAULT ITEMS into an array
const item1 = new Item({ name: "Welcome to the TODO List" });
const item2 = new Item({ name: "Add stuff using the + button" });
const item3 = new Item({ name: "Delete using the check box!" });
const defaultItems = [item1, item2, item3];

const listSchema = { name:String, items:[itemSchema]};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

   // let day = date.getDate(); //using getDate() from date.js module
   //find all items inside the collection
    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0) {
            //insert items if there are none in the database
            Item.insertMany(defaultItems, function(err){
                if(err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default items.");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    });
});

app.get("/:customName", function(req,res) {
    const customName = _.capitalize(req.params.customName);

    List.findOne({name:customName}, function(err,foundList) {
        if(!err) {
            if(!foundList) {
                //create a new list
                const list = new List({ 
                    name: customName, 
                    items: defaultItems 
                });

                //save and redirect to the custom route
                list.save();
                res.redirect("/" + customName);
            } else {
                //console.log(foundList.name + ", " + foundList.items);
                //show existing list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
});

//"add" button, redirects to the app.get() callback
app.post("/", function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    //user typed this in
    const item = new Item({ name: itemName });

    if(listName === "Today") {
        //root route
        item.save();
        res.redirect("/");
    } else {
        //for non-root routes
        List.findOne({name: listName}, function(err,foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

//delete from whatever
app.post("/delete", function(req,res){
    const checkedId = req.body.box;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndRemove(checkedId, function(err){
            if(!err) {
                console.log("Successfully removed item.");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedId}}}, 
            function(err){
            if(!err) {
                console.log("Successfully removed item.");
                res.redirect("/" + listName);
            }
        });
    }
});

app.listen(3000, function() {
    console.log("Server running on port 3000.")
});
