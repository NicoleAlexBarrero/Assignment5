//Assignment 5
const Sequelize = require('sequelize');

// set up sequelize to point to our postgres database
var sequelize = new Sequelize('lsegflza', 'lsegflza', 'KSrSVwpI7BCvN6eqtCT-0m4FsttYtv2e', { //
    host: 'ruby.db.elephantsql.com', //
    database: 'lsegflza', //needed?
    username: 'lsegflza', //needed?
    password: 'KSrSVwpI7BCvN6eqtCT-0m4FsttYtv2e', //needed?

    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

//

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });



// Define a "Project" model

const Post = sequelize.define('Post', { //const needed?
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

// synchronize the Database with our models and automatically add the 
// table if it does not exist

//sequelize.sync().then(function () {

    // create a new "Project" and add it to the database
//    Project.create({
//       title: 'Project1',
 //       description: 'First Project'
 //   }).then(function (project) {
        // you can now access the newly created Project via the variable project
    //    console.log("success!")
   // }).catch(function (error) {
    //    console.log("something went wrong!");
    //});
//});
//



const fs = require("fs");

let posts = [];
let categories = [];

module.exports.initialize = function () {
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(() => {
            resolve("success! synced database");
        })
        .catch(() => {
            reject("unable to sync the database");
        })
    });
}

module.exports.getAllPosts = function(){
    return new Promise(function(resolve, reject) {
        Post.findAll()
            .then((data) => {
                let err = 5 / 0; //confusion...
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });
}

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });
}

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({ //
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(data => {
            resolve(data);
        }).catch(err => {
            reject("no results returned");
        });

    });
}



module.exports.getPostById = function(id){
    return new Promise((resolve,reject)=>{
        Post.findAll({
            where: {
                id: id
            }
        })
        .then((data) => {
            resolve(data[0]); //?
        })
        .catch(() => {
            reject("no results returned")
        })
});
}





module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        //to ensure that this value is set correctly
        postData.published = (postData.published) ? true : false;
        
        for (const property in postData) {
            if (postData[property] === "") {
                postData[property] = null;
            }
        }

        postData.postDate = new Date(); //assign a value for postDate

        Post.create({ //Question: ...
                id: postData.id,
                title: postData.title,
                body: postData.body,
                postDate: postData.postDate,
                category: postData.category,
                featureImage: postData.featureImage,
                published: postData.published
            })
            .then(resolve())
            .catch(reject('unable to create post'))
    });
};

module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll({
                where: {
                    published: true //This function will invoke the Post.findAll() function and filter the results by "published" (using the value true)
                }
            })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned")
            })
    });
}

module.exports.getPublishedPostsByCategory = function(category){
    return new Promise(function(resolve, reject) {
        Post.findAll({
                where: {
                    category: category
                }
            })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned")
            })
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });
}



//Adding new blog-service.js functions
module.exports.addCategory = (categoryData) => {
    return new Promise(function(resolve, reject) {
        // we must ensure that any blank values in categoryData are set to null
        for (var prop in categoryData) {
            if (categoryData[prop] == "") {
                categoryData[prop] = null;
            }
        }
        Category.create(categoryData)
            .then(resolve())
            .catch(reject('unable to create category'))
    });
};

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
                where: {
                    id: id
                }
            })
            .then(resolve())
            .catch(reject('unable to delete category'))
    })
};


module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
                where: {
                    id: id
                }
            })
            .then(() => {
                resolve()
            })
            .catch(() => {
                reject('unable to delete post')
            })
    })
};