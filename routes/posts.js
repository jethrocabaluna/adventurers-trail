// -------------------- dependencies ------------------ //
const express = require("express");
// -------------------- import middlewares --------------- //
const middleware = require("../middleware");
// -------------------- models -------------------- //
const Account = require("../models/account"),
      Post    = require("../models/post");

const router = express.Router();


// ---------------------- ROUTES ----------------------- //
// show posts
router.get("/", (req, res) => {
  res.redirect("/posts/page/1");
});
router.get("/page/:page", (req, res) => {
  let pageNum = parseInt(req.params.page);
  let pageCount = 0;
  let postsNumLimit = 5;
  Post.count((err, count) => {
    pageCount = Math.ceil(count/postsNumLimit);
  });
  Post.find({}, (err, allPosts) => {
    if (err) {
      console.log(err);
      return res.redirect("/adventures");
    }
    res.render("posts", { posts: allPosts, pageCount: pageCount, activePage: pageNum });
  }).skip(5 * (pageNum - 1)).limit(5).sort({ timeCreated: -1 });
});
// create new post
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("newpost");
});
// POST request after new post page
router.post("/", middleware.isLoggedIn, (req, res) => {
  req.body.post.author = {
    id: req.user._id,
    username: req.user.username
  };
  Post.create(req.body.post, (err, createdPost) => {
    if (err) {
      console.log(err);
      return res.redirect("/posts");
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
        res.redirect("/posts");
      });
    });
  });
});
// show single post using id
router.get("/:id", (req, res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    if (err) {
      console.log(err);
      return res.redirect.redirect("/posts");
    }
    res.render("showpost", { post: foundPost });
  });
});
// edit post
router.get("/:id/edit", middleware.checkPostOwnership, (req, res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    if(err){
      console.log(err);
      return res.redirect("/posts/" + req.params.id);
    }
    res.render("editpost", { post: foundPost });
  });
});
// PUT request after edit page
router.put("/:id", middleware.checkPostOwnership, (req, res) => {
  Post.findByIdAndUpdate(req.params.id, req.body.post, (err, foundPost) => {
    if(err){
      console.log(err);
      return res.redirect("/posts/" + req.params.id);
    }
    console.log(foundPost.author.username + " edited the post " + foundPost.title);
    req.flash("success", "Successfully edited your post.");
    res.redirect("/posts" + req.params.id);
  });
});
// DELETE request after clicking delete on a post
router.delete("/:id", middleware.checkPostOwnership, (req, res) => {
  Post.findByIdAndRemove(req.params.id, (err) => {
    if(err){
      console.log(err);
      return res.redirect("/posts/" + req.params.id);
    }
    console.log(req.user.username + " deleted a post");
    req.flash("success", "Successfully deleted your post.");
    res.redirect("/posts");
  });
});

module.exports = router;