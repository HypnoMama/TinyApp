const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession= require('cookie-session');
const bcrypt = require('bcrypt');


app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


const urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca"
  },
  "user2RandomID": {
    "9sm5xK": "http://www.google.com"
  }
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@userexample",
    password: "test"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasker-funk"
  }
}

//keep track of how many times the links are clicked on
const linksUsed = 0;

function generateRandomString() {
  let rand = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    rand += possible.charAt(Math.floor(Math.random() * possible.length));
  return rand;
}


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
  const logInPassword = req.body.password;
  const password = bcrypt.hashSync(logInPassword, 10);
  let email = req.body.email;
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
  urlDatabase[id] = {};
  req.session.user_id = users[id].id;
  res.redirect("/urls");

})

//INDEX ROUTE
app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  } else {
    let userEmail = users[userID].email;
    let userURLS = urlDatabase[userID];
    res.render("urls_index", {urlDatabase: urlDatabase, userID: userID, userURLS: userURLS, userEmail: userEmail});
  }
});



//NEW ROUTE
app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  } else {
    let userEmail = users[userID].email;
    res.render("urls_new", {username: userEmail, userID: userID});
  }

});

//CREATE ROUTE
app.post("/urls", (req, res) => {
  let userID = req.session.user_id
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[userID][shortURL] = longURL;
  res.redirect(`urls/${shortURL}`);
});

//Redirects to the longURL when the short URL is visited
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  for (id in urlDatabase) {
    for (url in urlDatabase[id]) {
      if (url !== shortURL) {
        continue;
      } else {
        let longURL = urlDatabase[id][url];
        linksUsed += 1;
        console.log(linksUsed);
        res.redirect(longURL);
      }
    }
  }
});


//SHOW ROUTE
app.get("/urls/:id", (req, res) => {
  //need to check if not user id
  let userID = req.session.user_id;
  let shortURL = req.params.id;
  if (!userID) {
    return res.redirect("/login");
  }
  for (url in urlDatabase[userID]) {
    if (url === shortURL) {
      console.log(urlDatabase[userID][shortURL]);
      let userEmail = users[userID].email;
      return res.render("urls_show", {shortURL: req.params.id, urlDatabase: urlDatabase, username: userEmail, userID: userID} );
    }
  }
});

//DELETE ROUTE
app.post('/urls/:id/delete', (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.id;
  delete urlDatabase[userID][shortURL];
  res.redirect('/urls');
});

//Edit Route
app.get("/urls/:id/edit", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.id;
  if (!userID){
    return res.redirect("/login");
  }
  if (shortURL !== urlDatabase[userID].shortURL) {
    return res.send("This is not your URL");
  }
  res.redirect(`/urls/<%=${shortURL}`, {userID: userID});
})

//UPDATE ROUTE
app.post("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[userID][shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
})

//LOGIN ROUTE
app.get("/login", (req, res) => {
  let userID = '';
  res.render("login", {userID: userID});
})


//COOKIE ROUTE
app.post("/login", (req, res) => {
  const logInPassword = req.body.password;
  const email = req.body.email;
  const hashedLOGINPassword = bcrypt.hashSync(logInPassword, 10);
  if (email === '' || logInPassword === '') {
    return res.send('400 bad request')
  }
  for (person in users) {
    const userPass = users[person].password
    if (users[person].email === email && bcrypt.compareSync(userPass, hashedLOGINPassword)) {
      break;
    }
    if (users[person].email !== email) {
      return res.send("403: Forbidden");
    }
  }
  req.session.user_id = users[person].id;
  return res.redirect("/");

});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

