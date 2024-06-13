const AUTH_KEY = process.env.AUTH_KEY
const safeCompare = require('safe-compare');
const authorizer = (req, res, next) => {
  const key = req.query.key;
  if(!key) {
    
    return res.sendStatus(403);
 
  }

  const isKeyCorrect = safeCompare(key, AUTH_KEY)
  if(isKeyCorrect) {
   
   return next();
  
  } else {
 
    return res.sendStatus(403);
  
  }
}

module.exports = authorizer;