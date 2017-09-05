const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');
const s3 = require('./s3');
const appConfig = require('./config/app_config').appConfig;
const fs = require('fs');
const cookie = require('cookie');
let socketConnectionStore = [];
let http = require('http').Server(app);
let User = require('./models/user').User;

const file = './assets/js/app.js';
fs.readFile(file, 'utf8', function (err, data) {
  if (err) {
    return console.error('Unable to open file: ', error);
  }
  if (data.indexOf('APP_BASE_URL') !== -1) {
    var result = data.replace(/APP_BASE_URL/g, appConfig.baseUrl);
    fs.writeFile(file, result, 'utf8', function (err) {
      if (err) {
        console.log('file write failed ' + err);
      }
    });
  }
});

let socketClusterServer = require('socketcluster-server');
let scServer = socketClusterServer.attach(http);

let bodyParser = require('body-parser');
let passport = require('passport'),
  session = require('express-session'),
  FacebookStrategy = require('passport-facebook').Strategy,
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let sessionStore = new session.MemoryStore;

app.use(bodyParser.json({ limit: '100mb' }));
app.use(fileUpload());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(session({ store: sessionStore, secret: 'testawssessionkey', key: 'express.sid' }));
app.use(passport.initialize());
app.use(passport.session());

//CORS Config
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://ec2-13-126-178-201.ap-south-1.compute.amazonaws.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

http.listen(appConfig.PORT, () => console.log('Server running on port ' + appConfig.PORT));

//configure facebook login 
passport.use(new FacebookStrategy({
  clientID: appConfig.facebookClientId,
  clientSecret: appConfig.facebookSecret,
  callbackURL: appConfig.baseUrlWithoutPort + "/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name', 'photos']
},
  function (accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile).then(function(user) {
      done(null, user);
    }, function(error) {
      return done(error); 
    });
  }
));

passport.serializeUser(function (user, done) {
  console.log('Serialize user done');
  done(null, user);
});

//before a socket is created get the authenticated user associated with it;
scServer.addMiddleware(scServer.MIDDLEWARE_HANDSHAKE,
  function (req, next) {
    let sessionID = cookie.parse(req.headers.cookie)['express.sid'].split('.')[0].split(':')[1];
    if (sessionID) {
      sessionStore.get(sessionID, function (err, session) {
        if (err || !session) {
          console.log('unable to retrieve user socket from socket store:- ' + err);
          console.log('safely destryoing session');
          //TODO:- shall user session be destroyed?
          next(err);
        } else {
          req.userId = session.passport ? session.passport.user.id : undefined;
          next();
        }
      });
    }
  }
);

//after socket is created store it by associating to a user, to notify specific user
scServer.on('connection', function (socket, data) {
  let userId = socket.request.userId;
  console.log('a user socket established for user: ' + userId);
  if (userId) {
    let userSocket = socketConnectionStore.find(function (socket) {
      return socket.userId === userId;
    });
    if (userSocket) {
      userSocket.socket = socket;
    } else {
      socketConnectionStore.push({ userId: socket.request.userId, socket: socket });      
    }
  }
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

//setup google statergy
passport.use(new GoogleStrategy({
  clientID: appConfig.googleClientId,
  clientSecret: appConfig.googleSecret,
  callbackURL: appConfig.baseUrlWithoutPort + "/auth/google/callback",
  profileFields: ['id', 'emails', 'name', 'photos']
},
  function (accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile).then(function(user) {
      done(null, user);
    }, function(error) {
      return done(error); 
    });
  }
));

//facebook routes
app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
  }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
  function (req, res) {
    console.log('successfull facebook login')
    res.redirect('/app');
  });

//google routes
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
  }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    console.log('successfull google login')
    res.redirect('/app');
  });

app.get('/logout', function (req, res) {
  let userSocket = socketConnectionStore.find(function (socket) {
    return socket.userId === req.session.passport.user.id;
  });
  if (userSocket) {
    let index = socketConnectionStore.indexOf(userSocket);
    if (index > -1) {
      socketConnectionStore.splice(index, 1);
    }
  }

  req.session.destroy(function (e) {
    console.log('destroying session for user ...');
    req.logout();
    res.redirect('/');
  });
});

app.post('/upload', function handleUpload(req, response) {
  req.setTimeout(10 * 60 * 1000);
  let userSocket = socketConnectionStore.find(function (socket) {
    return socket.userId === req.session.passport.user.id;
  });

  if (!req.files) {
    return response.status(400).send('No files were uploaded.');
  }
  console.log('upload in progress!!!');
  let file = req.files.imageFiles;
  console.log(file);
  file.mv("./uploaded_files/" + file.name, function (err) {
    if (err)
      return res.status(500).send(err);

    let awsUpload = s3.apis.uploadFilesToContainer(file.name, function (uploadStatus) {
      if (uploadStatus.type === 'error') {
        return response.status(400).send(uploadStatus.data);
      }
      else {
        fs.unlink("./uploaded_files/" + file.name, function (err) {
          if (err) {
            return console.log(err);
          }
          console.log('file deleted successfully');
        });
        return response.status(200).send(uploadStatus.data);
      }
    });
    awsUpload.on('httpUploadProgress', function (progress) {
      let progressVal = progress.loaded / progress.total * 100;
      console.log('Upload progress:- ' + progressVal + '%');
     
      if (userSocket && userSocket.socket) {
        userSocket.socket.emit('fileUploadProgress', progressVal);
      }
    });
  });
});

function isUserSignedIn(req, res, next) {
  if (req.session.passport && req.session.passport.user) {
    next();
  } else {
    //next(new Error("Not signed in!"));
    //res.redirect('/');
    res.sendFile('login.html', { root: __dirname + '/views/' });
  }
}

app.get('/app', isUserSignedIn, function (req, res) {
  res.sendFile('index.html', { root: __dirname + '/views/' });
});

app.get('/', isUserSignedIn, function (req, res) {
  res.sendFile('index.html', { root: __dirname + '/views/' });
});

app.get('/login', isUserSignedIn, function (req, res) {
  res.sendFile('index.html', { root: __dirname + '/views/' });
});