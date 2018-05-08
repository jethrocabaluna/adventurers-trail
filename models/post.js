var mongoose = require("mongoose");

var PostSchema = new mongoose.Schema({
  title: String,
  image: String,
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  timeCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Post", PostSchema);