const jwt = require('jsonwebtoken');

module.exports = {
  response: (success, message, data=null) => {
    return {success, message, data}
  },

  verifyToken: (req, res, next) => {
    //@ ONCE LOGIN IS FINISHED, UNCOMMENT
    const header_auth = req.headers['authorization'];
    bearer_token = header_auth.split(" ")
    API_TOKEN = bearer_token[1]
    
     
    console.log(API_TOKEN)
    if(!API_TOKEN){
      return res.send({success: false, message: 'Missing token header', data: null});
    }else{
      jwt.verify(API_TOKEN, process.env.SECRET_KEY, (err, data) => {
        if(err) return res.send({success: false, message: `Token not valid`, data: null});
        else {
          req.POST_VERIFICATION = data;
          // console.log(data)
          next();
        }
      })
    }
  }
}