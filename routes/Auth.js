const express = require('express');
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser');


const JWT_SECRET = "My name is ramkrushna";


//ROUTE01:- creating user post:-/api/auth/createUser
router.post('/createUser', [
  body('email', 'Enter ValidEmail').isEmail(),
  body('password', 'PassWord Must be atleast 5 characters').isLength({ min: 5 }),
  body('name', 'Enter validName').isLength({ min: 3 })
], async (req, res) => {
  let success=false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }

  try {

    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({success, errors: "Sorry a user this email is already exist" });
    }

    //Logger
    //SQS

    const salt = await bcrypt.genSalt(10);
    secpass = await bcrypt.hash(req.body.password, salt);

    /*let*/  user = await User.create({
      name: req.body.name,
      password: secpass,
      email: req.body.email
    });

    const data = {
      user: {
        id: user.id
      }
    };
    const Autotoken = jwt.sign(data, JWT_SECRET);
    //res.json(user)
    success=true;
    res.json({success,Autotoken});


  } catch (error) {
    res.status(500).send("some error is occured.")
  }

  //Use below code in time of function is not async and not use await
  /*.then(user => res.json(user))
  .catch(err=>{console.log(err)
res.json({error:'please enter a unique value for email',message:err.message})})*/

});

//ROUTE02:-Authentication of user post:- /api/auth/login

router.post('/login', [
  body('email', 'Enter ValidEmail').isEmail(),
  body('password', 'PassWord cannot be blank').exists(),
], async (req, res) => {
  let success=false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success=false;
      return res.status(400).json({ errors: "please try to login with correct credentials." });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
     success=false;
      return res.status(400).json({success, errors: "please try to login with correct credentials." });
    }


    const data = {
      user: {
        id: user.id
      }
    };
    const Autotoken = jwt.sign(data, JWT_SECRET);
    //res.json(user)
    success=true;
    res.json({success,Autotoken});



  } catch (error) {
    res.status(500).send("Internal server Error.")
  }

});




//ROUTE03:-Get login user details using post:- /api/auth/getuser...Login required
router.post('/getuser',fetchuser,async (req, res) => {

try {

  let userID= req.user.id;
  const user= await User.findById(userID).select("-password");
  res.send(user);

} 
catch (error) {

  console.log(error.message);
  res.status(500).send("Internal server Error");

}

});

module.exports = router
