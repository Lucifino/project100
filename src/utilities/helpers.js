const jwt = require('jsonwebtoken');
const tokenBlacklist = []

module.exports = {
  response: (success, message, data=null) => {
    return {success, message, data}
  },

  verifyToken: (req, res, next) => {
    //@ ONCE LOGIN IS FINISHED, UNCOMMENT
    const header_auth = req.headers['authorization'];

    bearer_token = header_auth.split(" ")
    API_TOKEN = bearer_token[1]
    
    if(!API_TOKEN){
      return res.send({success: false, message: 'Missing token header', data: null});
    }else{
      console.log(tokenBlacklist);
      if(tokenBlacklist.includes(API_TOKEN)) return res.send({success: false, message: `Token not valid`, data: null});
      jwt.verify(API_TOKEN, process.env.SECRET_KEY, (err, data) => {
        if(err) return res.send({success: false, message: `Token not valid`, data: null});
        else {
          req.POST_VERIFICATION = data;
          // console.log(data)
          next();
        }
      })
    }
  },

  invalidateToken: (req, res) => {
    const header_auth = req.headers['authorization'];

    bearer_token = header_auth.split(" ")
    API_TOKEN = bearer_token[1]
    if(!API_TOKEN)return res.send({success: false, message: 'Missing token header', data: null});
    jwt.verify(API_TOKEN, process.env.SECRET_KEY, (err, data) => {
        if(err) return res.send({success: false, message: `Token not valid`, data: null});
        else {
          req.POST_VERIFICATION = null;
          req.headers['authorization'] = null;
          tokenBlacklist.push(API_TOKEN)
          return res.send({success: true, message: `Succefully logged out!`, data: null})
        }
    })
  }
}