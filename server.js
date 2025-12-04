/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Juwairiyyah Ahmed Student   ID: 173801234   Date: 2025-12-2
*
*********************************************************************************/
require("dotenv").config();
require("pg");
const express = require("express");

const path = require("path");
const exphbs = require("express-handlebars");
// security header
const helmet = require("helmet");
const clientSessions = require("client-sessions");
// connect to mongoose
const mongoose = require("mongoose");
const { sequelize } = require("./src/db/index.js");
// routes
const authRoutes = require("./src/routes/auth.js");
const taskRoutes = require("./src/routes/tasks.js");
const { ensureAuth } = require("./src/middleware/auth.js");

// create express app
const app = express();

// set security header
app.use(helmet(
  {
  contentSecurityPolicy: false
  })
);
// the template engine setup
app.engine('hbs', exphbs.engine(
  {
  extname: '.hbs',
  helpers: {
    eq: (a, b) => a === b,
    formatDate: d => (d ? new Date(d).toISOString().slice(0, 10) : '')
    }
  }
));

// sets the view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src', 'views'));
// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Client's sessions
const durationMs = (parseInt(process.env.SESSION_DURATION_MIN || '30', 10)) * 60 * 1000;
app.use(
  clientSessions(
    {
    cookieName: process.env.SESSION_COOKIE || 'session',
    secret: process.env.SESSION_SECRET,
    duration: durationMs,
    activeDuration: 5 * 60 * 1000, 
    cookie: 
    {
      httpOnly: true,
      secure: false,
    }
    }
  )
);
// middleware to make user data available in all views
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  res.locals.appName = process.env.APP_NAME || 'Hybrid Task';
  next();
});

// routes
app.get('/', (req, res) => {
  if (req.session?.user) return res.redirect('/dashboard');
  res.redirect('/login');
});

app.use(authRoutes); // authentication route
app.use(ensureAuth, taskRoutes); // task route

// 404 and 500 error pages
app.use((req, res) => {res.status(404).render("404", {
    title: "Not Found",
    message: "Page not found",
  });
});
app.use((err, req, res, next) => {console.error(err);
  res.status(500).render("500", {
    title: "Server Error",
    error: err.message,
  });
});

let dbInitialized = false;
async function initConnections() {
  if (dbInitialized) return;
  await mongoose.connect(process.env.MONGO_URI);
  await sequelize.authenticate();
  await sequelize.sync();
  dbInitialized = true;
}
module.exports = {
  app,
  initConnections,
};
//end of server.js