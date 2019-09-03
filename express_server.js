const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


const randomString = function () {
  // eslint-disable-next-line no-empty
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = chars.length;
  for (let i = 1; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (request, response) => {
  response.send("Displaying the homepage / <--"); // Code is sending a response to once we load the website
});

app.listen(port, () => {
  console.log("Server online! Listening on " + port); // Code is making the express server listen on port 8080 for client to connect.
});

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.get("/urls/:shortURL", (request, response) => {
  let templateVars = { shortURL: request.params.shortURL, longURL: urlDatabase[request.params.shortURL] };
  console.log(templateVars);
  response.render("urls_show", templateVars);
});

app.post("/urls", (request, response) => {
  const shortURL = randomString();
  urlDatabase[shortURL] = request.body.longURL;
  console.log(request.body); // Log the POST request body to the console
  response.redirect("/urls/" + shortURL);
});

app.get("/u/:shortURL", (request, response) => {
  const longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});


app.post('/urls/:shortURL/edit', (request, response) => {
  console.log(request.body, request.params);
  const newURL = request.body.newURL;
  const id = request.params.shortURL;
  urlDatabase[id] = newURL;
  response.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (request, response) => {
  const id = request.params.id;
  delete urlDatabase[id];
  response.redirect("/urls/");
});