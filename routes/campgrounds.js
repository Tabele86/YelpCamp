const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router
	.route('/')
	.get(catchAsync(campgrounds.index))
	.post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//all campgrounds
// router.get('/', catchAsync(campgrounds.index));

// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//add new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
	.route('/:id')
	.get(catchAsync(campgrounds.showCampground))
	.put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//edit campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

//show single campground
// router.get('/:id', catchAsync(campgrounds.showCampground));

// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

//delete campground
// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
