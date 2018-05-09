// ------------- dependencies -------------//
const   passportLocalMongoose   = require("passport-local-mongoose"),
        methodOverride          = require("method-override"),
        LocalStrategy           = require("passport-local"),
        bodyParser              = require("body-parser"),
        mongoose                = require("mongoose"),
        passport                = require("passport"),
        express                 = require("express"),
        flash                   = require("connect-flash");
require('dotenv').config();
// ------------- imported functions -----------//
const   clearDB     = require("./clearDB"),
        seedDB      = require("./seedDB");
// ------------- consts ---------------//
const   port    = process.env.PORT || 3000,
        app     = express();
// ------------- Routes --------------//
const   adventurerRoutes    = require("./routes/adventurers"),
        indexRoutes         = require("./routes/index"),
        postRoutes          = require("./routes/posts");
// ------------- Models --------------//
const   Comment = require("./models/comment"),
        Account = require("./models/account"),
        User    = require("./models/user"),
        Post    = require("./models/post");

console.log(process.env.DATABASEURL);
mongoose.connect(process.env.DATABASEURL);
app.set("view engine", "ejs");

// MIDDLEWARE CONFIGURATION
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "secretkey_adventurerstrail",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser  = req.user;
    res.locals.success      = req.flash("success");
    res.locals.error        = req.flash("error");
    next();
});

// seedDB();   //seed the database
// clearDB();  //clear the database

// --------------- routers ------------//
app.use(indexRoutes);
app.use("/posts", postRoutes);
app.use("/adventurers", adventurerRoutes);

app.listen(port, () => console.log(`AdventurersTrail server started on port ${port}`));