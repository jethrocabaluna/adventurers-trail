var Post = require("../models/post");

// all middleware goes here
var middlewareObj = [];

// middleware to check post ownership
middlewareObj.checkPostOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {    //check if a user is logged in
    Post.findById(req.params.id, function (err, foundPost) {
      if (err) {
        req.flash("error", "Campground not found.");
        res.redirect("/posts/" + req.params.id);
      } else {
        if (foundPost.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "Permission denied.");
          res.redirect("/posts/" + req.params.id);
        }
      }
    });
  } else {
    req.flash("error", "Please log in first.");
    res.redirect("/posts/" + req.params.id);
  }
}

// middleware for permission to add campground or add comment
middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please log in first."); 
  res.redirect("/login");
}

module.exports = middlewareObj;