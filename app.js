//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function connectToMongoDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully');

        // Now you can define your schemas, models, and perform database operations

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

// Call the async function to establish the connection
connectToMongoDB();
// Define the user schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});


userSchema.plugin(encrypt,{ secret: process.env.SECRET, encryptedFields:['password'] });

// Create the User model
const User = mongoose.model('User', userSchema);

app.get('/',function(req,res){
    res.render("home.ejs");
});

app.get('/login',function(req,res){
    res.render("login.ejs");
});

app.get('/register',function(req,res){
    res.render("register.ejs");
});

app.post('/register', async function(req, res) {
    try {
        const newUser = new User({
            username: req.body.username, 
            password: req.body.password
        });
        await newUser.save();
        console.log('New user added !');

        // Render the secrets.ejs page
        res.render('secrets');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'An error occurred while registering the user' });
    }
});
app.post('/login', async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.password === password) {
            console.log("Successful login !");
            // You can redirect to a dashboard or render a logged-in page
            res.render('secrets'); // Example: Rendering secrets page
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An error occurred during login' });
    }
});



app.listen(3000, function(){
    console.log("Server started on Port 3000!");
});