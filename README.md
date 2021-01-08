# whistle
A full stack responsive Twitter-like social web app.

<img src="https://raw.githubusercontent.com/obada-dev/whistle/master/screenshots/mobile.png" height="500"> <img src="https://raw.githubusercontent.com/obada-dev/whistle/master/screenshots/tablet.png" height="500">

# Application Stack
This app has a [Node.js](https://nodejs.org/en/) backend, [MongoDB](https://www.mongodb.com/) is used to store message and user info, uploaded images are saved to `public/images`.

The front end uses vanilla js, pages are dynamically generated using [EJS](https://ejs.co/).

[Passport](https://www.npmjs.com/package/passport)/[passport-discord](https://www.npmjs.com/package/passport-discord) handle user authentication.

# Self Hosting
You need a discord account and a registered application. This app uses a local MongoDB database by default, you may also want to add a MongoDB connection key if you're using a remote database.

Add the credentials to `config/keys.js`, run `npm install` to install dependencies and `npm start` to start the app.
