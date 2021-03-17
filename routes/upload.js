const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload');

router.post('/test-image',uploadController.postTestImage);
router.post('/template-image',uploadController.postTemplateImage);

// router.post('/template-image');

module.exports = router;