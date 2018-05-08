var mongoose  = require("mongoose"),
  User        = require("./models/user"),
  Post        = require("./models/post"),
  Comment     = require("./models/comment");

var users = [
  {
    firstname: "Jethro",
    lastname: "Cabaluna",
    username: "Jet",
    email: "jethro@gmail.com",
    password: "1234"
  },
  {
    firstname: "Janina",
    lastname: "Waje",
    username: "Nina",
    email: "nina@gmail.com",
    password: "1234"
  },
  {
    firstname: "Oreo",
    lastname: "Hamster",
    username: "Oreo",
    email: "oreo@hamster.com",
    password: "1234"
  }
];

var postSeed =
  {
    title: "Pacific Rim National Park",
    image: "https://www.explore-mag.com/media/image/56883_max.jpg",
    description: "Long Beach is the ultimate Pacific experience—22 kilometres of sand with a horizon that disappears into the ocean. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nesciunt sapiente ad recusandae aperiam, ea harum nobis, quam facere veritatis, odio numquam expedita iusto nostrum voluptates eligendi veniam adipisci. Qui, nihil! Long Beach is the ultimate Pacific experience—22 kilometres of sand with a horizon that disappears into the ocean. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nesciunt sapiente ad recusandae aperiam, ea harum nobis, quam facere veritatis, odio numquam expedita iusto nostrum voluptates eligendi veniam adipisci. Qui, nihil!"
  };

var commentSeed = 
  {
    text: "This is a comment."
  };

function seedDB() {
  User.remove({}, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("All users removed.");

      Post.remove({}, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("All posts removed.");

          Comment.remove({}, function(err){
            if(err){
              console.log(err);
            } else {
              console.log("All comments removed.");

              users.forEach(function(user){
                User.create(user, function(err, user){
                  if(err){
                    console.log(err);
                  } else {
                    console.log("Added new user " + user.username);
                    Post.create(postSeed, function(err, post){
                      if(err){
                        console.log(err);
                      } else {
                        user.posts.push(post);
                        user.save(function(err, userWithPost){
                          if(err){
                            console.log(err);
                          } else {
                            console.log(user.username + " posted " + post.title);
                            Comment.create(commentSeed, function (err, comment) {
                              if (err) {
                                console.log(err);
                              } else {
                                userWithPost.comments.push(comment);
                                userWithPost.save(function(err, completeUser){
                                  if(err){
                                    console.log(err);
                                  } else {
                                    console.log(user.username + " comments \"" + comment.text + "\" on post " + post.title);
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              });
            }
          });
        }
      });
    }
  });
}

module.exports = seedDB;