var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs')
const flash = require('connect-flash')
var User = require('../model/user')
var errors = null
var error = null;
var profile = null;


router.get('/login',(req,res) => {
    // res.sendFile('login.html', { root:__dirname+"/"+ '../public/components' });
  
        res.render('components/login',{error})
    
    
})
router.get('/components/manager',(req,res) => {
    if(profile)
    res.render('components/manager',{profile})
    else {
        error = "Please login to continue"
        res.redirect('/users/login')
    }

    
})
router.get('/register',(req,res) => {
    
    res.render('components/register', {errors})
})
// router.get('/components/manager',(req,res) => {
//     res.render('components/manager')
// })

router.post('/register', (req,res) => {
   var username = req.body.username;
   var email = req.body.email;
   var password = req.body.password;
   var confirm = req.body.confirm;
   var masterPassword = req.body.masterPassword;
 
  
     
    req.checkBody('username','Please enter a username').notEmpty();
    req.checkBody('email','Please enter an email').notEmpty();
    req.checkBody('email','Please enter a valid email').isEmail();
    req.checkBody('password','A password must be set').notEmpty();
    req.checkBody('password','Must be more than 6 characters').isLength({min:6});
    req.checkBody('confirm','Password must match').equals(req.body.password);
    errors = req.validationErrors();
    if (errors) {
        res.render('components/register',{errors})
    } else {
        var newUser = new User();
        newUser.username =username ;
        newUser.email = email;
        newUser.password = password;
        newUser.masterPassword = masterPassword;
     User.createUser(newUser,(err,user) => {
       if(err) {
           throw err;
       }
       else {
        error = "You are successfully registered login now"
        res.redirect('/users/login')
       }
   })
}
})

router.post('/components/manager',(req,res) => {
    var username = profile.username;
    var github = req.body.github;
    var linkedIn = req.body.linkedIn;
    var facebook = req.body.facebook;
    var twitter = req.body.twitter;
    User.getUserByUsername(username,(err,user) =>{
        if (user) {
            user.passwords.linkedIn = linkedIn;
            user.passwords.facebook = facebook;
            user.passwords.github = github;
            user.passwords.twitter = twitter;
            profile = user;
            User.updateUser(user,(err,user) => {
                if(user) {
                    res.redirect('manager')
                }
            })
        }
    })
})

router.post("/login" , (req,res) => {
    var username = req.body.username;
    var password = req.body.password;
    User.getUserByUsername(username,(err,user) => {
        if(user) {
            bcrypt.compare(password, user.password, function(err, resp) {
                if (resp === true) {
                   profile = user;
                    res.redirect('components/manager')
                } else {
                    error = "Password not recognized"
                    res.render('components/login',{error})
                }
            });
        } else {
            error = "Invalid User"
            res.render('components/login',{error})
        }
    })
})
router.get('/facebook/callback', (req,res) => {
    res.render('components/manager')
})


module.exports = router