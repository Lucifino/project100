const USER = require('../models/entities/User');
const FRIEND_REQUEST = require('../models/prerequisites/Friend_Requests')
const POST = require('../models/entities/Post');
const COMMENT = require('../models/entities/Comment')


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const salt_rounds = 10;
const SECRET_KEY = process.env.SECRET_KEY


const {response} = require('../utilities/helpers');

module.exports = {
  queries: {
    userSearchBy: (req, res) => {

      const {search_field, search_value} = req.body
      const queryObj = {}

      if(search_field !== '' && search_value !== ''){
        queryObj[search_field] = search_value;
      }

      console.log(queryObj)

      return USER.find({personal_information : {search_field : {$regex: search_value}}}).sort({createdAt: -1})
      .then(users => {
        return res.send(response(true, `Successfully queried users`, users))
      })
    },

    getAllUsers: (req, res) => {
      return USER.find().sort({createdAt: -1})
      .then(users => {
        return res.send(response(true, `Successfully queried users`, users))
      })
    },

    getFriends: (req, res) => {
      const {your_id} = req.POST_VERIFICATION.user_id

      return USER.findById(your_id)
      .then(user => {
        if(!user) return res.send(response(false, `user does not exist!`))
        return res.send(response(true, `Successfully queried users`, user.friends))
      })
    },

    getFriend: (req, res) => {
      const {friend_name} = req.body
      const {your_id} = req.POST_VERIFICATION.user_id

      return USER.findById(your_id)
      .then(user => {
        if(!user) return res.send(response(false, `user does not exist!`))
        if(!user.friends.includes(friend_name)) return res.send(response(false, `usernot your friend!`))
        return res.send(response(true, `Successfully queried users`, friend_name))
      })
    },

    getUserById: (req, res) => {
      const {user_id} = req.body;
      return USER.findById(user_id)
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        else return res.send((response(true, `Succesfully found user`, user)))
      })
    }
  },

  mutations: {
    createUser: (req, res) => {
      const {username, password, verified_password, personal_information} = req.body;
      if(!username) return res.send(response(false, `Username is required!`));
      if(!password) return res.send(response(false, `Pass is required`));
      if(password !== verified_password) return res.send(response(false, `Passwords do not match`));
      if(!personal_information) return res.send(response(false, `Personal information is required!`));
  
      let information = JSON.parse(personal_information);
      const {first_name, middle_name, last_name, birthday, email_address} = information;
      if(!first_name) return res.send(response(false, 'First name is required!'));
      if(!last_name) return res.send(response(false, 'Last name is required!'));
      if(!birthday) return res.send(response(false, 'Birthday is required!'));
      if(!email_address) return res.send(response(false, 'Email address is required!'));
  
      return USER.findOne({username})
      .then(user => {
        if(user) return res.send(response(false, `Username already taken`));
        return bcrypt.hash(password, salt_rounds, (err, hash) => {
          const new_user = new USER({username, password: hash, personal_information: information})
          return new_user.save()
          .then(result => {
            return res.send(response(true, `Succesfully added user!`, result.username))
          })
        })
      })
    },

    processFriendRequest: (req,res) => {
      const {username} = req.body;
      if(!username) return res.send(response(false, `Username is required!`));

      return USER.findOne({username: req.POST_VERIFICATION.username})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        return USER.findOne({username})
        .then(user2 => {
          if(!user2) return res.send((response(false, `User does not exist!`)));

          //IF USER EXISTS ALREADY, PULL IT FROM THE ARRAY
          if(user2.friend_requests.includes(user.username)){
            return user2.updateOne({$pull: {friend_requests: user.username}}, {new: true})
            .then(result => {
              if(!result) return res.send(response(false, `Update Error!`));
              return res.send(response(true, `Succesfully removed request!`, result))
            })
          }else{
            // ELSE JUST PUSH
            return user2.updateOne({ $push: { friend_requests: user.username }}, {new:true})
            .then(result => {
              if(!result) return res.send(response(false, `Update Error!`));
              return res.send(response(true, `Succesfully sent friend request!`, result))
            })
          }
        })
      })
    },

    declineFriendRequest: (req,res) => {
      const {username} = req.body;
      if(!username) return res.send(response(false, `Username is required!`));
      const source_id = req.POST_VERIFICATION.user_id

      return USER.findById(source_id)
      .then(user_will_decline => {
        if(!user_will_decline) return res.send(response(false, `User Does Not Exist!`));
        return USER.findOne({username})
        .then(user_declined => {
          if(!user_declined) return res.send(response(false, `User Does Not Exist!`));
          if(!user_will_decline.friend_requests.includes(username)) return res.send(response(false, `No Such Request Exists!`));
          return user_will_decline.updateOne({ $pull : {friend_requests: user_declined.username}}, {new: true})
          .then(result => {
            if(!result) return res.send(response(false, `Update Error!`));
            return res.send(response(true, `Declined request!`, result))
          })
        })
      })
    },

    acceptFriendRequest: (req,res) => {
      const {username} = req.body;
      const source_id = req.POST_VERIFICATION.user_id;

      console.log(username)
      if(!username) return res.send(response(false, `Username is required!`));
      
      return USER.findById(source_id)
      .then(source_user =>{
        if(!source_user) return res.send(response(false, `Your user does not exist`));
        return USER.findOne({username})
        .then(user_to_accept => {
          if(!user_to_accept) return res.send(response(false, `User does not exist!`));
          if(source_user.friend_requests.includes(username)){
            return source_user.updateOne({$pull: {friend_requests: username}, $push: {friends: username}})
            .then(() => {
              return user_to_accept.updateOne({$push: {friends: source_user.username}})
              .then(() => {
                return res.send(response(true, `Succesfully accepted ${username}`));
              })
            })
          }else{
            return res.send(response(false, `User did not send a friend request!`));
          }
        })
      })
    },

    unFriend: (req,res) => {
      const {username} = req.body;
      if(!username) return res.send(response(false, `Username is required!`));
      const source_id = req.POST_VERIFICATION.user_id;

      console.log(username)
      console.log(source_id)
      return USER.findById(source_id)
      .then(user => {
        if(!user) return res.send(response(false, `User Does Not Exist!`));
        return USER.findOne({username})
        .then(user2 => {
          if(!user2) return res.send(response(false, `User2 Does Not Exist!`));
          if(!user.includes(username)) return res.send(response(false, `No Friend Exists!`));
          return user.updateOne({ $pull : {friends: user2.username}}, {new: true})
          .then(result => {
            if(!result) return res.send(response(false, `Update Error!`));
            return user2.updateOne({ $pull : {friends: user.username}}, {new: true})
            .then(result => {
              if(!result) return res.send(response(false, `Update Error!`));
              return res.send(response(true, `Not Friends Anymore!`, result));
            })
          })
        })
      })
    },


    updateUserPassword: (req,res) => {
      const {username} = req.POST_VERIFICATION;
      const {old_password, new_password, verified_password} = req.body;
      if(!username) return res.send(response(false, `Username is required!`));
      if(!old_password) return res.send(response(false, `Old password is required!`));
      if(!new_password) return res.send(response(false, `New Pass is required`));
      if(!verified_password) return res.send(response(false, `New Pass is required`));
      if(new_password !== verified_password) return res.send(response(false, `Passwords do not match`));


      return USER.findOne({username})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        if(old_password == new_password) return res.send(response(false, `New password cannot be the same as old password`));
        return bcrypt.compare(old_password, user.password, (err, result) => {
          if(result){
            return bcrypt.hash(new_password, salt_rounds, (err, hash) => {
              return user.updateOne({password: hash})
              .then(() => {
                return res.send(response(true, `Succesfully changed password`))
              })
            })
          }else{
            return res.send(response(false, `Old password incorrect!`))
          }
        })
      })
    },

    updateUserInformation: (req,res) => {
      const {username, personal_information} = req.body;
      let information = JSON.parse(personal_information);
      const {first_name, middle_name, last_name, birthday, email_address} = information;
      if(!first_name) return res.send(response(false, 'First name is required!'));
      if(!last_name) return res.send(response(false, 'Last name is required!'));
      if(!birthday) return res.send(response(false, 'Birthday is required!'));
      if(!email_address) return res.send(response(false, 'Email address is required!'));

      return USER.findOne({username})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        return USER.findByIdAndUpdate(user._id, {personal_information: information}, {new:true})
        .then(result =>{
          if(!result) return res.send((response(false, `Update Error!`)));
          return res.send(response(true, `Succesfully updated user`, result.personal_information))
        })
      })
    },

    deleteUser: (req,res) => {
      const {username, password, verified_password} = req.body;
      if(!username) return res.send(response(false, `Username is required!`));
      if(!password) return res.send(response(false, `Pass is required`));
      if(password !== verified_password) return res.send(response(false, `Passwords do not match`));

      const {d_user_id} = req.POST_VERIFICATION.user_id

      return USER.findOne({username})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        return bcrypt.compare(password, user.password, (err, result) => {
          if(!result) return res.send((response(false, `Incorrect password!`)));
          return COMMENT.deleteMany({author : user.username})
          .then(comment => {
            if(!comment) return res.send((response(false, `Comments not Deleted!`)));
            return POST.deleteMany({author : user.username})
            .then(post => {
              if(!post) return res.send((response(false, `Posts not Deleted!`)));
              return POST.deleteMany({destination_wall : user.username})
              .then(post2 => {
                if(!post2) return res.send((response(false, `Posts not Deleted!`)));
                return USER.updateMany({ $pull : {friends: user.username}}, {new: true})
                .then(result => {
                  if(!result) return res.send((response(false, `Still Friends!`)));
                  return USER.findByIdAndDelete(d_user_id)
                  .then(result2 => {
                    if(!result2) return res.send((response(false, `Delete Error!`)));
                    return res.send((response(false, `User Deleted!`)));
                  })
                })
              })
            })
          })
        })
      })
    },

    login: (req, res) => {
      //@ Validate existence of username, and password in the paramaters
      //@ Query user using input username
      //@ If username doesn't exist, return error
      //@ Else cross-reference input password with db password using bcrypt compare
      //@ If match, update user field is_logged_in, then return token
      //@ Else return error
      const {username, password} = req.body

      if(!username) return res.send((response(false, `field: username, required!`)));
      if(!password) return res.send((response(false, `field: password, required!`)));

      return USER.findOne({username})
      .then(user => {
        if(!user) return res.send((response(false, `Account Missing!`)));
        return bcrypt.compare(password, user.password, (err, result) => {
          if(!result) return res.send((response(false, `Incorrect login!`)));
          information = user.personal_information
          return jwt.sign({ user_id: user._id, personal_information: information, username: username, is_logged_in: true }, SECRET_KEY, (err, token) => {
            if(err) return res.send((response(false, `Unkown Error!`)))
            online_id = user._id
            return USER.findByIdAndUpdate(user._id, {is_logged_in : true})
            .then(result2 =>{
              if(!result) return res.send(response(false, `login error!`))
              return res.send(response(true, `Successfuly Logged In!`, result))
            })
          })
        })
      })
    },

    logout: (req, res) => {
      //@ Validate existence of username, and password in the paramaters
      //@ Query user using input username
      //@ If username doesn't exist, return error
      //@ Else cross-reference input password with db password using bcrypt compare
      //@ If match, update user field is_logged_in, then return token
      //@ Else return error
      const {user_id} = req.POST_VERIICATION.user_id

      return USER.findById(user_id)
      .then(user => {
        if(!user) return res.send(response(false, `User Does Not Exist!`));
        return USER.findByIdAndUpdate(user_id, {is_logged_in : false}, {new : true})
        .then(result => {
          if(!result) return res.send(response(false, `Error Logging Out!`));
          req.POST_VERIFICATION = null
          return res.send(response(true, `Successfully Logged Out!`));
        })
      })
    }
  },
}