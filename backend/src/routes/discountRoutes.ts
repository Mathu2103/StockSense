import express from 'express';
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleStatus
} from '../controllers/discountController.js';

const router = express.Router();

router.route('/')
  .get(getDiscounts)
  .post(createDiscount);

router.route('/:id')
  .put(updateDiscount)
  .delete(deleteDiscount);

router.route('/:id/status')
  .patch(toggleStatus);

export default router;
