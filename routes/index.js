var express = require("express");
var router = express.Router();
var bcrypt = require("bcrypt");
var uid2 = require("uid2");

var userModel = require("../models/users");

/* POST Sign-up */
router.post("/signup", async function (req, res, next) {
  // Pour encrypter le password
  const hash = bcrypt.hashSync(req.body.passwordFromFront, 10);

  // On vérifie que l'email du user n'existe pas déjà en BDD
  var userTaken = await userModel.findOne({
    userEmail: req.body.emailFromFront,
  });

  var error = [];
  var result = false;
  var token = "";

  // On affiche une erreur si au moins un des inputs est vide
  if (
    req.body.firstNameFromFront == "" ||
    req.body.nameFromFront == "" ||
    req.body.phoneFromFront == "" ||
    req.body.emailFromFront == "" ||
    req.body.passwordFromFront == ""
  ) {
    error.push("Un ou plusieurs champ(s) sont vide(s)");
    // On affiche une erreur si l'email du user existe déjà en BDD
  } else if (userTaken) {
    error.push("Cette adresse e-mail existe déjà !");
    // Si aucune erreur, on sauvegarder le user en BDD, on passe le result à true et on stock son token dans une variable
  } else {
    var newUser = new userModel({
      userName: req.body.nameFromFront,
      userFirstName: req.body.firstNameFromFront,
      userEmail: req.body.emailFromFront,
      userPhone: req.body.phoneFromFront,
      userPassword: hash,
      token: uid2(32),
      reservations: [],
    });
    var userSave = await newUser.save();
    if (userSave) {
      result = true;
      token = userSave.token;
    }
  }
  res.json({ result, userFromBDD: userSave, token, error });
});

/* POST Sign-in */
router.post("/sign-in", async function (req, res, next) {
  var error = [];
  var result = false;

  if (req.body.emailFromFront == "" || req.body.passwordFromFront == "") {
    error.push("Un ou plusieurs champ(s) sont vide(s)");
  } else {
    // console.log('Etape 1: findOne effectué')
    var userFromFrontExist = await userModel.findOne({
      userEmail: req.body.emailFromFront,
    });
    if (userFromFrontExist) {
      // console.log('Tape 2: if(userFromFrontExist)')
      if (
        bcrypt.compareSync(
          req.body.passwordFromFront,
          userFromFrontExist.userPassword
        )
      )
        // console.log('Etape 3: compareSync')
        result = true;
    } else {
      error.push("Information(s) incorrecte(s)");
    }
  }
  res.json({ result, userFromBDD: userFromFrontExist, error });
  // res.json({})
});

/* POST Reset Password */
router.post("/reset-password", async function (req, res, next) {
  var error = [];

  var userFromFrontExist = await userModel.findOne({
    email: req.body.emailFromResetPassword,
  });
  var passwordFromFront = req.body.passwordFromResetPassword;
  var passwordFromFrontConfirmed = req.body.passwordFromResetPasswordConfirmed;
  var mailFromFront = req.body.emailFromResetPassword;

  var result = false;

  if (userFromFrontExist) {
    if (passwordFromFront === passwordFromFrontConfirmed) {
      result = true;
      await userModel.updateOne(
        { _id: userFromFrontExist._id },
        {
          mail: mailFromFront,
          password: passwordFromFront,
        }
      );
    }
  }
  // ne pas oublier de rajouter une chose dans le front, si result === true alors on ferme l'overlay
  // actuel et on rouvre celui de la connection, vu qu'on vient de changer notre mdp
  res.json({ result });
});

/* GET Account Screen - Remplissage auto des inputs */
router.get("/account-screen/:token", async function (req, res) {
  var findUserBDDFromToken = await userModel.findOne({
    token: req.params.token,
  });

  res.json({ findUserBDDFromToken });
});

router.post("/account-screen", async function (req, res, next) {
  var userFromBDD = await userModel.findOne({ token: req.body.tokenFromFront });
  console.log(userFromBDD);

  res.json({ userFromBDD });
});

/* GET Account Screen - Se déconnecter */

/* GET Account Screen Overlay - Modifier mes informations */

// POST Ajouter une réservation comme sous-document
router.post("/reservation", async function (req, res, next) {
  // On récupère le user connecté
  var userConnected = await userModel.findOne({
    token: req.body.tokenFromRedux,
  });
  console.log(userConnected);

  if (userConnected.token == req.body.tokenFromRedux) {
    userConnected.reservations.push({
      restoName: req.body.restoName,
      restoAddress: req.body.restoAddress,
      restoZIPCode: req.body.restoZIPCode,
      restoCity: req.body.restoCity,
      restoPhone: req.body.restoPhone,
      date: req.body.date,
      hour: req.body.hour,
      numberOfPeople: req.body.numberOfPeople,
      resaName: req.body.resaName,
      resaPhone: req.body.resaPhone,
      status: req.body.status,
    });
    await userConnected.save();
  }

  res.json({ userConnected });
});

//querring the BDD
router.get("/reservation", async function (req, res, next) {
  var userConnected = await userModel.findOne({
    token: req.body.tokenFromRedux,
  });
  // if (userConnected.token == req.body.tokenFromRedux) {
  //   var reservations = userConnected.reservations;
  // }
  var userReservations = [];

  var result = false;

  if (userConnected !== null) {
    userReservations = userConnected.reservations;
    result = true;
  }
  res.json({ userReservations, result });
});

module.exports = router;
