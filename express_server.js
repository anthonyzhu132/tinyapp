const express = require("express");
const app = express();
const port = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (request, response) => {
  response.send("Displaying test for root directory 😘 Testing!!!"); // Code is sending a response to once we load the website
});

app.listen(port, () => {
  console.log("Example app listening on " + port); // Code is making the express server listen on port 8080 for client to connect.
});

