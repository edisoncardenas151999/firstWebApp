const router = require("express").Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;
// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Product = require("../models/products.model");

// Require necessary (isLoggedOut and isLoggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", isLoggedOut, (req, res) => {
  const { username, password, email } = req.body;
  if (!username) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your username.",
    });
  }
  if (!email) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your email.",
    });
  }

  if (password.length < 8) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
  if (!regex.test(password)) {
    return res.status(400).render("signup", {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }
  User.findOne({ username }).then((found) => {
    if (found) {
      return res
        .status(400)
        .render("auth/signup", { errorMessage: "Username already taken." });
    }
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({
          username,
          password: hashedPassword,
        });
      })
      .then((user) => {
        req.session.user = user;
        res.redirect("auth/home");
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: "Username need to be unique. The username you chose is already in use." });
        }
        return res
          .status(500)
          .render("auth/signup", { errorMessage: error.message });
      });
  });
});


router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});
router.post("/login", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .render("auth/login", { errorMessage: "Please provide your username." });
  }

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res
          .status(400)
          .render("auth/login", { errorMessage: "Wrong credentials." });
      }
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res
            .status(400)
            .render("auth/login", { errorMessage: "Wrong credentials." });
        }

        req.session.user = user;
        return res.redirect("/auth/home");
      });
    })
    .catch((err) => {
      next(err);
       return res.status(500).render("auth/login", { errorMessage: err.message });
    });
});

router.get("/home", isLoggedIn,(req, res) => {
  res.render("user/home",{user: req.session.user});
});



router.get("/info", (req, res) => {
  res.render("user/info",{user: req.session.user});
});

router.get("/contact", (req, res) => {
  res.render("user/contact",{user: req.session.user});
});


router.get("/products",(req, res, next) => {
  Product.find()
  .then((allTheProducts)=>{
    res.render("user/all-products",{product: allTheProducts})
  })
  .catch((error) => {
    console.log("Error while getting the products from the DB: ", error);
    next(error);
  });
  });


  router.get('/product/add/:id',isLoggedIn, (req, res) => {
    const productId = req.params.id;
   Product.findById(productId)
   .then((response)=>{
    res.render("user/cart", {productId: response})
  })
  })  

  router.get("/payment", isLoggedIn,(req, res) => {
    res.render("user/payment");
  });


router.post("/logout",isLoggedIn, (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect("/");
  });
});


module.exports = router;
