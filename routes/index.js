// --------------- dependencies ----------//
const GridFsStorage = require("multer-gridfs-storage"),
      mongoose = require('mongoose'),
      passport = require("passport"),
      express = require("express"),
      multer = require("multer"),
      crypto = require("crypto"),
      path = require("path"),
      Grid = require("gridfs-stream");
// ------------- models ----------//
const Account = require("../models/account"),
      Post    = require("../models/post"),
      User    = require("../models/user");

const router = express.Router(),
      conn = mongoose.createConnection(process.env.DATABASEURL);

let gfs;
conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});
// --------------- Create storage engine -------------//
let filename = "";
const storage = new GridFsStorage({
  url: process.env.DATABASEURL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage, limits: { fileSize: 1000000 } }).single('image');

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
  Account.count({ username: req.body.username }, function(err, count) {
    if(err) {
      console.log(err);
      return res.redirect("/signup");
    }
    if(count > 0) {
      req.flash("error", "The username " + req.body.username + " already exists.");
      return res.redirect("/signup");
    }
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
          createdAccount.userAuth.id = req.user._id;
          createdAccount.save((err, savedAccount) => {
            if (err) {
              console.log(err);
              return res.redirect("/signup");
            }
            req.flash("success", "Welcome to Adventurer's Trail " + user.username);
            res.redirect("/adventurers/" + user.username);
          });
        });
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
  // successRedirect: "/adventures",
  failureRedirect: "/login"
}), (req, res) => {
  console.log("after login");
  res.redirect("/adventurers/" + req.user.username);
});
// logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logout Successfully.")
  res.redirect("/adventures");
});

// view the image using image filename
router.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // check type
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/jpg' || file.contentType === 'image/png') {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

module.exports = router;