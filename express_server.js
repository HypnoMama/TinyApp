const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}))

app.set("view engine", "ejs");

function generateRandomString() {
  let rand = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++)
    rand += possible.charAt(Math.floor(Math.random() * possible.length));

  return rand;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@userexample",
    password: "purple-monkey-dishwasher"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasker-funk"
  }
}

//keep track of how many times the links are clicked on
const clickedOnLinks = 0;


//INDEX ROUTE
app.get('/', (req, res) => {
  res.redirect("/urls");
});

//login page
app.get("/register", (req, res) => {
  res.render("registration");
})

//gets login info
app.post("/register", (req, res) => {
  let password = req.body.password;
  let name = req.body.email;
  res.redirect("/urls");
})


app.get("/urls", (req, res) => {
  res.render("urls_index", {urlDatabase: urlDatabase, username: req.cookies['userCookie']});
});



//NEW ROUTE
app.get("/urls/new", (req, res) => {
  let username = req.cookies['userCookie'];
  res.render("urls_new", {username: username});
});

//CREATE ROUTE
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  res.redirect('/urls/' + shortURL);
// `urls/${shortURL}`
});

//Redirects to the longURL when the short URL is clicked on
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL]
  clickedOnLinks += 1;
  res.redirect(longURL);
});


//SHOW ROUTE
app.get("/urls/:id", (req, res) => {
  res.render("urls_show", {shortURL: req.params.id, urlDatabase: urlDatabase, username: req.cookies['userCookie']} )
});

//DELETE ROUTE
app.post('/urls/:id/delete', (req, res) => {
  let shortURL = req.params.id;
  console.log(shortURL);
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//Edit Route
app.get("/urls/:id/edit", (req, res) => {
  let shortURL = req.params.id;
  res.redirect(`/urls/<%=${shortURL}`)
})

//UPDATE ROUTE
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
})

//COOKIE ROUTE
app.post("/login", (req, res) => {
  res.cookie('userCookie', req.body['username']);

  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('userCookie')
  res.redirect('/urls');
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

