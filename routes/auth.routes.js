const bcryptjs = require('bcryptjs')
// const router = require('express').Router()
const { Router } = require('express');
const router = new Router();
const User = require('../models/User.model')
const saltRounds = 10;

const { isLoggedOut } = require('../middlewares/route-guard');

router.get("/signup", (req,res) => {
        res.render("auth/signup")
})

router.post("/signup", async(req,res) => {
    console.log(req.body)
    const {username, password} = req.body;
    try{
        if(!username || !password)
        {
            res.render('auth/signup', {errorMessage: 'Please enter both, email and password to login'})
            return;
        }

        // const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        // if (!regex.test(password)) {
        //     res
        //         .status(500)
        //         .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
        //     return;
        // }

        const salt = await bcryptjs.genSalt(saltRounds)
        const passwordHash = await bcryptjs.hash(password,salt)
        const userCreated = await User.create({username: username, password: passwordHash})
        console.log(userCreated);
        res.redirect("/auth/login")
    }catch(error){
        console.error(error);
    }
})

router.get("/login",isLoggedOut, (req,res) => {
    res.render("auth/login")
})

router.post("/login", async(req,res) => {
    console.log(req.body)
    console.log('SESSION =====> ', req.session);
    const {username, password} = req.body;
    try{
        if(!username || !password)
        {
            res.render('auth/login', {errorMessage: 'Please enter both, email and password to login'})
            return;
        }
        //encontramos el usuario en la base de datos con el findOne
        const user = await User.findOne({username:username})
        if(!user) //no user in the data base
        {
            console.log("There is no user with that username")
            res.render('auth/login',{errorMessage: 'User not found and/or incorrect password'})
            return;
        }else if (bcryptjs.compareSync(password, user.password)) //username and password match
        {
            req.session.currentUser = user;
            // res.render('users/user-profile',{user});
            res.redirect('/users/user-profile') //como quiero redireccionar sin el /auth hay que poner un slash / before the users
        }else{
            //the user exists but the password is incorrect
            console.log("The password is incorrect");
            res.render('auth/login',{errorMessage: 'Incorrect password'})
            return;
        }
    }catch(error){
        console.error(error);
    }
})

router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) next(err);
        res.redirect('/');
    });
})

module.exports = router;