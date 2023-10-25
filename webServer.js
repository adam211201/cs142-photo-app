/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');
const fs = require('fs');

var express = require('express');
var app = express();

const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');

var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(__dirname));
app.use(session({ secret: 'secretKey', resave: false, saveUninitialized: false }));
app.use(bodyParser.json());

/*
 * Route: /admin
 */

app.post('/admin/login', async (req, res) => {
	const req_body = req.body;
	const login_name = req_body.login_name;
	const password = req_body.password;

	try {
		const user = await User.findOne({ login_name: login_name }, '_id first_name last_name location description occupation login_name password');

		if (user === null) {
			throw new Error('User does not exist!');
		} else if (password !== user.password) {
			throw new Error('Incorrect password!');
		} else {
			const id = await user._id;

			req.session.user_id = id;

			await User.updateOne(
				{ _id: id },
				{
					$set: {
						activity: {
							activity: 'logged in!',
							photo_id: '',
						},
					},
				}
			);

			let userObj = JSON.parse(JSON.stringify(user));
			delete userObj.password;

			res.status(200).send(userObj);
		}
	} catch (err) {
		console.error('Doing /admin/login error:', err.message);

		res.status(400).send(err.message);
	}
});

app.post('/admin/logout', (req, res) => {
	const id = req.session.user_id;

	delete req.session.user_id;

	try {
		req.session.destroy(async (err) => {
			await User.updateOne(
				{ _id: id },
				{
					$set: {
						activity: {
							activity: 'logged out!',
							photo_id: '',
						},
					},
				}
			);

			if (err) {
				console.error('Doing /admin/logout error:', err);
			}
		});

		res.status(200).send('Logged out!');
	} catch (err) {
		res.status(400).send('Could not logout!');
	}
});

/*
 * Route: /
 */

app.get('/', (req, res) => {
	if (!req.session.user_id) {
		res.status(401).send('User is not logged in!');
	} else {
		res.send('Simple web server of files from ' + __dirname);
	}
});

/*
 * Route: /user
 */

app.post('/user', async (req, res) => {
	const req_body = req.body;
	const login_name = req_body.login_name;
	const password = req_body.password;
	const first_name = req_body.first_name;
	const last_name = req_body.last_name;
	const location = req_body.locationPlace;
	const description = req_body.description;
	const occupation = req_body.occupation;

	try {
		if (!login_name) {
			throw new Error('No username entered!');
		} else if (!password) {
			throw new Error('No password entered!');
		} else if (!first_name) {
			throw new Error('No first name entered!');
		} else if (!last_name) {
			throw new Error('No last name entered!');
		}

		const existsUser = await User.findOne({ login_name: login_name }, '_id');

		if (existsUser !== null) {
			throw new Error('Username already exists!');
		} else {
			const userObj = {
				login_name,
				password,
				first_name,
				last_name,
				location,
				description,
				activity: {
					activity: 'registered as a user!',
					photo_id: '',
				},
				occupation,
			};

			try {
				const user = await User.create(userObj);

				user.save();

				res.status(200).send(JSON.parse(JSON.stringify(user)));
			} catch (err) {
				if (err) {
					console.error('Doing /user error:', err);

					res.status(400).send('Could not create user!');
				}
			}
		}
	} catch (err) {
		console.error('Doing /user error:', err.message);

		res.status(400).send(err.message);
	}
});

app.get('/user/list', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		try {
			const users = await User.find({}, '_id first_name last_name activity');

			res.status(200).send(JSON.parse(JSON.stringify(users)));
		} catch (err) {
			console.error('Doing /user/list error:', err);

			res.status(500).send(JSON.stringify(err));
		}
	}
});

/*
 * Route: /user/:id
 */

app.get('/user/:id', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const id = req.params.id;

		try {
			const user = await User.findById(id, '_id first_name last_name location description occupation');

			res.status(200).send(JSON.parse(JSON.stringify(user)));
		} catch (err) {
			console.error('Doing /user/:id error:', err);

			res.status(400).send(JSON.stringify(err));
		}
	}
});

