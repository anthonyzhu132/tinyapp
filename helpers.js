const emailCompare = function(email, database) {
  for (let id in database) {
    if (email === database[id].email)
      return database[id];
  }
  return false;
};

module.exports = { emailCompare };