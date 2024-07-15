import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { queue as SplitFileQueue } from './workers/splitFile';
import { queue as PredictSegmentQueue } from './workers/predictSegment';
import { queue as AddToDatabaseQueue } from './workers/addToDatabase';
import { queue as SendNotificationQueue } from './workers/sendNotification';
import { queue as GenerateProblemsQueue } from './workers/generateProblems';
import { queue as StoreProblemsQueue } from './workers/storeProblems';
import session from 'express-session';
import { Express } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ensureLoggedIn } from 'connect-ensure-login';
import config from '../config';

const localStrategy = new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  (username, password, cb) => {
    if (
      username === config.ADMIN_USERNAME &&
      password === config.ADMIN_PASSWORD
    ) {
      return cb(null, { user: 'bull-board' });
    }
    return cb(null, false);
  },
);

passport.serializeUser((user: any, cb) => {
  cb(null, user);
});

passport.deserializeUser((user: any, cb) => {
  cb(null, user);
});

passport.use(localStrategy);

const queues = [
  new BullMQAdapter(SplitFileQueue),
  new BullMQAdapter(PredictSegmentQueue),
  new BullMQAdapter(AddToDatabaseQueue),
  new BullMQAdapter(SendNotificationQueue),
  new BullMQAdapter(GenerateProblemsQueue),
  new BullMQAdapter(StoreProblemsQueue),
];

const createBullDashboardAndAttachRouter = (app: Express) => {
  const adapter = new ExpressAdapter();
  adapter.setBasePath('/admin/queues');
  createBullBoard({
    queues,
    serverAdapter: adapter,
  });
  app.set('views', `${__dirname}/../web/views`);
  app.set('view engine', 'ejs');
  app.use(
    '/admin/*',
    session({
      secret: 'keyboard cat',
      cookie: {},
      saveUninitialized: true,
      resave: true,
    }),
  );
  app.use('/admin/*', passport.initialize());
  app.use('/admin/*', passport.session());
  app.get('/admin/queues/login', (req, res) => {
    res.render('login', { invalid: req.query.invalid === 'true' });
  });
  app.post(
    '/admin/queues/login',
    passport.authenticate('local', {
      failureRedirect: '/admin/queues/login?invalid=true',
      successRedirect: '/admin/queues',
    }),
  );

  app.use(
    '/admin/queues',
    ensureLoggedIn({ redirectTo: '/admin/queues/login' }),
    adapter.getRouter(),
  );
};

export { createBullDashboardAndAttachRouter };