app.delete('/user', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const id = req.session.user_id;

		try {
			await User.deleteOne({ _id: id });
			await User.updateMany(
				{
					'favourites.user_id': id,
				},
				{ $pull: { favourites: { user_id: id } } }
			);
			await Photo.deleteMany({ user_id: id });
			await Photo.updateMany(
				{
					permissions: id,
				},
				{ $pull: { permissions: id } }
			);
			await Photo.deleteMany(
				{
					'comments.user_id': id,
				},
				{ $pull: { comments: { user_id: id } } }
			);

			res.status(200).send('User deleted!');
		} catch (err) {
			console.error('Doing /user/:id:', err.message);

			res.status(400).send(err.message);
		}
	}
});

app.get('/user/:id/photos', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const id = req.params.id;

		try {
			const photosCount = await Photo.countDocuments({ user_id: id });

			res.status(200).send({ num_photos: photosCount });
		} catch (err) {
			console.error('Doing /user/:id/photos error:', err);

			res.status(400).send(JSON.stringify(err));
		}
	}
});

app.get('/user/:id/comments', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const id = req.params.id;

		try {
			let photos = await Photo.find({ 'comments.user_id': id }, 'file_name comments user_id');

			photos = JSON.parse(JSON.stringify(photos));

			let commentCount = 0;

			for (let i = 0; i < photos.length; i++) {
				for (let j = 0; j < photos[i].comments.length; j++) {
					if (photos[i].comments[j].user_id !== id) {
						photos[i].comments = photos[i].comments.slice(j - 1, j);
					}
				}
			}

			for (let i = 0; i < photos.length; i++) {
				for (let j = 0; j < photos[i].comments.length; j++) {
					commentCount++;
				}
			}

			res.status(200).send({ photos, num_comments: commentCount });
		} catch (err) {
			console.error('Doing /user/:id/comments error:', err);

			res.status(400).send(JSON.stringify(err));
		}
	}
});

app.get('/user/:id/mostRecentPhoto', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const id = req.params.id;

		try {
			let photos = await Photo.find({ user_id: id }, '_id file_name date_time user_id permissions');

			photos = JSON.parse(JSON.stringify(photos));

			let photoObj = {
				date_time: 0,
			};

			if (photos.length !== 0) {
				for (let i = 0; i < photos.length; i++) {
					const prevTime = new Date(photoObj.date_time).getTime();
					const currTime = new Date(photos[i].date_time).getTime();

					if (prevTime < currTime) {
						photoObj = photos[i];
					}
				}

				res.status(200).send(photoObj);
			} else {
				res.status(200).send();
			}
		} catch (err) {
			console.error('Doing /user/:id/mostRecentPhoto error:', err);

			res.status(400).send(JSON.stringify(err));
		}
	}
});

app.get('/user/:id/mostCommentedPhoto', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const id = req.params.id;

		try {
			let photos = await Photo.find({ user_id: id }, '_id file_name user_id comments');

			photos = JSON.parse(JSON.stringify(photos));

			const commentObj = {
				comment_count: 0,
			};

			if (photos.length > 0) {
				for (let i = 0; i < photos.length; i++) {
					if (commentObj.comment_count < photos[i].comments.length) {
						commentObj.file_name = photos[i].file_name;
						commentObj.comment_count = photos[i].comments.length;
						commentObj.user_id = photos[i].user_id;
					}
				}

				if (commentObj.comment_count === 0) {
					res.status(200).send();
				} else {
					res.status(200).send(commentObj);
				}
			} else {
				res.status(200).send();
			}
		} catch (err) {
			console.error('Doing /user/:id/mostRecentPhoto error:', err);

			res.status(400).send(JSON.stringify(err));
		}
	}
});

/*
 * Route: /photosOfUser/:id
 */

app.get('/photosOfUser/:id', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const id = req.params.id;

		try {
			let photos = await Photo.find({ user_id: id }, '_id file_name date_time user_id comments visibility permissions');

			photos = JSON.parse(JSON.stringify(photos));

			let i = photos.length;
			while (i--) {
				if (!photos[i].visibility) {
					let canBeSeen = false;

					for (const permission of photos[i].permissions) {
						if (permission === req.session.user_id) {
							canBeSeen = true;
						}
					}

					if (!canBeSeen) {
						photos.splice(i, 1);
					}
				}
			}

			async.each(
				photos,
				async (photo, done) => {
					/* eslint-disable no-await-in-loop */
					for (let comment of photo.comments) {
						try {
							const user = await User.findById(comment.user_id, '_id first_name last_name');

							delete comment.user_id;

							comment.user = JSON.parse(JSON.stringify(user));
						} catch (err) {
							done(err);
						}
					}
					/* eslint-disable no-await-in-loop */
				},
				(err) => {
					if (err) {
						console.error('Doing /photosOfUser/:id error:', err);

						res.status(400).send(JSON.stringify(err));
					} else {
						res.status(200).send(photos);
					}
				}
			);
		} catch (err) {
			console.error('Doing /photosOfUser/:id error:', err);

			res.status(400).send(JSON.stringify(err));
		}
	}
});

