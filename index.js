const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');
const s3 = require('./s3');
const appConfig = require('./config/app_config').appConfig;
const fs = require('fs');
let socketConnection = null;
let http = require('http').Server(app);

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

scServer.on('connection', function (socket) {
  console.log('a user connected');
  socketConnection = socket;
});

let bodyParser = require('body-parser');
let passport = require('passport'),
  session = require('express-session'),
  FacebookStrategy = require('passport-facebook').Strategy,
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

app.use(bodyParser.json({ limit: '100mb' }));
app.use(fileUpload());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(session({ secret: 'testawssessionkey' }));
app.use(passport.initialize());
app.use(passport.session());

http.listen(appConfig.PORT, () => console.log('Server running on port ' + appConfig.PORT));

//configure facebook login 
passport.use(new FacebookStrategy({
  clientID: "218755845322867",
  clientSecret: "edd5e8b5407e803e3f0dfefdd1cde738",
  callbackURL: appConfig.baseUrlWithoutPort + "/auth/facebook/callback"
},
  function (accessToken, refreshToken, profile, done) {
    console.log('success');
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
    console.log('profile facebook ' + JSON.stringify(profile));
    done(null, profile);
  }
));

passport.serializeUser(function (user, done) {
  console.log('Serialize user done' + JSON.stringify(user));
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  console.log('Deserialize user is attempted' + id);
  done(null, id);
  // User.findById(id, function(err, user) {
  //   done(err, user);
  // });
});

//setup google statergy
passport.use(new GoogleStrategy({
  clientID: "10697359226-a1o961pp6e97e9hohck2n77pm50nmopd.apps.googleusercontent.com",
  clientSecret: "_MpeFAfYocuytfQSTjgVF3OG",
  callbackURL: appConfig.baseUrlWithoutPort + "/auth/google/callback"
},
  function (accessToken, refreshToken, profile, done) {
    console.log('profile google ' + JSON.stringify(profile));
    done(null, profile);
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
    scope: ['https://www.googleapis.com/auth/plus.login']
  }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    console.log('successfull google login')
    res.redirect('/app');
  });

app.get('/logout', function (req, res) {
  req.session.destroy(function (e) {
    console.log('destroying session for user ...');
    req.logout();
    res.redirect('/');
  });
});

app.post('/upload', function handleUpload(req, response) {
  req.setTimeout(10 * 60 * 1000);
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
      socketConnection.emit('fileUploadProgress', progressVal);
    });
  });
});

function isUserSignedIn(req, res, next) {
  console.log(JSON.stringify(req.session));
  if (req.session.passport && req.session.passport.user) {
    next();
  } else {
    //next(new Error("Not signed in!"));
    //res.redirect('/');
    res.sendFile('login.html', { root: __dirname + '/views/' });
  }
}

app.get('/app', isUserSignedIn, function (req, res) {
  console.log('Authorised User ');
  res.sendFile('index.html', { root: __dirname + '/views/' });
});

app.get('/', isUserSignedIn, function (req, res) {
  console.log('Authorised User ');
  res.sendFile('index.html', { root: __dirname + '/views/' });
});

app.get('/login', isUserSignedIn, function (req, res) {
  console.log('Authorised User ');
  res.sendFile('index.html', { root: __dirname + '/views/' });
});