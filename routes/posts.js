// -------------------- dependencies ------------------ //
const GridFsStorage = require("multer-gridfs-storage"),
      mongoose = require('mongoose'),
      express = require("express"),
      multer = require("multer"),
      crypto = require("crypto"),
      path = require("path"),
      Grid = require("gridfs-stream");
// -------------------- import middlewares --------------- //
const middleware = require("../middleware");
// -------------------- models -------------------- //
const Account = require("../models/account"),
      Post    = require("../models/post");

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

// ---------------------- ROUTES ----------------------- //
// show posts
router.get("/", (req, res) => {
  res.redirect("/posts/page/1");
});
router.get("/page", (req, res) => {
  res.redirect("/posts/page/1");
});
router.get("/page/:page", (req, res) => {
  let pageNum = parseInt(req.params.page);
  if(pageNum < 1) {
    return res.redirect("/posts/page/1");
  }
  let pageCount = 0;
  let postsNumLimit = 5;
  Post.count((err, count) => {
    if(err) {
      console.log(err);
      return res.redirect("/posts/page/1");
    }
    pageCount = Math.ceil(count/postsNumLimit);
    pageNum = pageNum > pageCount ? pageCount : pageNum;

    Post.find({}, (err, allPosts) => {
      if (err) {
        console.log(err);
        return res.redirect("/adventures");
      }
      res.render("posts", { posts: allPosts, pageCount: pageCount, activePage: pageNum });
    }).skip(5 * (pageNum - 1)).limit(5).sort({ timeCreated: -1 });
  });
});
// create new post
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("newpost");
});
// POST request after new post page
router.post("/", middleware.isLoggedIn, (req, res) => {
  Post.create( { 'author.id': req.user._id, 'author.username': req.user.username, title: 'Untitled' }, (err, createdPost) => {
    if (err) {
      console.log(err);
      return res.redirect("/posts");
    }
    filename = "post_" + createdPost._id;
    createdPost.image = filename;
    createdPost.save();
    upload(req, res, (err) => {
      if (err) {
        req.flash("error", "maximum filesize: 1MB");
        createdPost.remove();
        return res.redirect("/posts/new");
      }
      Account.findOne({ username: createdPost.author.username }, (err, foundAccount) => {
        if (err) {
          console.log(err);
          return res.redirect("/posts");
        }
        foundAccount.posts.push(createdPost);
        foundAccount.save((err, savedAccount) => {
          if (err) {
            console.log(err);
            return res.redirect("/posts");
          }
          console.log(savedAccount.username + " posted " + createdPost.title);
          req.flash("success", "Thank you for adding a new post, " + savedAccount.username);
          res.redirect("/posts/" + createdPost._id);
        });
      });
    });
  });
});
// show single post using id
router.get("/:id", (req, res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    if (err) {
      console.log(err);
      return res.redirect("/posts");
    }
    res.render("showpost", { post: foundPost });
  });
});
// add content to post
router.post("/:id", middleware.isLoggedIn, (req, res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    if(err) {
      console.log(err);
      return res.redirect("/posts");
    }
    if(foundPost.content == undefined) {
      foundPost.content = req.body.content;
    } else {
      foundPost.content += req.body.content;
    }
    foundPost.save((err, savedPost) => {
      if(err) {
        console.log(err);
        return res.redirect("/posts");
      }
      console.log("added new content to Post " + savedPost.title);
      req.flash("success", "Thank you for adding new content.");
      res.redirect("/posts/" + req.params.id);
    });
  });
});
// edit post
// router.get("/:id/edit", middleware.checkPostOwnership, (req, res) => {
//   Post.findById(req.params.id, (err, foundPost) => {
//     if(err){
//       console.log(err);
//       return res.redirect("/posts/" + req.params.id);
//     }
//     res.render("editpost", { post: foundPost });
//   });
// });
// PUT request after edit page
// router.put("/:id", middleware.checkPostOwnership, (req, res) => {
//   Post.findByIdAndUpdate(req.params.id, req.body.post, (err, foundPost) => {
//     if(err){
//       console.log(err);
//       return res.redirect("/posts/" + req.params.id);
//     }
//     console.log(foundPost.author.username + " edited the post " + foundPost.title);
//     req.flash("success", "Successfully edited your post.");
//     res.redirect("/posts/" + req.params.id);
//   });
// });
// DELETE request after clicking delete on a post
router.delete("/:id", middleware.checkPostOwnership, (req, res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    if (err) {
      console.log(err);
      return res.redirect("/posts/" + req.params.id);
    }
    Account.findOne({ username: foundPost.author.username }, (err, foundAccount) => {
      if (err) {
        console.log(err);
        return res.redirect("/posts/" + req.params.id);
      }
      foundAccount.posts.pull({ _id: req.params.id });
      foundAccount.save((err, savedAccount) => {
        if(err) {
          console.log(err);
          return res.redirect("/posts/" + req.params.id);
        }
        foundPost.remove();
        res.redirect("/posts");
      });
    });
  });
});

module.exports = router;