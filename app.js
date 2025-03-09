const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Express settings:
// Tells the app to use ejs as view engine
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(expressLayouts);

const mongoURI = "mongodb://localhost:27017/todolistDB";
const mongoConnectionParams = { useNewUrlParser: true, useUnifiedTopology: true };

// Connect to MongoDB via Mongoose package
// MongoDB must be installed on this machine before running this line
mongoose.connect(mongoURI, mongoConnectionParams)
        .catch((error) => handleError(error));

// SCHEMA definition   ===============================================================
// Define Item schema and Mongoose model based on the schema
const ItemSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
let TaskList = mongoose.model('TaskTitle', ItemSchema);
// ===================================================================================

// Show TODO list
app.get("/", async(req, res) => {
    try {
        const tasks = await TaskList.find({});
        res.render('index.ejs', { todoTasks: tasks });
    } catch (error) {
        console.log(error);
    }
});

// Add button clicked -> post request
app.post('/', async(req, res) => {
    const todoTask = new TaskList({
        content: req.body.content,
    });
    try {
        await todoTask.save();
        res.redirect('/');
    } catch (err) {
        res.redirect('/');
    }
});

// Edit button clicked -> post request
app.route('/edit/:id')
    .get(async(req, res) => {
        const id = req.params.id;
        try {
            const tasks = await TaskList.find({});
            res.render('list.ejs', { todoTasks: tasks, idTask: id });
        } catch (err) {
            console.log(err);
        }
    })
    .post(async(req, res) => {
        const id = req.params.id;
        try {
            await TaskList.findByIdAndUpdate(id, { content: req.body.content });
            res.redirect('/');
        } catch (err) {
            console.log(err);
        }
    });

// Delete URI
app.get('/delete/:id', async(req, res) => {
    const id = req.params.id;
    try {
        await TaskList.findByIdAndDelete(id);
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
});

app.listen(3000, function() {
    console.log("Server running on port 3000.")
});
