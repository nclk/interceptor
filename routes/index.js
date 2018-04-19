var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/admin/login");
};

function registerUser(username, password, callback) {
    User.register(
        new User({
            username: username
        }),
        password,
        callback
    );
}

//root
router.get("/", isLoggedIn, function(req, res){
    res.redirect("/admin/users");
});

//get all users
router.get("/users", isLoggedIn, function(req, res){
    
    //find all users in db
    User.find({}, function(err, users){
        if(err){
            console.log(err);
        } else {
            //res.render
            //res.send(JSON.stringify(users));
            res.render("users", {users:users, currentUser: req.user});
            console.log(req.user);
        }
    });
})

//get one user
router.get("/users/:id", isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        res.render("view-user", {user: foundUser});
    });
});

//edit user
router.post("/users/:id", isLoggedIn, function(req, res){
    
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
            res.redirect("/admin/users")
        } 
        
        if(foundUser){
            foundUser.setPassword(req.body.password, function(){
                foundUser.save();
                req.flash("success", "Password has been updated successfully.");
                res.redirect("/admin/users/" + req.params.id);
            })
        } else {
            res.redirect("/admin/users");
        }
    })
});

//delete a user
router.get("/users/delete/:id", isLoggedIn, function(req, res){
    User.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/admin/users");
            console.log(err);
        } else {
            res.redirect("/admin/users")
        }
    });
});

router.get("/auth", function(req, res) {
    res.status(req.isAuthenticated() ? 200 : 401);
    res.end();
});

//router.get("/secret", isLoggedIn, function(req, res){
//    res.render("secret");
//});

//show signup form
router.get("/create-user", isLoggedIn, function(req, res){
    res.render("create-user");
});

//handle register
router.post("/create-user", isLoggedIn, function(req, res){
    registerUser(
        req.body.username,
        req.body.password,
        function(err, user){
            if(err){
                console.log(err);
                req.flash("error", err.message);
                //return res.render("register");
                res.redirect("/admin/create-user");
            } else {
                //passport.authenticate("local")(req, res, function(){
                    req.flash(
                        "success", "You have successfully created user " + user.username
                    );
                    res.redirect("/admin/create-user");
                //});
            }
        }
    );
});

//show login form
router.get("/login", function(req, res){
    return res.render("login", {next: req.query["next"]});
});

router.post("/login", function(req, res, next) {
    // can we set a header here with the user info or is it already set?
    passport.authenticate("local", {
        //successRedirect: req.query["next"] || "/admin/",
        failureRedirect: `/admin/login${req.query["next"] && "?next=" + req.query["next"]}`
    })(req, res, next);
}, isLoggedIn, function(req, res, next) {
    res.redirect(req.query["next"] || "/admin/");
});

//logout
router.get("/logout", isLoggedIn, function(req, res){
    req.logout();
    req.flash("success", "You are now logged out!");
    res.redirect("/admin");
});

module.exports = {
    router: router,
    registerUser: registerUser
}
