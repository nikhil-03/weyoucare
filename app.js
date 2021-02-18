require('dotenv').config()
const express=require("express");
const https=require("https");
const bodyParse=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session = require('express-session');
const passport=require("passport");
const passportlocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { profile } = require('console');

const app=express();

var Myemail;
var states=[];
var statesActive=[];
var statesRecover=[];
var statesDeaths=[];

app.set("view engine", "ejs");
app.use(bodyParse.urlencoded({ extended: true }));
app.use(express.static("public"));
//OAuth****************
app.use(session({
  secret:"outlittilesecret.",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());

app.use(passport.session());   // end

/*********************MONGO DB*************************/
mongoose.connect("mongodb+srv://admin-nikhil:Nikhil-03@nikhil-yoevb.mongodb.net/healthDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
const postSchema=new mongoose.Schema({
  googleId:String,
  title:String,
  content:String
 });
const Post = mongoose.model("Post",postSchema);

const medSchema=new mongoose.Schema({
  googleId:String,
  problem:String,
  symptom:String,
  medicine:String,
  age:Number
});

const PostMed = mongoose.model("PostMed",medSchema);

const docSchema=new mongoose.Schema({
  googleId:String,
  name:String,
  special:String,
  city:String,
  address:String,
  phno:String,
  age:Number
});
const PostDoc = mongoose.model("PostDoc",docSchema);

const userSchema = new mongoose.Schema({
  img:String,
  name:String,
  googleId:String
});



//OAuth part

userSchema.plugin(findOrCreate);
const User = new mongoose.model('User', userSchema);
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://weyoucare.herokuapp.com/auth/google/weyoucare",
    // callbackURL :  "http://localhost:3000/auth/google/weyoucare",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    // userProfileURL: 'http://localhost:3000/oauth2/v3/userinfo'
  },
  function(accessToken, refreshToken, profile, cb)    {
      // console.log(profile.photos[0].value);
    User.findOrCreate({ googleId: profile.id,name:profile.displayName,img:profile.photos[0].value }, function (err, user) {
      return cb(err, user);
    });
  }
));

//SESSIONS


// *****************HERE ARE COVID-BLOGS,COVID-DATA AND INDEX PAGE *************************//
app.get("/",function(req,res){
   res.render("login");
});
//google auth
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] }));

app.get("/auth/google/weyoucare", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  }); // end

  app.get("/login",function(req,res){
    res.render("login");
});

app.get("/secrets",function(req,res){
  //  console.log(req.user.id);
//  const url="https://api.covidindiatracker.com/state_data.json";
//     https.get(url, function(response){
//         var body = '';
//      response.on('data', function(chunk){
//             body += chunk;
//         });
//       response.on('end', function()
//       {
//             var covidData = JSON.parse(body);
//             for(let i=0;i<35;i++)
//             {
//             states.push(covidData[i].state);
//             statesActive.push(covidData[i].active);
//             statesRecover.push(covidData[i].recovered);
//             statesDeaths.push(covidData[i].deaths);
//             }
//       });
//     }).on('error', function(e){
//           console.log("Got an error: ", e);
//     });
    if(req.isAuthenticated()){
      // res.sendFile(__dirname+"/index.html");
      console.log(req.user.id);
      //////////////////////////////////////////////////////////////heheeee..............///////////////////////////////////////
     
User.find({ _id:req.user.id },function(err,posts){
  // if(posts)
  // {
     console.log(posts); 
     res.render("index",{ posts:posts }) 
  // }
 
});


      console.log(req.user.googleId);
  } else {
      res.redirect("/");
  }  
});
app.get("/logout",function(req,res){
  req.logOut();
  res.redirect("/");
});

app.get("/blogs",function(req,res){
  if(req.isAuthenticated()){
    res.sendFile(__dirname+"/blogs.html");
    // console.log(name);
} else {
    res.redirect("/");
}
    
});
// app.post("/first",function(req,res){
//     console.log(req.body.myemail);
//     Myemail=req.body.myemail;
//     res.redirect("#mydata");
// });

// app.post("/login",function(req,res){
//   const user = new Post({
//       username:req.body.username,
//       passport:req.body.password
//   });
//    user = new PostMed({
//     username:req.body.username,
//     passport:req.body.password
// });
// user = new PostDoc({
//   username:req.body.username,
//   passport:req.body.password
// });
//    req.logIn(user,function(err){
//       if(err){console.log(err);}
//       else{
//           passport.authenticate("local")(req,res,function(){
//               res.redirect("/first");
//           });
//       } 
//    });
// }); 

// app.get("/covid",function(req,res){
    // const url="https://api.covidindiatracker.com/state_data.json";
    // https.get(url, function(response){
    //     var body = '';
    //  response.on('data', function(chunk){
    //         body += chunk;
    //     });
    //   response.on('end', function()
    //   {
    //         var covidData = JSON.parse(body);
    //         for(let i=0;i<35;i++)
    //         {
    //         states.push(covidData[i].state);
    //         statesActive.push(covidData[i].active);
    //         statesRecover.push(covidData[i].recovered);
    //         statesDeaths.push(covidData[i].deaths);
    //         }
    //   });
    // }).on('error', function(e){
    //       console.log("Got an error: ", e);
    // });