/*
 * Route: /photo/
 */

app.post('/photos/new', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		try {
			processFormBody(req, res, (err) => {
				if (err || !req.file) {
					throw new Error('File could not be uploaded!');
				} else if (req.file.size === 0) {
					throw new Error('Issue with file being uploaded.');
				}

				const timestamp = new Date().valueOf();
				const filename = 'U' + String(timestamp) + req.file.originalname;
				const path = `./images/${filename}`;

				const visibility = req.body.visibility === 'true';
				let shareToUsers = req.body.sharing_permissions ? req.body.sharing_permissions : [];

				if (!visibility && shareToUsers.length !== 0) {
					shareToUsers = shareToUsers.split(',');
				}

				shareToUsers.push(req.session.user_id);

				fs.writeFile(path, req.file.buffer, async (error) => {
					if (error) {
						throw new Error('Could not write photo to system!');
					} else {
						const photoObj = {
							file_name: filename,
							date_time: timestamp,
							user_id: req.session.user_id,
							visibility: visibility,
							permissions: shareToUsers,
							comments: [],
						};

						const photo = await Photo.create(photoObj);

						photo.save();

						await User.updateOne(
							{ _id: req.session.user_id },
							{
								$set: {
									activity: {
										activity: 'uploaded a photo!',
										photo_id: photo.file_name,
									},
								},
							}
						);

						res.status(200).send(JSON.parse(JSON.stringify(photo)));
					}
				});
			});
		} catch (err) {
			res.status(400).send(err.message);
		}
	}
});

app.delete('/photo/:photo_id', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const photo_id = req.params.photo_id;

		try {
			if (!photo_id) {
				throw new Error('Photo must exist!');
			} else {
				await Photo.deleteOne({ _id: photo_id });
				await User.updateMany(
					{
						'favourites.photo_id': photo_id,
					},
					{ $pull: { favourites: { photo_id } } }
				);

				res.status(200).send('Photo deleted!');
			}
		} catch (err) {
			console.error('Doing /photo/:photo_id:', err.message);

			res.status(400).send(err.message);
		}
	}
});

/*
 * Route: /comment/
 */

app.delete('/comment/:photo_id/:comment_id', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const photo_id = req.params.photo_id;
		const comment_id = req.params.comment_id;

		try {
			if (!comment_id) {
				throw new Error('Comment must exist!');
			} else {
				await Photo.updateOne(
					{ _id: photo_id },
					{
						$pull: {
							comments: { _id: comment_id },
						},
					}
				);

				res.status(200).send('Comment deleted!');
			}
		} catch (err) {
			console.error('Doing /comments/:photo_id/:comment_id:', err.message);

			res.status(400).send(err.message);
		}
	}
});

/*
 * Route: /commentsOfPhoto/
 */

app.post('/commentsOfPhoto/:photo_id', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const req_body = req.body;
		const photo_id = req.params.photo_id;
		const comment = req_body.comment;
		const date_time = new Date();
		const user_id = req.session.user_id;

		try {
			if (!comment) {
				throw new Error('Comment cannot be empty!');
			} else {
				const commentObj = {
					comment,
					date_time,
					user_id,
				};

				await Photo.updateOne(
					{ _id: photo_id },
					{
						$push: {
							comments: commentObj,
						},
					}
				);

				await User.updateOne(
					{ _id: user_id },
					{
						$set: {
							activity: {
								activity: 'commented on a photo!',
								photo_id: '',
							},
						},
					}
				);

				res.status(200).send('Comment created!');
			}
		} catch (err) {
			console.error('Doing /commentsOfPhoto/:photo_id:', err.message);

			res.status(400).send(err.message);
		}
	}
});

