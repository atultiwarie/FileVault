const express = require("express");
const router = express.Router();

const { body, validationResult } = require("express-validator");

const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const authMiddleware = require("../middlewares/auth");


router.get("/", (req, res) => {
  res.render("index");
});
router.get("/register", (req, res) => {
  res.render("register");
});

router.post(
  "/register",
  body("email").trim().isEmail().isLength({ min: 13 }),
  body("password").trim().isLength({ min: 5 }),
  body("username").trim().isLength({ min: 3 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Invalid data",
      });
    }
    const { email, username, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      email,
      username,
      password: hashPassword,
    });
    res.json(newUser);
  }
);

router.get("/login", (req, res) => {
  res.render("login");
});

router.post(
  "/login",
  body("username").trim().isLength({ min: 3 }),
  body("password").trim().isLength({ min: 5 }),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        erros: errors.array(),
        message: "Wrong Combination of username and password",
      });
    }
    const { username, password } = req.body;
    const user = await userModel.findOne({
      username: username,
    });

    if (!user) {
      return res.status(400).json({
        message: "Username or password is incorrect",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Username or password is incorrect",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET
    );

   res.cookie('token',token )

  //  res.send('Loggen In')
  res.json({ message: "Logged In" });

  }
  
);
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});


router.get("/check-auth", authMiddleware, (req, res) => {
  res.json({ authenticated: true });
});

module.exports = router;
