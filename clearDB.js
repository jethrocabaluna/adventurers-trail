var mongoose  = require("mongoose"),
  User        = require("./models/user"),
  Post        = require("./models/post"),
  Comment     = require("./models/comment"),
  Account     = require("./models/account");

function clearDB() {
  Account.remove({}, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("All Accounts removed.");

      User.remove({}, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("All users removed.");

          Post.remove({}, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("All posts removed.");

              Comment.remove({}, function (err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("All comments removed.");
                }
              });
            }
          });
        }
      });
    }
  });
}

module.exports = clearDB;