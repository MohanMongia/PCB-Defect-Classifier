const fs = require('fs').promises;
const path = require('path')
const price=[25,25,25,25,25,25];
const Defects = require('../models/defect');


// Index Page

exports.getIndex = (req,res,next) => {
    res.render('index',{isLoggedIn : req.session.isLoggedIn});
}

// Working Page

exports.getMainpage = (req,res,next) => {
    // console.log(req);
    res.render('main',{
        data:req.session.tempDefectStore.tesm,
        results:req.session.tempDefectStore.report,
        counter:req.session.tempDefectStore.maintain_count_error,
        prices:req.session.tempDefectStore.price ? req.session.tempDefectStore.price : price,
        img_diff:req.session.tempDefectStore.image_diff_created,
        isLoggedIn :req.session.isLoggedIn
    });
}

//About Page

exports.getAbout = (req,res,next) => {
    res.render('about',{isLoggedIn : req.session.isLoggedIn});
}

// Developers Page

exports.getContact = (req,res,next) => {
    res.render('developer',{isLoggedIn : req.session.isLoggedIn});
}

// Contact form page

exports.getConnect = (req,res,next) => {
    res.render('contact',{isLoggedIn : req.session.isLoggedIn});
}

//BLog Page

exports.getBlog = (req,res,next) => {
    res.render('blog',{isLoggedIn : req.session.isLoggedIn});
}

// Record prices for each defect by user

exports.getPriceRecorder = (req,res,next)=>{
    res.render('price',{
        prices: req.session.tempDefectStore.price ? req.session.tempDefectStore.price : price 
    });
}
exports.postPriceRecorder = (req,res)=>{
    ////do the recording of data
    const newPrice = [0,0,0,0,0,0];
    const defects=['spur','spurious_copper','short','mousebite','pinhole','open'];
    for(var i=0;i<defects.length;i++)
    {
        const delta=defects[i];
        const rec=req.body[delta].substr(2);
        newPrice[i]=rec;
    }
    req.session.tempDefectStore.price = newPrice;
    console.log(req.session.tempDefectStore.price);
    res.redirect('/mainpage');
}



// Create differentiated images and contours 

exports.postImageDiff = (req,res) => {
    if(req.session.tempDefectStore.real_result.length!=0 || !req.session.tempDefectStore.tesm[0] || !req.session.tempDefectStore.tesm[1])
    {
        res.redirect('/mainpage');
    }
    else
    {
        if(!req.session.tempDefectStore.image_diff_created)
        {
            var cp=require('child_process');
            var process=cp.execFile('python3',['./web/api/image_diff.py',req.session.tempDefectStore.tesm[0],req.session.tempDefectStore.tesm[1]],(error,out,err)=>{
                if(error)
                {
                    console.log(error);
                }
                else
                {
                    if(err)
                        console.log(err);
                    else
                    {
                        diff_Images=out.split('\n');
                        diff_Images.pop();
                        req.session.tempDefectStore.both_img = [diff_Images[0],diff_Images[1]];
                        diff_Images.shift();
                        diff_Images.shift();
                        diff_Images.pop();
                        req.session.tempDefectStore.contours = [...diff_Images];
                        console.log(req.session.tempDefectStore.both_img);
                        req.session.tempDefectStore.image_diff_created=true;
                        res.redirect('/mainpage');
                    }
                }
            });
        }
        else
        {
            console.log('Already done');
            res.redirect('/mainpage');
        }
    }
}

// Run Pipeline

