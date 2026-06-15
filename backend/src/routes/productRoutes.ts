import express from 'express';
import { getProducts, createProduct, updateProduct } from '../controllers/productController.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:sku')
  .put(updateProduct);

export default router;
