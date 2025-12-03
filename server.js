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
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import exphbs from 'express-handlebars';
// security header
import helmet from 'helmet';
import clientSessions from 'client-sessions';
// mongoose
import mongoose from 'mongoose';
import { sequelize } from './src/db/index.js';
// routes
import authRoutes from './src/routes/auth.js';
import taskRoutes from './src/routes/tasks.js';
import { ensureAuth } from './src/middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// security header
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

app.use(authRoutes); // authentication routes
app.use(ensureAuth, taskRoutes); // task routes

// 404 and 500 error handlers
app.use((req, res) => {
  return res
    .status(404)
    .render('404', { title: 'Not Found', message: 'Page not found' });
});
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .render('500', { title: 'Server Error', error: err.message });
});

import serverless from "serverless-http";
async function initConnections() {
  if (!global.mongooseConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    global.mongooseConnected = true;
  }

  if (!global.pgConnected) {
    await sequelize.authenticate();
    await sequelize.sync();
    global.pgConnected = true;
  }
}
await initConnections();
export const handler = serverless(app);
//end of server.js