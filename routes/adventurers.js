// ------------- dependencies -----------//
const   GridFsStorage = require("multer-gridfs-storage"),
        mongoose      = require('mongoose'),
        express       = require("express"),
        multer        = require("multer"),
        crypto        = require("crypto"),
        path          = require("path"),
        Grid          = require("gridfs-stream");
// -------------- models ----------------//
const Account = require("../models/account"),
      Post    = require("../models/post");
// ---------------- middleware ------------//
const middleware = require("../middleware");
// --------------- inits ---------------//
const router  = express.Router(),
      conn = mongoose.createConnection(process.env.DATABASEURL);
// --------------- Init gfs ----------------//
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


// --------------------- ROUTES ---------------- //
// show adventurers
router.get("/", (req, res) => {
  Account.find({}, (err, allAccount) => {
    if(err){
      console.log(err);
      return res.redirect("/adventurers");
    }
    allAccount.forEach(function(account) {
    });
    res.render("adventurers", { adventurers : allAccount });
  });
});
// show specific adventurer
router.get("/:username", (req, res) => {
  Account.findOne({ username: req.params.username }).populate({ path: 'posts', options: { sort: { 'timeCreated': -1 } } }).exec((err, foundAccount) => {
    if(err){
      console.log(err);
      return res.redirect("/adventurers");
    }
    let profImage = "prof_" + foundAccount.username;
    let coverImage = "cover_" + foundAccount.username;
    return res.render("showAdventurer.ejs", { adventurer: foundAccount, profileImage: profImage, coverImage: coverImage });
  });
});

// POST request after clicking apply on profile picture upload
router.post("/:username/profile_image", middleware.isLoggedIn, (req, res, next) => {
  filename = "prof_" + req.params.username;
  gfs.exist({ filename: filename, root: 'uploads' }, (err, found) => {
    if (err) {
      console.log(err);
    } 
    if(found) {
      upload(req, res, (err) => {
        if (err) {
          req.flash("error", "maximum filesize: 1MB");
          return res.redirect("/adventurers/" + req.params.username);
        }
        gfs.remove({ filename: filename, root: 'uploads' }, (err, gridStore) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log("replaced old profile image");
        });
        return next();
      });
    } else {
      console.log("nothing to replace!");
      upload(req, res, (err) => {
        if (err) {
          req.flash("error", "maximum filesize: 1MB");
          return res.redirect("/adventurers/" + req.params.username);
        }
        return next();
      });
    }
  });
}, (req, res) => {
  filename = "";
  res.redirect("/adventurers/" + req.params.username);
});
// POST request after clicking apply on cover picture upload
router.post("/:username/cover_image", middleware.isLoggedIn, (req, res, next) => {
  filename = "cover_" + req.params.username;
  gfs.exist({ filename: filename, root: 'uploads' }, (err, found) => {
    if (err) {
      console.log(err);
    }
    if (found) {
      upload(req, res, (err) => {
        if (err) {
          req.flash("error", "maximum filesize: 1MB");
          return res.redirect("/adventurers/" + req.params.username);
        }
        gfs.remove({ filename: filename, root: 'uploads' }, (err, gridStore) => {
          if (err) {
            console.log(err);
            return;
          }
          console.log("replaced old cover image");
        });
        return next();
      });
    } else {
      console.log("nothing to replace!");
      upload(req, res, (err) => {
        if (err) {
          req.flash("error", "maximum filesize: 1MB");
          return res.redirect("/adventurers/" + req.params.username);
        }
        return next();
      });
    }
  });
}, (req, res) => {
  filename = "";
  res.redirect("/adventurers/" + req.params.username);
});

module.exports = router;