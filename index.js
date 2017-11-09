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

function setCurrentUser(user) {
  let pattern = '__INJECT_GLOBAL_HERE__', file = "./views/index.html";
  let userString = "window.trythings.currentUser=" + JSON.stringify(user);
  fs.readFileSync(file, 'utf8', function (err, data) {
    if (err) {
      return console.error('Unable to open file: ', error);
    }
    if (data.indexOf(pattern) !== -1) {
      var result = data.replace(pattern, userString);
      fs.writeFileSync(file, result, 'utf8', function (err) {
        if (err) {
          console.log('file write failed ' + err);
        }
      });
    }
  });
}

let socketClusterServer = require('socketcluster-server');
let scServer = socketClusterServer.attach(http);

let bodyParser = require('body-parser');
let passport = require('passport'),
  session = require('express-session'),
  FacebookStrategy = require('passport-facebook').Strategy,
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let sessionStore = new session.MemoryStore;

//CORS Config
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://ec2-13-126-178-201.ap-south-1.compute.amazonaws.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.json({ limit: '100mb' }));
app.use(fileUpload());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(session({ store: sessionStore, secret: 'testawssessionkey', key: 'express.sid' }));
app.use(passport.initialize());
app.use(passport.session());

http.listen(appConfig.PORT, () => console.log('Server running on port ' + appConfig.PORT));

//configure facebook login 
passport.use(new FacebookStrategy({
  clientID: appConfig.facebookClientId,
  clientSecret: appConfig.facebookSecret,
  callbackURL: appConfig.baseUrlWithoutPort + "/auth/facebook/callback",
  profileFields: ['id', 'emails', 'name', 'photos']
},
  function (accessToken, refreshToken, profile, done) {
    console.log('Facebook profile' + JSON.stringify(profile));
    User.findOrCreate(profile).then(function (user) {
      done(null, user);
    }, function (error) {
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
    User.findOrCreate(profile).then(function (user) {
      done(null, user);
    }, function (error) {
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

function validateUpload(req, res, next) {
  let user = req.session.passport.user;
  let userId = user.id;
  let userSpace = user.displayName ? user.displayName + "_" + userId : userId;

  s3.apis.viewContainerData(userSpace, 'test-bucket-tukuna').then(function (response) {
    if (response.data.containerSize / 1048576 < 500) {
      next();
    } else {
      return res.status(200).send({ data: 'Consumed your free space. Time to buy more space!!!', type: 'error' });
    }
  });
}

app.post('/upload', validateUpload, function handleUpload(req, response) {
  let user = req.session.passport.user;
  req.setTimeout(10 * 60 * 1000);
  let userSocket = socketConnectionStore.find(function (socket) {
    return socket.userId === user.id;
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
    let userSpace = user.displayName ? user.displayName + "_" + user.id : user.id;
    let awsUpload = s3.apis.uploadFilesToContainer(file.name, userSpace, function (uploadStatus) {
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

app.post('/createUserSpace', function (req, res) {
  let user = req.session.passport.user;
  let userId = user.id;
  let userSpace = user.displayName ? user.displayName + "_" + userId : userId;
  s3.apis.createContainer(userSpace, function (response) {
    if (response.type === 'error') {
      return res.status(500).send(response.data);
    }
    else if (response.type === 'warning') {
      return res.status(200).send(response.data);
    }
    else {
      return res.status(200).send(response.data);
    }
  });
});

app.get('/userData', function (req, res) {
  let user = req.session.passport.user;
  let userId = user.id;
  let userSpace = user.displayName ? user.displayName + "_" + userId : userId;

  s3.apis.viewContainerData(userSpace, 'test-bucket-tukuna').then(function (response) {
    if (response.type === 'error') {
      return res.status(500).send(response.data);
    } else {
      return res.status(200).send(response.data);
    }
  }, function () {
    return res.status(500).send(response.data);
  });
});

function isUserSignedIn(req, res, next) {
  if (req.session.passport && req.session.passport.user) {
    let pattern = '__INJECT_GLOBAL_HERE__', file = "./views/index.html";
    let userString = "window.trythings.currentUser=" + JSON.stringify(req.session.passport.user);
    console.log('reading index.html');
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        console.error('Unable to open file: ', error);
        res.sendFile('index.html', { root: __dirname + '/views/' });
        return;
      }
      let content = data.replace(pattern, userString);
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.write(content);
      res.end();
    });
  } else {
    //next(new Error("Not signed in!"));
    //res.redirect('/');
    res.sendFile('login.html', { root: __dirname + '/views/' });
  }
}

app.get('/app', isUserSignedIn, function (req, res) {
  //res.sendFile('index.html', { root: __dirname + '/views/' });
});

app.get('/', isUserSignedIn, function (req, res) {
  //res.sendFile('index.html', { root: __dirname + '/views/' });
});

app.get('/guest', function (req, res) {
  res.sendFile('guest.html', { root: __dirname + '/views/' });
});

app.get('/login', isUserSignedIn, function (req, res) {
  //res.sendFile('index.html', { root: __dirname + '/views/' });
});
app.get('/about', isUserSignedIn, function (req, res) {
  //res.redirect('/');
});
app.get('/books(\/:bookId)', isUserSignedIn, function (req, res) {
  //res.redirect('/');
});