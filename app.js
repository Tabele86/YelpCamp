const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsM = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas');
const _db = 'yelp-camp'; //insertDBname
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

//db
mongoose.connect(`mongodb://localhost:27017/${_db}`, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

app.engine('ejs', ejsM);
//ejs-mate = ejsM
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
	// console.log(result);
};

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
	// console.log(result);
};

app.get('/', (req, res) => {
	res.render('home');
});

//all campgrounds
app.get(
	'/campgrounds',
	catchAsync(async (req, res, next) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

//add new campground
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});
app.post(
	'/campgrounds',
	validateCampground,
	catchAsync(async (req, res, next) => {
		// res.send(req.body);
		// try {
		// if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
		// } catch (e) {
		// 	next(e);
		// }
	})
);

//single campground
app.get(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate('reviews');
		// console.log(campground);
		res.render('campgrounds/show', { campground });
	})
);

//edit campground
app.get(
	'/campgrounds/:id/edit',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/edit', { campground });
	})
);

app.put(
	'/campgrounds/:id',
	validateCampground,
	catchAsync(async (req, res) => {
		// res.send('it worked');
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

//delete campground
app.delete(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndDelete(id);
		res.redirect('/campgrounds');
	})
);

//reviews
app.post(
	'/campgrounds/:id/reviews',
	validateReview,
	catchAsync(async (req, res) => {
		// res.send('YOU MADE IT!!!');
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		console.log('Review Submitted', review);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);
//delete reviews
app.delete(
	'/campgrounds/:id/reviews/:reviewId',
	catchAsync(async (req, res) => {
		// res.send('DELETE ME!');
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		console.log(`Review ${reviewId} deleted`);
		res.redirect(`/campgrounds/${id}`);
	})
);

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});
//error catch all
app.use((err, req, res, next) => {
	// res.send('Something went wrong!');
	// const { statusCode = 500, message = 'Something went wrong!' } = err;
	// res.status(statusCode).render('error');
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong!';
	res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
	console.log('APP IS LISTENING ON PORT 3000!');
});
