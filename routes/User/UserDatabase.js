const CreateUserInDatabase = async ({
  username,
  password,
  firstname,
  lastname,
  isAdmin,
  Users,
  bcrypt,
}) => {
  // hashing user's password and creating new user
  console.log(username, password, firstname, lastname, isAdmin, Users, bcrypt);
  const userRegistration = bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
      firstname: firstname,
      lastname: lastname,
      isAdmin: isAdmin || false, // set isAdmin based on request or default to false
    });
  });

  return userRegistration;
};

module.exports = { CreateUserInDatabase };
