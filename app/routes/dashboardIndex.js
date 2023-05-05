const express = require('express');
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const multer = require("multer");

const router = express.Router();

const upload = multer({ dest: path.join(__dirname,"../public/tmp")});
function checkFileData(fileDatas){
    const blacklist = ['__proto__', 'prototype', 'constructor'];
    for (let i = 0; i < blacklist.length; i++) {
        if (fileDatas.includes(blacklist[i])) {
                return false;
        }
    }
    return true;
}

// Get example file
router.get("/ShowExampleFile",(req, res) => {
    if (!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }

    if([req.query].some((item) => item && JSON.stringify(item).includes("app"))){
        return res.status(200).send("Hacker!!!");
    }

    try {
        return res.status(200).send(fs.readFileSync(req.query.filename || "./example/example.json").toString());
    }catch(err){
        return res.status(500).send("Internal server error");
    }
})

// Homepage
router.get("/Home",(req,res) => {
    if(!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }
    return res.render("dashboardIndex",{message:"Welcome back",session_user:"Hello,"+req.session.user});
})

router.get("/getHint2",(req, res) => {
    if (!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }
    const hintName = "hint2.png";
    const options = {
        root: path.join(__dirname,"../hints")
    };
    res.sendFile(hintName,options,(err) => {
        if(err){
            return res.status(500).send("Get hint2 error");
        }
    });

});

// show uploaded files
router.get("/UploadList",(req,res) => {
    if(!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }
    var lists = fs.readdirSync(path.join(__dirname,"../public/upload"));
    if (lists.length === 0){
        return res.render("dashboardIndex",{message: "No uploaded files",session_user:"Hello,"+req.session.user});
    }
    return res.render("dashboardIndex",{message: lists,session_user:"Hello,"+req.session.user});
})

// show packed files
router.get("/PacksList",(req,res) => {
    if(!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }
    var lists = fs.readdirSync(path.join(__dirname,"../public/packs"));
    if (lists.length === 0){
        return res.render("dashboardIndex",{message: "No packed files",session_user:"Hello,"+req.session.user});
    }
    let result = "";
    for (let i = 0; i < lists.length; i++){
        result += "<a href='/dashboardIndex/DownloadPackage?name=" + lists[i] + "'>" + lists[i] + "</a><br>";
    }
    return res.render("dashboardIndex",{message: result,session_user:"Hello,"+req.session.user});
})

// Download packed files
router.get("/DownloadPackage",(req,res) => {
    if (!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }
    if (req.query.name === undefined || req.query.name === ""){
        req.query.name = "example.tgz";
    }
    var packageName = req.query.name;

    if (packageName.indexOf("/") !== -1 || packageName.indexOf("..") !== -1){
        return res.status(200).send("File path invalid");
    }
    if (packageName.indexOf(".tgz") === -1){
        return res.status(200).send("Not a package file");
    }

    const packagePath = path.join(__dirname,"../public/packs/",packageName);
    if(!fs.existsSync(packagePath)) {
        return res.status(200).send("File not found");
    }
    const contentType = "application/x-gtar";
    res.setHeader("Content-disposition", "attachment; filename=" + packageName);
    res.setHeader("Content-type", contentType);
    res.download(packagePath,packageName,(err) => {
        if (err){
            return res.status(500).send("Download failed");
        }
    });

});

// Upload files
router.all("/Upload",upload.any(),(req,res) => {
    if (!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }

    if (!req.session.is_admin){
        return res.status(403).send("You are not admin");
    }

    if (req.method === "GET"){
        return res.render("upload",{upload_result:"plz upload file"});
    }
    if (req.method === "POST"){
        if (!req.files || Object.keys(req.files).length === 0){
            return res.send("No files were uploaded");
        }
        var file = req.files[0];
        if (file.originalname.includes("/") || file.originalname.includes("..")){
            return res.send("File path invalid");
        }
        var fileData = fs.readFileSync(file.path).toString("utf-8");
        if (!checkFileData(fileData)){
            return res.send("File data invalid");
        }
        var filePath = path.join(__dirname,"../public/upload/",file.originalname);
        if (path.extname(file.originalname) === ".json") {
            fs.writeFile(filePath,fileData,(err) => {
                if (err){
                    return res.send("File upload error");
                }else {
                    return res.send("File upload success");
                }
            });
        }else {
            return res.send("Not a JSON file");
        }
    }
});

// Set dependencies
router.all("/SetDependencies",(req,res) => {
    if (!req.session.is_login) {
        return res.redirect("/user/LoginIndex");
    }
    if (!req.session.is_admin){
        return res.status(403).send("You are not admin");
    }
    if (req.method === "GET") {
        return res.status(200).send("You can post the dependencies here");
    }
    if (req.method === "POST"){
        var data = req.body;

        if (typeof data !== "object" && data === {}){
            return res.status(200).send("plz set the dependencies");
        }
        if (!checkFileData(JSON.stringify(data))){
            return res.status(200).send("Invalid dependencies");
        }
        var exampleJson = {
            "name": "app-example",
            "version": "1.0.0",
            "description": "Example app for the Node.js Getting Started guide.",
            "author": "anonymous",
            "scripts":{
                "prepack": "echo 'packing dependencies'"
            },
            "license": "MIT",
            "dependencies": {

            }
        };
        exampleJson = Object.assign(exampleJson,{},data);

        var filePath = path.join(__dirname,"../public/package.json");
        var fileData = JSON.stringify(exampleJson);

        fs.writeFile(filePath,fileData,(err) => {
            if (err){
                return res.status(500).send("Set dependencies error");
            }else {
                return res.status(200).send("Set dependencies success");
            }
        })
    }
})

// Pack dependencies
router.get("/PackDependencies",(req,res) => {
    if (!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }
    if (!req.session.is_admin){
        return res.render("dashboardIndex",{message: "You are not admin",session_user:"Hello,"+req.session.user});
    }
    console.log("Packing dependencies...");
    var filePath = path.join(__dirname,"../public");
    cp.exec("cd " + filePath + "&& npm pack && mv ./*.tgz ./packs",(err,stdout,stderr) => {
        if(err){
            return res.render("dashboardIndex",{message: "Pack dependencies error",session_user:"Hello,"+req.session.user});
        }else {
            return res.render("dashboardIndex",{message: "Pack dependencies success",session_user:"Hello,"+req.session.user});
        }
    })
})

// Kill installing dependencies
router.get("/KillDependencies",(req,res) => {
    if(!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }
    if (!req.session.is_admin){
        return res.render("dashboardIndex",{message: "You are not admin",session_user:"Hello,"+req.session.user});
    }
    console.log("Killing dependencies...");
    cp.exec("ps -ef | grep npm | grep -v grep | awk '{print $2}' | xargs kill -9",(err,stdout,stderr) => {
        if (err){
            return res.render("dashboardIndex",{message: "Kill installing dependencies error",session_user:"Hello,"+req.session.user});
        }else {
            return res.render("dashboardIndex",{message: "Kill installing dependencies success",session_user:"Hello,"+req.session.user});
        }
    });

});

// Logout
router.get("/Logout",(req,res) => {
    if (!req.session.is_login){
        return res.redirect("/user/LoginIndex");
    }
    req.session.is_login = 0;
    req.session.is_admin = 0;
    req.session.user = "";
    return res.redirect("/user/LoginIndex");
})

module.exports = router;
