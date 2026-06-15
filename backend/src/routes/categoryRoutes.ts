import express from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  createSubCategory, 
  updateSubCategory 
} from '../controllers/categoryController.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .put(updateCategory);

router.route('/subcategories')
  .post(createSubCategory);

router.route('/subcategories/:id')
  .put(updateSubCategory);

export default router;