exports.postRunPipeline = (req,res) => {
    var total;
    if(req.session.tempDefectStore.tesm.length!=0)
    {
        total=req.session.tempDefectStore.contours.length;
    }
    else
        total=0;
    if(total==0 || req.session.tempDefectStore.real_result.length!=0)
    {
        res.redirect('/mainpage');
    }
    else
    {
        req.session.tempDefectStore.pipeline_run=true;
        // console.log(req.session.tempDefectStore.contours);
        let cp=require('child_process');
        var process = cp.execFile('python3', ['./web/api/classifier.py',...req.session.tempDefectStore.contours],(error,out,err)=>{
            if(error)
            {
                console.log(error);
            }
            else
            {
                if(err)
                    console.log(err);
                else
                {
                    // console.log(out.toString());
                    let temp=out.toString().split(',');
                    if(temp.length!=1)
                    {
                        for(let i=0;i<temp.length;i++)
                        {
                            if(i==0)
                            {
                                temp[i]=temp[i].substr(2,temp[i].length-3);
                            }
                            else if(i==temp.length-1)
                            {
                                temp[i]=temp[i].substr(2,temp[i].length-5);
                            }
                            else
                            {
                                temp[i]=temp[i].substr(2,temp[i].length-3);
                            }
                        }
                    }
                    else
                    {
                        temp[0]=temp[0].substr(2,temp[i].length-5);
                    }
                    console.log(temp);
                    for(let i=0;i<6;i++)
                    {
                        req.session.tempDefectStore.maintain_count_error[i]=0;
                    }
                    for(let i=0;i<temp.length;i++)
                    {
                        req.session.tempDefectStore.real_result.push(temp[i]);
                        req.session.tempDefectStore.report[req.session.tempDefectStore.contours[i]]=temp[i];
                        if(temp[i]=='spur')
                            req.session.tempDefectStore.maintain_count_error[0]++;
                        else if(temp[i]=='spurious_copper')
                            req.session.tempDefectStore.maintain_count_error[1]++;
                        else if(temp[i]=='short')
                            req.session.tempDefectStore.maintain_count_error[2]++;
                        else if(temp[i]=='mousebite')
                            req.session.tempDefectStore.maintain_count_error[3]++;
                        else if(temp[i]=='pinhole')
                            req.session.tempDefectStore.maintain_count_error[4]++;
                        else if(temp[i]=='open')
                            req.session.tempDefectStore.maintain_count_error[5]++;
                        // console.log(temp[i]);
                    }
                    console.log(req.session.tempDefectStore.report);
                }
                res.redirect('/mainpage');
            }
        });
    }
}

// Reset everything without saving

exports.postResetter = (req,res)=>{
    //    MUI   IMPORTANTE   will have to delete everything before starting all over again
    // const firstallPromises = [];
    const allPromises = [];
    let tesm0Promise,tesm1Promise,diffW0_imagePromise,diffW2_imagePromise,diffW3_imagePromise,diffW4_imagePromise;
    // let first,second,fourth,fifth,sixth,seventh;
    if(req.session.tempDefectStore.tesm[0])
    {
        tesm0Promise = fs.unlink(path.join(__dirname,'..',req.session.tempDefectStore.tesm[0])); //correct
        allPromises.push(tesm0Promise);
    }
    if(req.session.tempDefectStore.tesm[1])
    {
        tesm1Promise = fs.unlink(path.join(__dirname,'..',req.session.tempDefectStore.tesm[1])); //correct
        allPromises.push(tesm1Promise);
    }
    if(req.session.tempDefectStore.contours.length>0)
    {
        for(let i=0;i<req.session.tempDefectStore.contours.length;i++)
        {
            let temp;
            // console.log(exists);
            temp=fs.unlink(path.join(__dirname,'..','web','contours',req.session.tempDefectStore.contours[i])); //correct
            allPromises.push(temp);
        }
    }
    if(req.session.tempDefectStore.both_img[0])
    {
        diffW0_imagePromise = fs.unlink(path.join(__dirname,'..','web','display_comb_cntrs',req.session.tempDefectStore.both_img[0]));
        allPromises.push(diffW0_imagePromise);
        diffW3_imagePromise = fs.unlink(path.join(__dirname,'..','web','images',req.session.tempDefectStore.both_img[0]));
        allPromises.push(diffW3_imagePromise);
    }
    if(req.session.tempDefectStore.both_img[1])
    {
        diffW2_imagePromise = fs.unlink(path.join(__dirname,'..','web','display_comb_cntrs',req.session.tempDefectStore.both_img[1]));
        allPromises.push(diffW2_imagePromise);
        diffW4_imagePromise = fs.unlink(path.join(__dirname,'..','web','images',req.session.tempDefectStore.both_img[1]));
        allPromises.push(diffW4_imagePromise);
    }
    Promise.all(allPromises)
        .then(result => {
            // console.log(result);
            // console.log('Done');
            req.session.tempDefectStore.tesm=[];
            req.session.tempDefectStore.result=[];
            req.session.tempDefectStore.real_result=[];
            req.session.tempDefectStore.report={};
            req.session.tempDefectStore.user_given_result=[];
            req.session.tempDefectStore.both_img=[];
            req.session.tempDefectStore.maintain_count_error=[-1,-1,-1,-1,-1,-1];
            req.session.tempDefectStore.contours = [];
            req.session.tempDefectStore.image_diff_created=false;
            req.session.tempDefectStore.pipeline_run=false;
            req.session.tempDefectStore.result_created=false;
            req.session.isDataSaved=false;
            // console.log('After resetting',req.session.tempDefectStore);
            res.redirect('/mainpage');
    })
    .catch(err => console.log(err));
}

// Report and Feed back