//   res.render("list",{
//     state:states,
//     active:statesActive,
//     recover:statesRecover,
//     death:statesDeaths});
// });
// *****************HERE ARE COVID-BLOGS,COVID-DATA AND INDEX PAGE  "ENDSS"   *************************//
// app.get("/docinput",function(req,res){
//   res.render("docinput");
// });
//*****************************DATABASE blogs**********************************************************//
app.get("/postblogs",function(req,res){
    // res.send("post blog");
    // if(req.isAuthenticated()){
      res.render("blog-post");
      // console.log(name);
  // } else {
  //     res.redirect("/");
  // }
  
});
app.post("/postblogs", function(req, res){

    const post = new Post ({
      title: req.body.postTitle,
      content: req.body.postBody,
      googleId: req.user.id

    });
  // console.log(req.body.postTitle);
  // console.log(req.body.postBody);
    post.save();
  
  res.redirect("/myblog")
  });

//**********************DATABASE Medicines*************************************************************//
app.get("/medicine-post",function(req,res){
    // res.send("Medicines post");
    res.render("medicine-post");
});
app.post("/medicine-post",function(req,res){
    const post = new PostMed ({
        problem:req.body.problem,
        medicine:req.body.medicines,
        symptom:req.body.symptom,
        googleId: req.user.id,
        age:req.body.age
   });
    post.save();
    res.redirect("/mymedicine");
});

//*******************************ALL POSTS*****************************************************************//
app.get("/all-blogs",function(req,res){
    // res.render("all-blogs");
    Post.find().sort({"title":1});
    Post.find({}, function(err, posts){
        res.render("all-blogs", {
          posts: posts
          });
      });
});
//**************************************MEDICAL POST*********************************************************/
app.get("/medicines",function(req,res){
  PostMed.find().sort({"problem":1});
    PostMed.find({}, function(err, posts){
        res.render("medicines", {
          posts: posts
          });
      });
});
/**********************************SEARCH MY MEDICINE********************************************************/
app.get("/mymedicine",function(req,res){
  PostMed.find().sort({"problem":1});
  PostMed.find({googleId: req.user.id}, function(err, posts){
      res.render("mymedicine", {
        posts: posts
        });
    });
});
app.get("/mydoctor",function(req,res){
  PostDoc.find({googleId: req.user.id},function(err,posts){
    res.render("mydoctor",{
      posts:posts
    });
  });
});

/************************************SEARCH MY BLOGS*********************************************************/
app.get("/myblog",function(req,res){
  console.log(req.user.googleId);
  Post.find({googleId: req.user.id}, function(err, posts){
      res.render("myblog", {
        posts: posts
        });
    });
});
// **************************************DELETE MED*********************************************************
app.post("/deletem",function(req,res){
  res.redirect("/mymedicine");
  const idm=req.body.theitem;
  PostMed.findByIdAndRemove(idm,function(err){
    if(!err){ console.log("sucessful");  }
  });
});
// **************************************DELETE blog*********************************************************
app.post("/deleteb",function(req,res){
  const idb=req.body.theitem;
  Post.findByIdAndRemove(idb,function(err){
    if(!err){console.log("sucessfully del blog");}
  });
  res.redirect("/myblog");
});
// **************************************DELETE DOC*******************************
app.post("/deletedoc",function(req,res){
  console.log(req.body.theitem);
  const idd=req.body.theitem;
  PostDoc.findByIdAndRemove(idd,function(err){
    if(!err){console.log("sucessfully del doc");}
  });
  res.redirect("/mydoctor");
});
// ***********************************SEARCH MEDICINES*********************************************
app.post("/medicines",function(req,res){
  var search=req.body.search;
  PostMed.aggregate([
    {
      $search:
      {
        "search": {
          "query":search, "path":["problem","symptom","medicine","age"]
        }
      }
    }
  ]).exec((err,posts)=>{
    if(err){console.log(err);}
    console.log(posts);
  res.render("medicines",{posts:posts});
   });
});
// ***************************************SEARCH BLOGS**********************************************

app.post("/all-blogs",function(req,res){
  var search=req.body.search;
  Post.aggregate([
    {
      $search:
      {
        "search": {
          "query":search, "path":["title","content"]
        }
      }
    }
  ]).exec((err,posts)=>{
    if(err){console.log(err);}
    console.log(posts);
  res.render("all-blogs",{posts:posts});
   });
});
// **********************************************SEARCH DOCTORS********************************************
app.post("/alldoctor",function(req,res){
  var search=req.body.search;
  PostDoc.aggregate([
    {
      $search:
      {
        "search": {
          "query":search, "path":["name","city","address","phno","special"]
        }
      }
    }
  ]).exec((err,posts)=>{
    if(err){console.log(err);}
    console.log(posts);
  res.render("alldoctor",{posts:posts});
   });
});

// ****************************************************DOCTORS************************************************

app.get("/docinput",function(req,res){
  res.render("docinput");
});
app.post("/docinput",function(req,res){
  console.log(req.body.city);
  const post = new PostDoc ({
    name:req.body.name,
    city:req.body.city,
    address:req.body.address,
    phno:req.body.phone,
    special:req.body.special,
    googleId: req.user.id,
    age:req.body.age
});
post.save();
res.redirect("/mydoctor");
});
app.get("/alldoctor",function(req,res){
  PostDoc.find().sort({"name":1});
  PostDoc.find({},function(err,posts){
    res.render("alldoctor",{
      posts:posts
    });
  });
});




 
//*********************************************CONNECTION******************************************************/
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port,function(){
    console.log("server started sucessfully");
    
});