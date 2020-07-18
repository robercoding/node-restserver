//===========================
//  PORT
//===========================
process.env.PORT = process.env.PORT || 3000;


// ===========================
// ENVIRONMENT  
// ===========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===========================
// TOKEN EXPIRES
// ===========================
// 60 seconds
// 60 minutes
// 24 hours
// 30 days
process.env.TOKEN_EXPIRE = 60 * 60 * 24 * 30;


// ===========================
// AUTH SEED
// ===========================
process.env.SEED = process.env.SEED || 'development-seed';


// ===========================
// DATABASE
// ===========================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //Deployed and credentials has been protected
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB