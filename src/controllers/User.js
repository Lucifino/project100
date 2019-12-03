const USER = require('../models/entities/User');
const FRIEND_REQUEST = require('../models/prerequisites/Friend_Requests')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const salt_rounds = 10;
const SECRET_KEY = process.env.SECRET_KEY


const {response} = require('../utilities/helpers');

module.exports = {
  queries: {
    getAllUsers: (req, res) => {
      return USER.find()
      .then(users => {
        return res.send(response(true, `Successfully queried users`, users))
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

  findUserByName: (req, res) => {
      const input_name = req.body.username;

      return USER.findOne({username : input_name})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        friend = req.POST_VERIFICATION.username
        console.log(typeof friend)
        return USER.findOne({username : input_name, personal_information: { friends: friend } })
        .then(result =>{
          if(!result) return res.send((response(false, `User Not Friend!`, user.personal_information)));
          return res.send((response(true, `User is Friend!`, result)));
        })
      })
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

    sendFriendRequest: (req,res) => {
      const {username} = req.body;
      if(!username) return res.send(response(false, `Username is required!`));

      const search_user = req.POST_VERIFICATION.username
      const _id = req.POST_VERIFICATION.user_id

      return USER.findOne({username: req.POST_VERIFICATION.username})
      .then(user => {
        if(!user) return res.send((response(false, `User1 does not exist!`)));
        return USER.findOne({username})
        .then(user2 => {
          if(!user2) return res.send((response(false, `User2 does not exist!`)));
         // if(user.friend_requests.equals(user2._id)) return res.send((response(false, `User already your Friend!`)));
          return USER.findOneAndUpdate( user2._id,{ $push: { friend_requests: user._id }})
           .then(result => {
           if(!result) return res.send(response(false, `Update Error!`));
           return res.send(response(true, `Succesfully Friend Request Sent!`, result))
          })
        })
      })
    },

    deleteFriendRequest: (req,res) => {
      const {username} = req.body;
      if(!username) return res.send(response(false, `Username is required!`));
      const search_id = req.POST_VERIFICATION.user_id

      return USER.findOne({search_id})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        return USER.findOne({username})
        .then(user2 => {
          if(!user2) return res.send((response(false, `User does not exist!`)));
          if(!user.friend_requests.equals(user2._id)) return res.send((response(false, `Request does not exist!`)));
          return user.personal_information.friend_requests.pull(user2)
          .then(result => {
            if(!result) return res.send(response(false, `Update Error!`));
            return res.send(response(true, `Succesfully Friend Request Deleted!`, result))
          })
        })
      })
    },

    acceptFriendRequest: (req,res) => {
      const {username} = req.body;
      if(!username) return res.send(response(false, `Username is required!`));
      const search_id = req.POST_VERIFICATION.user_id
      return USER.findOne({search_id})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        return USER.findOne({username})
        .then(user2 => {
          if(!user2) return res.send((response(false, `User does not exist!`)));
          if(!user.friend_requests.equals(user2._id)) return res.send((response(false, `Request does not exist!`)));
          return user.personal_information.friend.push(user2._id)
          .then(result => {
            if(!result) return res.send(response(false, `Update Error!`));
            return user.personal_information.friend_requests.pull(user2._id)
            .then(result => {
              if(!result) return res.send(response(false, `Update Error!`));
              return res.send(response(true, `Succesfully Friend Request Deleted!`, result))
            })
          })
        })
      })
    },

    updateUserPassword: (req,res) => {
      const {username, old_pass, new_pass, verified_password} = req.body;node 
      if(!username) return res.send(response(false, `Username is required!`));
      if(!old_pass) return res.send(response(false, `Pass verification is required!`));
      if(!new_pass) return res.send(response(false, `New Pass is required`));
      if(new_pass !== verified_password) return res.send(response(false, `Passwords do not match`));

      return USER.findOne({username})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        return USER.findByIdAndUpdate(user._id, {password: new_pass}, {new: true})
        .then(result => {
          if(!result) return res.send(response(false, `Update Error!`));
          return res.send(response(true, `Succesfully updated password`))
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

      return USER.findOne({username})
      .then(user => {
        if(!user) return res.send((response(false, `User does not exist!`)));
        return bcrypt.compare(password, user.password, (err, result) => {
          if(!result) return res.send((response(false, `Incorrect password!`)));
          return USER.deleteOne({username: user.username}, (err, result) =>{
            if(err) return res.send((response(false, `Delete Error!`, err)));
            return res.send(response(true, `Succesfully deleted user`));
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
            return res.send((response(true, `Succesfully Logged In`, token)))
          })
        })
      })
    }
  },
}