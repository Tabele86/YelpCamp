const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
const _db = 'yelp-camp'; //insertDBname
const Campground = require('../models/campground');

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

//random array function
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			//creates random campground names
			title: `${sample(descriptors)} ${sample(places)}`,
			image: 'https://source.unsplash.com/collection/483251',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat totam necessitatibus suscipit quam nobis laboriosam corporis nam! Voluptates quam quod fugiat esse dolorem delectus aliquid. Omnis assumenda asperiores incidunt nobis.',
			price
		});
		await camp.save();
	}
};

seedDB()
	.then(() => {
		console.log('Database seeded');
		db.close();
	})
	.catch((err) => {
		console.log('Database error');
		console.log(err);
	});
