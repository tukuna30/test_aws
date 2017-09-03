const APP_CONFIG = {};
APP_CONFIG.PORT = 3000;
APP_CONFIG.baseUrl = "http://" + (process.env.dev ? "localhost" :
    "ec2-13-126-178-201.ap-south-1.compute.amazonaws.com") + ":" + APP_CONFIG.PORT;
    APP_CONFIG.baseUrlWithoutPort = APP_CONFIG.baseUrl.substr(0, APP_CONFIG.baseUrl.lastIndexOf(':'));
global.appConfig = APP_CONFIG;
exports.appConfig = APP_CONFIG;