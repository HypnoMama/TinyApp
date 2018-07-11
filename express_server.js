const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');

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

//INDEX ROUTE
app.get('/', (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  // let templateVars = { urls: urlDatabase };
  res.render("urls_index", {urlDatabase: urlDatabase});
});

//NEW ROUTE
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//CREATE ROUTE
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  res.redirect("urls/");

});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});


//SHOW ROUTE
app.get("/urls/:id", (req, res) => {
  res.render("urls_show", {shortURL: req.params.id, urlDatabase: urlDatabase} )

});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

