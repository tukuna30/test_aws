const APP_CONFIG = {};
APP_CONFIG.PORT = process.env.dev ? 443 : 3000;
APP_CONFIG.baseUrl = "https://" + (process.env.dev ? "localhost" : "myodisha.xyz");
APP_CONFIG.googleClientId = process.env.dev ? '10697359226-bbfdtuonamgf7bmqkv70ujaa5j3vr4jh.apps.googleusercontent.com' :
    '10697359226-a1o961pp6e97e9hohck2n77pm50nmopd.apps.googleusercontent.com';
APP_CONFIG.googleSecret = process.env.dev ? 'n3NwfevsoXepBPylih6soB3I' : '_MpeFAfYocuytfQSTjgVF3OG';

APP_CONFIG.facebookClientId = process.env.dev ? '507569746253955' : '218755845322867';

APP_CONFIG.facebookSecret = process.env.dev ? '38a2761088a936e0b27ac44393be32fd' : 'edd5e8b5407e803e3f0dfefdd1cde738';
global.appConfig = APP_CONFIG;
exports.appConfig = APP_CONFIG;