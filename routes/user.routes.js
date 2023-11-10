const { Router } = require('express');
const router = new Router();
const User = require('../models/User.model');
const { isLoggedIn } = require('../middlewares/route-guard');


router.get("/user-profile",isLoggedIn, (req,res) => {
    const user = req.session.currentUser
    res.render("users/user-profile", {user} )
})

module.exports = router;