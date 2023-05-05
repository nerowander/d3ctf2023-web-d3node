const express = require('express');
const mongo = require("mongoose");
const router = express.Router();

const dbUser = process.env.DBUser;
const dbPassword = process.env.DBPassword;

// docker
mongo.connect("mongodb://127.0.0.1:27017/userInfoDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
        username: dbUser,
        password: dbPassword
    }
});

// local
/*
mongo.connect("mongodb://test:test@127.0.0.1:27017/testdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: {
        username: 'test',
        password: 'test'
    }
});
*/
db = mongo.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connection success!')
});


var userinfo = new mongo.Schema({
    username: String,
    password: String
});

const Userinfo = mongo.model("userinfo",userinfo,"userinfo");

function checkData(str){
    const check = /where|eq|ne|gt|gte|lt|lte|exists|text|collation/;
    return check.test(str);
}

// Register
router.all("/RegisterIndex",(req,res) => {
    if (req.session.is_login) {
        return res.redirect("/dashboardIndex/Home");
    }
    if (req.method === "GET"){
       return res.render("register",{register_result:"Please register"});
    }
    if (req.method === "POST") {
        if (req.body.username === undefined || req.body.password === undefined){
            return res.render("register",{register_result: "Plz input your username and password"});
        }
        if (req.body.username === "" || req.body.password === "") {
            return res.render("register", {register_result: "Username or password cannot be empty"});
        }
        if (checkData(JSON.stringify(req.body))){
            return res.render("register", {login_result: "Hacker!!!"});
        }
        Userinfo.findOne({username: req.body.username}).exec()
            .then((info) => {
                if (info == null) {
                    let user = new Userinfo({
                        username: req.body.username,
                        password: req.body.password
                    });
                    user.save()
                        .then(savedUser => {
                            if (savedUser) {
                                return res.render("register", {register_result: "Register success"});
                            } else {
                                return res.render("register", {register_result: "Register failed"});
                            }
                        })
                        .catch(err => {
                            if (err) {
                                return res.render("register", {register_result: "Internal server error"});
                            }
                        });
                } else {
                    return res.render("register", {register_result: "User already exists"});
                }
            })
    }
});

// Login
router.all("/LoginIndex",(req,res) => {
    if (req.session.is_login) {
        return res.redirect("/dashboardIndex/Home");
    }
    if (req.method === "GET") {
        return res.render("login", {login_result: "Please login"});
    }
    if (req.method === "POST") {
        if (req.body.username === undefined || req.body.password === undefined)  {
            return res.render("login",{login_result:"Plz input your username and password"});
        }
        if (req.body.username === "" || req.body.password === ""){
           return res.render("login",{login_result:"Username or password cannot be empty"});
        }
        if (checkData(JSON.stringify(req.body))) {
           return res.render("login", {login_result: "Hacker!!!"});
        }
        Userinfo.findOne({username: req.body.username, password: req.body.password}).exec()
            .then((info) => {
                if (info == null) {
                    return res.render("login", {login_result: "Login failed,invalid username or password"});
                } else {
                    req.session.is_login = 1;
                    if (typeof req.body.username == "object" || typeof req.body.password == "object") {
                        req.session.user = "test";
                        return res.redirect("/dashboardIndex/Home");
                    }

                    req.session.user = req.body.username;
                    // if admin
                    if (req.body.username === "admin" && req.body.password === info.password) {
                        req.session.is_admin = 1;
                        req.session.user = "admin";
                    }
                    return res.redirect("/dashboardIndex/Home");
                }
            })
            .catch((err) => {
                return res.render("login", {login_result: "Internal server error"});

            })
    }
});

module.exports = router;