var express = require('express');

var allControllers = require('../controllers/main');
const isAuth = require('../middleware/is-auth');

var router = express.Router();

router.get('/',allControllers.getIndex);

router.get('/mainpage',isAuth ,allControllers.getMainpage);

router.get('/about',allControllers.getAbout);

router.get('/contact',allControllers.getContact);

router.get('/connect',allControllers.getConnect);

router.get('/linked',isAuth,allControllers.getReport);

router.get('/blog',allControllers.getBlog);

router.get('/price',isAuth,allControllers.getPriceRecorder);

router.get('/update_defects',isAuth,allControllers.getUpdateDefects);

router.post('/storing_update_results',allControllers.postUpdateDefects);

router.post('/price',allControllers.postPriceRecorder);

router.post('/upl',allControllers.postImageDiff);

router.post('/piper',allControllers.postRunPipeline);

router.post('/resetter',allControllers.postResetter);

router.post('/save-data',allControllers.saveData);

router.get('/dashboard',isAuth,allControllers.dashboardData);

router.get('/mainpage/:defectId',isAuth,allControllers.getDashboardDefect);

router.get('/dashboard/linked/:defectId',isAuth,allControllers.getPastReport);



// router.post('/mailer',allControllers.postSendMail);


module.exports = router;