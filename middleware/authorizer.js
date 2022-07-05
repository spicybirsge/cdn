const AUTH_KEY = process.env.AUTH_KEY
const authorizer = (req, res, next) => {
  const key = req.query.key;
  if(!key) {
    
    return res.sendStatus(403);
 
  }

  if(key === AUTH_KEY) {
   
   return next();
  
  } else {
 
    return res.sendStatus(403);
  
  }
}

module.exports = authorizer;