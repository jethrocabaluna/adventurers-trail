// --------------- dependencies ----------//
const passport  = require("passport"),
      express   = require("express");
// ------------- models ----------//
const Account = require("../models/account"),
      Post    = require("../models/post"),
      User    = require("../models/user");

const router = express.Router();


// ---------------- ROUTES ------------------//
// landing page
router.get("/", (req, res) => res.render("landing"));
// the homepage of the website
router.get("/adventures", (req, res) => {
  Account.find({}, function (err, allAccount) {
    if (err) {
      console.log(err);
      return res.redirect("/adventures");
    }
    Post.find({}, (err, allPosts) => {
      if (err) {
        console.log(err);
        return res.redirect("/adventures");
      }
      res.render("adventures", { accounts: allAccount, posts: allPosts });
    }).limit(3).sort({ timeCreated: -1 });
  }).limit(6);
});
// sign up page
router.get("/signup", (req, res) => {
  res.render("signup");
});
// POST request after sign up
router.post("/signup", (req, res) => {
  let newUser = new User({ username: req.body.username });
  let newAccount = { firstname: req.body.firstname, lastname: req.body.lastname, username: req.body.username, email: req.body.email };
  Account.create(newAccount, (err, createdAccount) => {
    if (err) {
      console.log(err);
      return res.redirect("/signup");
    }
    console.log("Added " + createdAccount.firstname + " " + createdAccount.lastname + " to the accounts database.");

    User.register(newUser, req.body.password, (err, user) => {
      if (err) {
        console.log(err);
        return res.redirect("/signup");
      }
      passport.authenticate("local")(req, res, () => {
        req.flash("success", "Welcome to Adventurer's Trail " + user.username);
        res.redirect("/adventures");
      });
    });
  });
});
// log in page
router.get("/login", (req, res) => {
  res.render("login");
});
// POST request after log in
router.post("/login", passport.authenticate("local", {
  successRedirect: "/adventures",
  failureRedirect: "/login"
}), (req, res) => {});
// logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logout Successfully.")
  res.redirect("/adventures");
});

module.exports = router;