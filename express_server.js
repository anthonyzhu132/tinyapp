const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const randomString = function() {
  // eslint-disable-next-line no-empty
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = chars.length;
  for (let i = 1; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const emailCompare = function(email) {
  for (let id in users) {
    if (email === users[id].email)
      return users[id];
  }
  return false;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "dank@m.com",
    password: "123"
  }
};


app.get("/", (request, response) => {
  response.send("Displaying the homepage / <--"); // Code is sending a response to once we load the website
});

app.listen(port, () => {
  console.log("Server online! Listening on " + port); // Code is making the express server listen on port 8080 for client to connect.
});

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase, shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL], userId: request.cookies["user_id"], users: users, user: users[request.cookies["user_id"]] };
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  let templateVars = { urls: urlDatabase, shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL], userId: request.cookies["user_id"], users: users, user: users[request.cookies["user_id"]] };
  response.render("urls_new", templateVars);
});

// Details Page
app.get("/urls/:shortURL", (request, response) => {
  let templateVars = { urls: urlDatabase, shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL], userId: request.cookies["user_id"], users: users, user: users[request.cookies["user_id"]] };
  if (urlDatabase[request.params.shortURL]) {
    response.render("urls_show", templateVars);
  } else {
    response.redirect("/urls");
  }
});

app.post("/urls", (request, response) => {
  const shortURL = randomString();
  urlDatabase[shortURL] = request.body.longURL;
  console.log(request.body); // Log the POST request body to the console
  response.redirect("/urls/" + shortURL);
});

app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  if (longURL.includes("http://")) {
    response.redirect(longURL);
  } else {
    longURL = "http://" + longURL;
  }
  response.redirect(longURL);
});

//EDITING SHORTENED URLS
app.post('/urls/:shortURL/edit', (request, response) => {
  const newURL = request.body.newURL;
  const id = request.params.shortURL;
  urlDatabase[id] = newURL;
  response.redirect(`/urls/${id}`);
});

//DELETING SHORTENED URLS
app.post("/urls/:id/delete", (request, response) => {
  const id = request.params.id;
  delete urlDatabase[id];
  response.redirect("/urls/");
});

// login page
app.get('/login', (request, response) => {
  response.render('urls_login');
});


//LOGGING INTO LOCALHOST AND ADDING COOKIES
app.post("/login", (request, response) => {
  let user = emailCompare(request.body.email);
  if (!user) {
    response.status(400).end();
  } else if (user.password !== request.body.password) {
    response.status(400).end();
  } else {
    response.cookie('user_id', user.id);
    response.redirect("/urls/");
  }
});

//LOGGIGN OUT OF LOCALHOST AND DELETING COOKIES
app.post("/logout", (request, response) => {
  let username = request.cookies["username"];
  response.cookie("user_id", "", {expires: new Date(0)});
  response.redirect("/urls/");
});

//CREATED REGISTER LANDING PAGE
app.get("/register", (request, response) => {
  let templateVars = { urls: urlDatabase, shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL], userId: request.cookies["user_id"], users: users, user: users[request.cookies["user_id"]] };
  response.render("urls_register", templateVars);
});

//REGISTERING A NEW USER TO THE SITE
app.post("/register", (request, response) => {
  let newEmail = request.body.email;
  let newUserId = randomString();
  let newPassword = request.body.password;
  if (request.body.email === '' || request.body.password === '') {
    response.status(400).send('Email or password empty');
    return;
  } else if (emailCompare(newEmail)) {
    response.status(400).send('Email already in database');
    return;
  } else {
    response.cookie('user_id', newUserId);
    users[newUserId] = {
      id:newUserId,
      email:newEmail,
      password: newPassword
    };
    response.redirect('/urls');
    return;
  }
});