/*
 * Route: /favourites
 */

app.get('/favourites', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const user_id = req.session.user_id;

		try {
			let favourites = await User.findById(user_id, 'favourites');

			favourites = JSON.parse(JSON.stringify(favourites));
			favourites = favourites.favourites;

			const favouritesArr = [];

			async.each(
				favourites,
				async (favouriteObj, done) => {
					try {
						const photo = await Photo.findById(favouriteObj.photo_id, '_id file_name date_time');

						favouritesArr.push(JSON.parse(JSON.stringify(photo)));
					} catch (err) {
						done(err);
					}
				},
				(err) => {
					if (err) {
						console.error('Doing /favourites error:', err);

						res.status(400).send(JSON.stringify(err));
					} else {
						res.status(200).send(favouritesArr);
					}
				}
			);
		} catch (err) {
			console.error('Doing /favourites:', err.message);

			res.status(400).send(err.message);
		}
	}
});

/*
 * Route: /favourites/:photo_id
 */

app.post('/favourites/:photo_id', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const photo_id = req.params.photo_id;
		const user_id = req.body.user_id;
		const id = req.session.user_id;

		try {
			// eslint-disable-next-line quote-props
			const existsFavourite = await User.findOne({ '_id': id, 'favourites.photo_id': photo_id }, '_id');

			if (existsFavourite !== null) {
				throw new Error('Photo already favourited!');
			} else if (!photo_id) {
				throw new Error('No such photo exists!');
			} else {
				await User.updateOne(
					{ _id: id },
					{
						$push: {
							favourites: { photo_id, user_id },
						},
					}
				);

				res.status(200).send('Photo favourited!');
			}
		} catch (err) {
			console.error('Doing /favourites/:photo_id:', err.message);

			res.status(400).send(err.message);
		}
	}
});

app.delete('/favourites/:photo_id', async (req, res) => {
	if (!req.session.user_id) {
		res.status(401).end('User is not logged in!');
	} else {
		const photo_id = req.params.photo_id;
		const user_id = req.session.user_id;

		try {
			await User.updateOne(
				{ _id: user_id },
				{
					$pull: {
						favourites: { photo_id: photo_id },
					},
				}
			);

			res.status(200).send('Photo deleted!');
		} catch (err) {
			console.error('Doing /favourites/:photo_id:', err.message);

			res.status(400).send(err.message);
		}
	}
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
	// Express parses the ":p1" from the URL and returns it in the request.params objects.
	var param = request.params.p1 || 'info';

	if (param === 'info') {
		// Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
		SchemaInfo.find({}, function (err, info) {
			if (err) {
				// Query returned an error.  We pass it back to the browser with an Internal Service
				// Error (500) error code.
				console.error('Doing /user/info error:', err);
				response.status(500).send(JSON.stringify(err));
				return;
			}
			if (info.length === 0) {
				// Query didn't return an error but didn't find the SchemaInfo object - This
				// is also an internal error return.
				response.status(500).send('Missing SchemaInfo');
				return;
			}

			// We got the object - return it in JSON format.
			response.end(JSON.stringify(info[0]));
		});
	} else if (param === 'counts') {
		// In order to return the counts of all the collections we need to do an async
		// call to each collections. That is tricky to do so we use the async package
		// do the work.  We put the collections into array and use async.each to
		// do each .count() query.
		var collections = [
			{ name: 'user', collection: User },
			{ name: 'photo', collection: Photo },
			{ name: 'schemaInfo', collection: SchemaInfo },
		];
		async.each(
			collections,
			function (col, done_callback) {
				col.collection.countDocuments({}, function (err, count) {
					col.count = count;
					done_callback(err);
				});
			},
			function (err) {
				if (err) {
					response.status(500).send(JSON.stringify(err));
				} else {
					var obj = {};
					for (var i = 0; i < collections.length; i++) {
						obj[collections[i].name] = collections[i].count;
					}
					response.end(JSON.stringify(obj));
				}
			}
		);
	} else {
		// If we know understand the parameter we return a (Bad Parameter) (400) status.
		response.status(400).send('Bad param ' + param);
	}
});

var server = app.listen(3000, function () {
	var port = server.address().port;
	console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
