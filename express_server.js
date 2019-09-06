const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const port = 8080;
const cookieSession = require('cookie-session');
const { emailCompare } = require('./helpers');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["YourKey"],
}));

// port to listen to
app.listen(port, () => {
  console.log("Server online! Listening on " + port);
});

//database of users
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

// database of urls
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// function to create random string
const randomString = function() {
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = chars.length;
  for (let i = 1; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// function to loop through urls pretaining to user
const urlsForUser = function(id) {
  let links = {};
  for (let i in urlDatabase) {
    if (id === urlDatabase[i].userID) {
      links[i] = urlDatabase[i].longURL;
    }
  }
  return links;
};

// root page
app.get("/", (request, response) => {
  if (request.session.userID) {
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }
});

// renders index page
app.get("/urls", (request, response) => {
  let templateVars =
  { urls: urlsForUser(request.session.user_id),
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    userId: request.session.user_id,
    users: users,
    user: users[request.session.user_id]
  };
  response.render("urls_index", templateVars);
});

// renders page to create shortened url
app.get("/urls/new", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    userId: request.session.user_id,
    users: users,
    user: users[request.session.user_id]
  };
  if (request.session.user_id) {
    response.render("urls_new", templateVars);
  } else {
    response.status(403).send('You do not have correct access');
  }
});

// renders page to show shortened url
app.get("/urls/:shortURL", (request, response) => {
  let templateVars = { urls: urlDatabase,
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL]["longURL"],
    userId: request.session.user_id,
    users: users,
    user: users[request.session.user_id]
  };
  if (urlDatabase[request.params.shortURL]) {
    response.render("urls_show", templateVars);
  } else {
    response.redirect("/urls");
  }
});

// renders long Url redirection
app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL]["longURL"];
  if (longURL.includes("https://")) {
    response.redirect(longURL);
  } else {
    longURL = "https://" + longURL;
  }
  response.redirect(longURL);
});

// renders login page
app.get('/login', (request, response) => {
  response.render('urls_login');
});

// created user registration page
app.get("/register", (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL],
    // userId: request.session.user_id,
    users: users,
    user: users[request.session.user_id]
  };

  response.render("urls_register", templateVars);
});

// adding a new url to be shortened
app.post("/urls", (request, response) => {
  const shortURL = randomString();
  const userID = request.session.user_id;
  urlDatabase[shortURL] = { longURL: request.body.longURL, userID};
  response.redirect("/urls/" + shortURL);
});

// editing shortened urls
app.post('/urls/:shortURL/edit', (request, response) => {
  const newURL = request.body.newURL;
  const id = request.params.shortURL;
  if (urlDatabase[id].userID !== request.session.user_id) {
    response.status(403).send('Error: 403: Editing Not Allowed Please <a href="/register"> Go Register  </a>');
    return;
  } else {
    urlDatabase[id].longURL = newURL;
    response.redirect(`/urls/${id}`);
  }
});

// deleting shortened urls
app.post("/urls/:id/delete", (request, response) => {
  const id = request.params.id;
  const shortURL = request.params.shortURL;
  if (shortURL !== undefined) { // IF SHORT URL DOES NOT EXIST < --- TEST
    if (urlDatabase[id].userID !== request.session.user_id) {
      response.status(403).send('Error: 403: Not allowed!!!! ❌ Please <a href="/register"> Go Register  </a>');
      return;
    } else {
      delete urlDatabase[id];
      response.redirect("/urls/");
    }
  }
});

// logging into the site and assigning cookies
app.post("/login", (request, response) => {
  let user = emailCompare(request.body.email, users);
  if (!user) {
    response.status(400).end();
    response.send("Try Again!");
  } else if (!bcrypt.compareSync(request.body.password, users[user.id].password)) {
    response.status(400).end();
    response.send("Try Again!");
  } else {
    request.session.user_id = user.id;
    response.redirect("/urls/");
  }
});

// logging out and deleting cookies from session
app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect("/urls/");
});

// registering for a new user with verification
app.post("/register", (request, response) => {
  let newEmail = request.body.email;
  let newUserId = randomString();
  let newPassword = request.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  if (request.body.email === '' || request.body.password === '') {
    response.status(400).send('Email or password empty');
    return;
  } else if (emailCompare(newEmail, users)) {
    response.status(400).send('Email already in database');
    return;
  } else {
    request.session.user_id = newUserId;
    users[newUserId] = {
      id:newUserId,
      email:newEmail,
      password:hashedPassword
    };
    response.redirect('/urls');
    return;
  }
});