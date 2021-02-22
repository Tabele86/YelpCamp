const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

//reviews
router.post(
	'/',
	isLoggedIn,
	validateReview,
	catchAsync(async (req, res) => {
		// res.send('YOU MADE IT!!!');
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
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
	isLoggedIn,
	isReviewAuthor,
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
