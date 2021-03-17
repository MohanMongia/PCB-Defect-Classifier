const app=require('express')();
const express=require('express');
const bp=require('body-parser');
const mongoose= require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'images');
    },
    filename: (req,file,cb) => {
        cb(null,Date.now() + file.originalname);
    }
});

// const fileFilter = (req,file,cb) => {
//     if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg')
//     {
//         console.log()
//         cb(null,true);
//     }
//     else
//     {
//         cb(null,false);
//     }
// }

const dotenv = require('dotenv')
dotenv.config()

const uri = process.env.MONGODBUri;
const User = require('./models/user');

const uploadRoutes = require('./routes/upload');
const allRoutes = require('./routes/routes');
const authRoutes = require('./routes/authRoutes');

app.set('view engine','ejs');

// app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(multer({storage: storage}).single('image'));

app.use(express.static('public'));
app.use('/web',express.static(__dirname+'/web'));
app.use('/images',express.static('images'));


const store = new MongoDBStore({
    uri: uri,
    collection: 'session'
})

app.use(session({
    secret: process.env.sessionSecret,
    store: store,
    resave: false,
    saveUninitialized: false
}))

app.use((req,res,next) => {
    if(!req.session.user)
    {
        return next();
    }
    User.findOne({_id: req.session.user._id})
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
            next();
        })
})

app.use(authRoutes);
app.use(allRoutes);
app.use('/upload',uploadRoutes);

mongoose.connect(uri,{ useUnifiedTopology: true, useNewUrlParser: true})
    .then(result => {
        app.listen('3000',function(err,res){
            console.log("SERVER LISTENING AT PORT 3000");
        });
    })
    .catch(err => console.log(err));

