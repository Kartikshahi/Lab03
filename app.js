var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Router Objects
var indexRouter = require("./routes/index");
var plansRouter = require("./routes/plan");


// Import MongoDB and Configuration modules
var mongoose = require("mongoose");
var configs = require("./configs/globals");

// HBS Helper Methods
var hbs = require("hbs");

// Import passport and session modules
var passport = require("passport");
var session = require("express-session");

// Import user model
var User = require("./models/user");

// Import Google OAuth Strategy
var GoogleStrategy = require("passport-google-oauth20").Strategy;

// Express App Object
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Express Configuration
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configure passport module
app.use(
  session({
    secret: "s2021pr0j3ctTracker", // Secret for encrypting session
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Link passport to the user model
passport.use(User.createStrategy());

// Google OAuth Strategy Setup
passport.use(
  new GoogleStrategy(
    {
      clientID: configs.Authentication.Google.ClientId, // From Google Developer Console
      clientSecret: configs.Authentication.Google.ClientSecret, // From Google Developer Console
      callbackURL: configs.Authentication.Google.CallbackUrl, // Must match redirect URI in Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database
        let user = await User.findOne({ oauthId: profile.id });
        if (user) {
          return done(null, user); // User already exists, login them
        } else {
          // If new user, create a new user document and save it to DB
          user = new User({
            username: profile.displayName, // Use display name from Google profile
            oauthId: profile.id, // Google unique id
            oauthProvider: "Google", // OAuth provider
            created: Date.now(), // Set creation date
          });
          const savedUser = await user.save(); // Save new user to database
          return done(null, savedUser); // Return the newly created user
        }
      } catch (err) {
        return done(err); // Handle any errors during user lookup/creation
      }
    }
  )
);

// Serialize and deserialize user for session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routing Configuration
app.use("/", indexRouter); // Main routes
app.use("/plans", plansRouter); // Plans route


// Connecting to the DB (MongoDB)
mongoose
  .connect(configs.ConnectionStrings.MongoDB, { // Ensure MongoDB URI is set correctly
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((error) => console.log(`Error while connecting to MongoDB: ${error}`));

// Handlebars Helpers for dynamic content
hbs.registerHelper("createOptionElement", (currentValue, selectedValue) => {
  let selectedProperty = currentValue == selectedValue.toString() ? "selected" : "";
  return new hbs.SafeString(`<option ${selectedProperty}>${currentValue}</option>`);
});

hbs.registerHelper("toShortDate", (longDateValue) => {
  return new hbs.SafeString(longDateValue.toLocaleDateString("en-CA"));
});

// Handlebars Helper for equality check
hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});


// Google OAuth Authentication Routes
// Route to trigger Google login (redirects to Google OAuth page)
app.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route (after successful login via Google)
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/plans"); // Redirect to plans page on successful login
  }
);

// Logout Route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    res.redirect("/login"); // Redirect to login page after logout
  });
});

// Error handling
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404)); // If route not found, throw a 404 error
});

// Error handler (for internal errors like 500)
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {}; // Show error only in development mode
  res.status(err.status || 500);
  res.render("error"); // Render error page
});

// Export the app module
module.exports = app;
