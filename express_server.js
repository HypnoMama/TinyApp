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

//register page
app.get("/register", (req, res) => {
  res.render("registration");
})

//gets registration info and adds to users object
app.post("/register", (req, res) => {
  let password = req.body.password
  let email = req.body.email
  let id = generateRandomString();
  if (email === '' || password === '') {
    return res.send('400 bad request')
  }
  for (person in users) {
    if (users[person].email === email) {
      return res.send("Bad request: 400")
    }
  }
  users[id] = {id, email, password};
  console.log(users)
  res.cookie("user_id", users[id].id);
  res.redirect("/urls");

})


app.get("/urls", (req, res) => {
  let userID = req.cookies['user_id']
  let userEmail = users[userID].email
  res.render("urls_index", {urlDatabase: urlDatabase, username: userEmail});
});



//NEW ROUTE
app.get("/urls/new", (req, res) => {
  let userID = req.cookies['user_id'];
  if (!userID) {
    return res.redirect("/login");
  } else {
    let userEmail = users[userID].email
    res.render("urls_new", {username: userEmail});
  }

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
  let userID = req.cookies['user_id']
  let userEmail = users[userID].email
  res.render("urls_show", {shortURL: req.params.id, urlDatabase: urlDatabase, username: userEmail} )
});

//DELETE ROUTE
app.post('/urls/:id/delete', (req, res) => {
  let shortURL = req.params.id;
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


app.get("/login", (req, res) => {
  console.log(users)
  res.render("login", );
})


//COOKIE ROUTE
app.post("/login", (req, res) => {
  let password = req.body.password
  let email = req.body.email
  if (email === '' || password === '') {
    return res.send('400 bad request')
  }

  for (person in users) {

    if (users[person].email === email) {
      break;
    if (users[person].email !== email){
      return res.send("403: Forbidden");
    }
  }
}

  res.cookie("user_id", users[person].id);
  return res.redirect("/");

});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/login');
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

