const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv')
dotenv.config()
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const User = require('../models/user');
const { ObjectID } = require('mongodb');

exports.getLogin = (req,res,next) => {
    res.render('auth/login')
}

exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email})
        .then(user => {
            if(user)
            {
                return bcrypt.compare(password,user.password)
                    .then(boolResult => {
                        if(boolResult)
                        {
                            req.session.user = user;
                            req.session.isLoggedIn = true;
                            req.session.tempDefectStore = {}
                            req.session.tempDefectStore.tesm=[];
                            req.session.tempDefectStore.real_result=[];
                            req.session.tempDefectStore.report={};
                            req.session.tempDefectStore.user_given_result=[];
                            req.session.tempDefectStore.both_img=[];
                            req.session.tempDefectStore.maintain_count_error=[-1,-1,-1,-1,-1,-1];
                            req.session.tempDefectStore.contours = [];
                            req.session.tempDefectStore.image_diff_created=false;
                            req.session.tempDefectStore.pipeline_run=false;
                            req.session.tempDefectStore.result_created=false;
                            console.log('User logged in successfully');
                            return res.redirect('/');
                        }
                        console.log('Wrong Password');
                        return res.redirect('/login');    
                    })
                    .catch(err => console.log(err));
            }
            console.log('No User Found');
            return res.redirect('/login');    
        })
        .catch(err => console.log(err));
}

exports.getSignup = (req,res,next) => {
    res.render('auth/sign-up');    
}

exports.postSignup = (req,res,next) => {
    const fullname = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email:email})
        .then(user => {
            if(!user)
            {
                bcrypt.hash(password,12)
                    .then(hashedPassword => {
                        const user = new User({
                            name: fullname,
                            email: email,
                            password: hashedPassword
                        });
                        return user.save()
                    })
                    .then(result => {
                        console.log('User created successfully');
                        res.redirect('/login');
                    })
                    .catch(err => console.log(err));
            }
        })
}

exports.postLogout = (req,res,next) => {
    req.session.destroy(err => {
        console.log('Session ended');
        res.redirect('/');
    })
}

exports.getReset = (req,res,next) => {
    res.render('auth/reset-password');
}

exports.postReset = (req,res,next) => {
    const email = req.body.email;
    User.findOne({email: email})
        .then(user => {
            if(!user)
            {
                res.redirect('/reset');
                console.log('No User Found. Please enter a valid email id');
            }
            else
            {
                user.resetToken = crypto.randomBytes(32).toString('hex');
                console.log(user.resetToken);
                user.resetTokenExpiry = Date.now() + 3600000;
                return user.save()
                    .then(result => {
                        sgMail.send({
                            to: user.email,
                            from: 'pcb.defect.classifier@gmail.com',
                            subject: 'Password Reset Link',
                            html:`<h1>Here is  link to reset your password</h1>
                                <a href="http://localhost:3000/reset/${user.resetToken}">Click on the link to reset your password</a>`
                        })
                        .then(result=> {
                            console.log('link Sent to your email please open the link');
                            res.redirect('/reset');
                        })
                        .catch(err => console.log(err))
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
}

exports.getNewPassword = (req,res,next) =>{
    const token = req.params.token;
    User.findOne({resetToken: token})
        .then(user => {
            if(!user)
            {
                console.log('Invalid token');
                res.redirect('/reset');
            }
            else
            {
                if(user.resetTokenExpiry>=Date.now())
                {
                    res.render('auth/new-password',{
                        token: token,
                        userId: user._id
                    });
                }
                else
                {
                    console.log('Expired. Please request for the link again');
                }
            }
        })
        .catch(err => {
            console.log(err);
        })
}

exports.postNewPassword = (req,res,next) => {
    const token = req.body.token;
    const userId = req.body.userId;
    console.log(token, ObjectID.isValid(userId));
    const newPassword = req.body.password;
    const newConfirmPassword = req.body.confirmPassword;
    User.findOne({_id: userId,resetToken:token})
        .then(user => {
            if(!user)
            {
                console.log('Expired. Please request for the link again');
                res.redirect('/reset');
            }
            else
            {
                user.resetToken = undefined;
                user.resetTokenExpiry = undefined;
                bcrypt.hash(newPassword,12)
                    .then(hashedPassword => {
                        user.password = hashedPassword;
                        return user.save();
                    })
                    .then(result => {
                        console.log('Password updated')
                        res.redirect('/login');
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));

}