const mongoose = require("mongoose"); //part 1 

const Schema = mongoose.Schema;

const bcrypt = require('bcryptjs'); //?

let userSchema = new Schema({ //// to be defined on new connection (see initialize)
    "userName": {
        "type": String,
        "unique": true
    },

    "password": String,
    "email": String,

    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

var User = mongoose.model('User', userSchema);
module.exports = User;


module.exports.initialize = function() { //initialize
    return new Promise(function(resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://nbarrero:EngzEvk3bB8SQ81s@senecaweb.x5fzslg.mongodb.net/?retryWrites=true&w=majority");
        db.on('error', (err) => {


            reject(err);
        });
        //
        db.once('open', () => {
            console.log("Connected to Db mongoose!");
            User = db.model("users", userSchema);
            resolve();
        });
    });
};


module.exports.registerUser = function(userData) {
    
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2)
            reject("Passwords do not match");

        bcrypt.hash(userData.password, 10).then(hash => {

            userData.password = hash; // create newUser (username), save
            let newUser = new User(userData);
            newUser.save()
                .then(result => {
                    resolve();
                })
                .catch(err => {
                   
                    if (err && err.code === 11000)  
                        reject("User Name already taken");
                        
                    else if (err && err.code !== 11000)
                        reject("There was an error creating the user: " + err);
                    else
                        console.log("issue here");
                });

        }).catch(err => {
            console.log("Reject");
            reject(err);
        });

    });
}


module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then(users => {
                bcrypt.compare(userData.password, users[0].password).then(res => {

                    if (res === true) {
                        users[0].loginHistory.push({ dateTime: (new Date()).toString(), 
                            userAgent: userData.userAgent });
                        User.updateOne({ userName: users[0].userName }, 
                            { $set: { loginHistory: users[0].loginHistory } }, { multi: false })
                            .exec()
                            .then(() => { resolve(users[0]) })
                            .catch(err => { reject("There was an error verifying the user: " + err) })
                    } else {
                        reject("Incorrect password: " + userData.userName);
                    }
                })
            })
            .catch(() => {
                reject("Unable to find user: " + userData.userName);
            })
    })
};