exports.postTestImage = (req,res,next) => {
    // console.log(req.file);
    // console.log(req.session);
    req.session.tempDefectStore.tesm[0] = req.file.path;
    console.log('Test file uploaded');
    console.log(req.session.tempDefectStore.tesm);
    return res.json({
        message: 'test uploaded',
        'image-src': req.file.path
    });
}

exports.postTemplateImage = (req,res,next) => {
    // console.log(req.file);
    // console.log(req.session);
    if(req.session.tempDefectStore.tesm[0])
    {
        req.session.tempDefectStore.tesm[1] = req.file.path;
        console.log('template uploaded');
        console.log(req.session.tempDefectStore.tesm);
        return res.json({
            message: 'success',
            'image-src': req.file.path
        });
    }
    else
    {
        return res.status(401).json({
            message: 'Failed. Please upload the test Image first'
        });
    }
}