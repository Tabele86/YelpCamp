const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');
const _db = 'yelp-camp'; //insertDBname
const db = mongoose.connection;
const Campground = require('../models/campground');

//db
mongoose.connect(`mongodb://localhost:27017/${_db}`, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

//random array function
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 300; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			//MY AUTHOR/USER ID
			author: '6033aa02a2dc275fb4d7c665',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			//creates random campground names
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat totam necessitatibus suscipit quam nobis laboriosam corporis nam! Voluptates quam quod fugiat esse dolorem delectus aliquid. Omnis assumenda asperiores incidunt nobis.',
			price,
			geometry: {
				type: 'Point',
				coordinates: [ cities[random1000].longitude, cities[random1000].latitude ]
			},
			images: [
				{
					url:
						'https://res.cloudinary.com/db6isivlv/image/upload/v1614099958/YelpCamp/wqpk5gcv7blxhpcyajlt.jpg',
					filename: 'YelpCamp/wqpk5gcv7blxhpcyajlt'
				},
				{
					url:
						'https://res.cloudinary.com/db6isivlv/image/upload/v1614099957/YelpCamp/dzphnnyxkrknglltnrcl.jpg',
					filename: 'YelpCamp/dzphnnyxkrknglltnrcl'
				}
			]
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
