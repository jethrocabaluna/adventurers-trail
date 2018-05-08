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
// --------------- inits ---------------//
const router  = express.Router(),
      conn    = mongoose.createConnection("mongodb://localhost/adventurers_trail");
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
  url: 'mongodb://localhost/adventurers_trail',
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
const upload = multer({ storage });


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
router.get("/:id", (req, res) => {
  Account.findById(req.params.id).populate("posts").exec((err, foundAccount) => {
    if(err){
      console.log(err);
      return res.redirect("/adventurers");
    }
    let profImage = "prof_" + foundAccount._id;
    let coverImage = "cover_" + foundAccount._id;
    return res.render("showAdventurer.ejs", { adventurer: foundAccount, profileImage: profImage, coverImage: coverImage });
  });
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
// POST request after clicking apply on profile picture upload
router.post("/:id/profile_image", (req, res, next) => {
  filename = "prof_" + req.params.id;
  gfs.remove({ filename: filename, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      console.log("nothing to replace");
      return;
    }
    console.log("replaced old profile image");
  });
  return next();
}, upload.single('image'), (req, res) => {
  filename = "";
  res.redirect("/adventurers/" + req.params.id);
});
// POST request after clicking apply on cover picture upload
router.post("/:id/cover_image", (req, res, next) => {
  filename = "cover_" + req.params.id;
  gfs.remove({ filename: filename, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      console.log("nothing to replace");
      return;
    }
    console.log("replaced old cover image");
  });
  return next();
}, upload.single('image'), (req, res) => {
  filename = "";
  res.redirect("/adventurers/" + req.params.id);
});

module.exports = router;