import express from 'express';
import { getStudyData } from '../controllers/studyController.js';

const router = express.Router();

router.get('/', getStudyData);

export default router;

