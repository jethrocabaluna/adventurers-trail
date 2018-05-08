var mongoose = require("mongoose");

var AccountSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],
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

module.exports = mongoose.model("Account", AccountSchema);