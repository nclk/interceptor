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
    res.render("create-user");
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
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        res.render("view-user", {user: foundUser});
    });
});

//edit user
router.post("/users/:id", function(req, res){
    
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
router.get("/users/delete/:id", function(req, res){
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
    res.set("X-Original-URI", req.get("X-Original-URI"));
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
    return ((uri) => {
        return uri
            ? res.redirect(uri)
            : res.render("login");
    })(req.get("X-Original-URI"));
});

//handle login
router.post("/login", passport.authenticate("local", {
    successRedirect: "/admin/create-user",
    failureRedirect: "/admin/login"
}), function(req, res){
    // can't get here?
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
