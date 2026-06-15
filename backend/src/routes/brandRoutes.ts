import express from 'express';
import { getBrands, createBrand, updateBrand } from '../controllers/brandController.js';

const router = express.Router();

router.route('/')
  .get(getBrands)
  .post(createBrand);

router.route('/:id')
  .put(updateBrand);

export default router;
