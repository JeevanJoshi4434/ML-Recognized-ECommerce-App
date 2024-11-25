import express from 'express';
import AwsOperationsController from '../Controller/AWSOperations.controller.js'; 
import multer from 'multer';

const router = express.Router();
const upload = multer();
const awsOperationsController = new AwsOperationsController();

router.route('/run/model').post(upload.single('file'), async(req, res) => {
    await awsOperationsController.uploadAndProcessFile(req, res);
});

export default router;
  