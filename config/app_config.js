const APP_CONFIG = {};
APP_CONFIG.PORT = 3000;
APP_CONFIG.baseUrl = (process.env.dev ? "localhost" :
    "ec2-13-126-178-201.ap-south-1.compute.amazonaws.com") + ":" + APP_CONFIG.PORT;

exports.appConfig = APP_CONFIG;