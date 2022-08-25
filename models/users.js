var mongoose = require("mongoose");

var usersSchema = mongoose.Schema({
  userName: String,
  userFirstName: String,
  userEmail: String,
  userPhone: Number,
  userPassword: String,
  token: String,
  reservations: [
    {
        restoName: String,
        restoAddress: String,
        restoZIPCode: Number,
        restoCity: String,
        restoPhone: String,
        date: String,
        hour: String,
        numberOfPeople: Number,
        resaName: String,
        resaPhone: Number,
        status: String
    }
  ],
});

var userModel = mongoose.model("users", usersSchema);

module.exports = userModel;
