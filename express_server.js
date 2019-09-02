const express = require("express");
const app = express();
const port = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.get("/", (request, response) => {
  response.send("Displaying the homepage / <--"); // Code is sending a response to once we load the website
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (request, response) => {
  let templateVars = { shortURL: request.params.shortURL, longURL: request.params.longURL};
  response.render("urls_show", templateVars);
});

app.listen(port, () => {
  console.log("Server online! Listening on " + port); // Code is making the express server listen on port 8080 for client to connect.
});

