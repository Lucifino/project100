const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {verifyToken} = require('./utilities/helpers');

router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

const USER = require('./controllers/User');
const POST = require('./controllers/Post');

const secureConection = (req, res, next) => {
  res.send('Connection is clear');
}

//@ USER FUCTIONS
router.get('/', secureConection);
router.get('/getAllUsers', verifyToken, USER.queries.getAllUsers);
router.get('/getUserById', verifyToken, USER.queries.getUserById);
router.get('/findUserByName', verifyToken, USER.queries.findUserByName);
router.post('/createUser', USER.mutations.createUser);
router.post('/login', USER.mutations.login);
router.put('/updatepass', verifyToken, USER.mutations.updateUserPassword)
router.put('/updateinfo', verifyToken, USER.mutations.updateUserInformation)
router.put('/sendrequest', verifyToken, USER.mutations.sendFriendRequest)
router.put('/deleterequest', verifyToken, USER.mutations.deleteFriendRequest)
router.put('/acceptrequest', verifyToken, USER.mutations.acceptFriendRequest)
router.delete('/delete', verifyToken, USER.mutations.deleteUser);


//@ POST FUNCTIONS
router.get('/getAllPosts', verifyToken, POST.queries.getAllPosts);
router.get('/getPostsByUserId', verifyToken, POST.queries.getPostsByUserId)
router.post('/createPost', verifyToken, POST.mutations.createPost);
router.post('/reactToPost', verifyToken, POST.mutations.reactToPost);

module.exports = router;