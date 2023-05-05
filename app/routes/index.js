const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/",(req, res) => {
    if(!req.session.is_login) {
        return res.redirect("/user/LoginIndex");
    }else{
        return res.render("dashboardIndex",{message:"Welcome back",session_user:"Hello,"+req.session.user});
    }
});

// put hint here
router.get("/getHint1",(req, res) => {
    const hintName = "hint1.png";
    const options = {
        root: path.join(__dirname,"../hints")
    };
    res.sendFile(hintName,options,(err) => {
        if(err){
            res.status(500).send("Get hint1 error");
        }
    });

});

module.exports = router;