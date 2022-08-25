var mongoose = require("mongoose");

//Mongoose options
var options = {
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//Mongoose connect
mongoose.connect(
  "mongodb+srv://JohannD:3b6oXmftK2vkrHEy@cluster0.pjrbt.mongodb.net/resto?retryWrites=true",
  options,
  function (err) {
    if (err) {
      console.log(
        `error, failed to connect to the database because --> ${err}`
      );
    } else {
      console.info("connected to Restô database");
    }
  }
);
