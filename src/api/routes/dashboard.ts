import express from 'express';
import { dashboardController } from '../server/dashboard';

const router = express.Router();

// Dashboard routes
router.get('/dashboard', dashboardController.getDashboardData);
router.get('/dashboard/pending-validations', dashboardController.getPendingValidations);
router.get('/dashboard/action-required', dashboardController.getActionRequired);
router.get('/dashboard/total-value', dashboardController.getTotalValue);

export default router;