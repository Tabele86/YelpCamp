const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//reviews
router.post(
	'/',
	validateReview,
	catchAsync(async (req, res) => {
		// res.send('YOU MADE IT!!!');
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		console.log('Review Submitted', review);
		await campground.save();
		req.flash('success', 'Created new review!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);
//delete reviews
router.delete(
	'/:reviewId',
	catchAsync(async (req, res) => {
		// res.send('DELETE ME!');
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		console.log(`Review ${reviewId} deleted`);
		req.flash('success', 'Successfully deleted review');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
