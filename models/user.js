const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  oauthId: { type: String }, // for users authenticated via OAuth (e.g., Google or GitHub)
  oauthProvider: { type: String }, // provider used for OAuth (e.g., "google")
  created: { type: Date, default: Date.now } // automatically sets the creation date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
