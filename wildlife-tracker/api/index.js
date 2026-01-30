// I made this file so Vercel can run my Express app as a serverless function
const app = require("../server");

// I export my Express app so Vercel can use it
module.exports = app;