exports.getReport = (req,res,next)=>{
    res.render('linked',{
        data:req.session.tempDefectStore.both_img,
        error_count:req.session.tempDefectStore.maintain_count_error,
        created:req.session.tempDefectStore.image_diff_created,
        result_created:req.session.tempDefectStore.pipeline_run,
        isLoggedIn : req.session.isLoggedIn
    });
}
 // Updating Defects


exports.getUpdateDefects = (req,res)=>{
    if(req.session.tempDefectStore.pipeline_run)
        res.render('update',{results:req.session.tempDefectStore.report});
    else
        res.redirect('/mainpage');
}

exports.postUpdateDefects = (req,res) => {
    var responses=req.body.responses;
    for(var i=0;i<responses.length;i++)
    {
        if(responses[i]=='correct')
        {
            req.session.tempDefectStore.user_given_result[i]=(req.session.tempDefectStore.real_result[i]);
        }
        else
        {
            req.session.tempDefectStore.user_given_result=(responses[i]);
        }
    }
    console.log(req.session.tempDefectStore.user_given_result);
    res.redirect('/linked');
}


// exports.postSendMail = (req,res)=>{
//     let email=req.body.email;
//     let cp=require('child_process').execFile;
//     if(real_result.length==0)
//     {
//         console.log('No result to create');
//         res.redirect('/linked');
//     }
//     else if(result_created)
//     {
//         cp('python3', ['./web/api/mailer.py',email,req.user._id],(error,out,err)=>{
//             if(error)
//             {
//                 console.log(error);
//             }
//             else
//             {
//                 console.log(out);
//             }
//         });
//         res.redirect('/linked');
//     }
//     else
//     {
//         real_result.unshift('./web/api/xresult_create1.py');
//         real_result.push(req.user._id);
//         let spawn=require('child_process').spawn;
//         let process = spawn('python3', real_result);
//         process.stdout.on('data',(data) => {
//             console.log(data.toString());
//         });
//         process.stderr.on('data',(data) => {
//             console.log('File not created');
//             console.log(data.toString());
//         });
//         process.on('exit',() => {
//             result_created=true;
//             cp('python3', ['./web/api/mailer.py',email,req.user._id],(error,out,err)=>{
//                 if(error)
//                 {
//                     console.log(error);
//                 }
//                 else
//                 {
//                     console.log(out);
//                 }
//             });
//             res.redirect('/linked');
//         });
//     }
// }

exports.saveData = async (req,res,next) => {
    if(req.session.isDataSaved)
    {
        return res.json({
            message: "Data Already saved once. Please select the reset/proceed to next classification button for new defect operation"
        });
    }
    if(!req.session.tempDefectStore)
    {
        return res.json({
            message: "Not Saved"
        });
    }
    const savedData = {};
    const defects = [];
    for(const path in req.session.tempDefectStore.report)
    {
        defects.push({
            path: path,
            result: req.session.tempDefectStore.report[path]
        });
    }
    // delete req.session.tempDefectStore.report;
    savedData.defects = defects;
    console.log(req.session);
    savedData.userId = req.session.user._id;
    savedData.differentiatedImages = [req.session.tempDefectStore.both_img[0],req.session.tempDefectStore.both_img[1]];
    savedData.testImage = req.session.tempDefectStore.tesm[0];
    savedData.templateImage = req.session.tempDefectStore.tesm[0];
    savedData.counter = req.session.tempDefectStore.maintain_count_error;
    console.log(savedData);
    try{
        const newDefect = new Defects(savedData);
        await newDefect.save();
        req.session.isDataSaved = true;
        res.redirect('/mainpage');
    }
    catch(err){
        console.log('Unable to save the data to the database');
        console.log(err);
        res.status(404).json({
            message: 'Internal Server Error'
        })
    }
    // console.log(defects);
}

exports.dashboardData = async (req,res,next) => {
    const pastDefects = await Defects.find({userId:req.session.user._id}).sort('-createdAt');
    // console.log(pastDefects);
    res.render('dashboard',{
        isLoggedIn: req.session.isLoggedIn,
        defects:pastDefects
    });
}

exports.getDashboardDefect = async (req,res,next) => {
    const defectId = req.params.defectId;
    const defect = await Defects.findById(defectId);
    console.log(defect);
    res.render('past-defect',{
        isLoggedIn:req.session.isLoggedIn,
        testImage: defect.testImage,
        templateImage: defect.templateImage,
        results: defect.defects,
        counter: defect.counter,
        prices: [25,25,25,25,25,25],
        defectId: defect._id
    });
}


exports.getPastReport = async (req,res,next)=>{
    const defectId =  req.params.defectId;
    const defect = await Defects.findById(defectId);
    res.render('dashboard-linked',{
        data:defect.differentiatedImages,
        error_count:defect.counter,
        isLoggedIn : req.session.isLoggedIn,
        defectId:defectId
    });
}