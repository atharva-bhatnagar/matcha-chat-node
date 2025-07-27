const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema({
  email: { type: String, required: true },
  user_id: { type: String, required: true, unique: true },
  user_type:{type:String,required:true},
  company:{type:String},
  name:{type:String},
  website:{type:String},
  linkedIn:{type:String},
  sub_type:{type:String}
});

module.exports = mongoose.model("Waitlist", waitlistSchema);