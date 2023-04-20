const { PrismaClient } = require("@prisma/client");
const { Strategy } = require("passport-local");
const { hash, compare } = require("../utils");
const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
} = require("../authenticate");
const passport = require("passport");
//schema validator
const { validateUser } = require("../utils/ShemaValidator");
require("dotenv").config();

// Initialize a prisma client
const prisma = new PrismaClient();
// Set strategy options
const options = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true,
};
function exclude(user, keys) {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}

// Passport middleware to signup users
passport.use(
  "signup",
  new Strategy(options, async (req, email, password, cb) => {
    try {
      //check options
      let authInfo = {
        name: req.body.name,
        email,
        password,
        role: req.body.role,
        organisationId: parseInt(req.body.organisation),
      };
      const valid = validateUser(authInfo);
      if (!valid) {
        console.log(validateUser.errors);

        return cb(validateUser.errors);
      }
      // Check if user found
      const existsEmail = await prisma.user.findFirst({ where: { email } });
      if (existsEmail)
        return cb(null, false, {
          message: "Email already exists.",
          statusCode: 400,
        });
      // Create the user
      let role = req.body.role;
      let validated = false;
      if (role == "SUPERADMIN") validated = true;

      let user = await prisma.user.create({
        data: {
          name: req.body.name,
          email,
          password: await hash(password),
          role: req.body.role,
          organisationId: parseInt(req.body.organisation),
          valid: validated,
        },
      });
      const refreshToken = getRefreshToken({ id: user.id });
      user = await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          refreshToken: refreshToken,
        },
      });

      return cb(null, user);
    } catch (err) {
      console.error(err.message);
      return cb(null, err);
    }
  })
);
// Passport middleware to login users
options.passReqToCallback = false;
passport.use(
  "login",
  new Strategy(options, async (email, password, cb) => {
    try {
      // Check if user found
      let user = await prisma.user.findFirst({
        where: {
          AND: [
            {
              email,
            },
            {
              valid: true,
            },
          ],
        },
      });
      if (!user)
        return cb(null, false, {
          message: "No user found.",
          statusCode: 400,
        });
      // Compare password
      const validPassword = await compare(password, user.password);
      if (!validPassword)
        return cb(null, false, {
          message: "Invalid credentials.",
          statusCode: 401,
        });
      const refreshToken = getRefreshToken({ id: user.id });
      user = await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          refreshToken: refreshToken,
        },
      });
      //const userWithEx = exclude(user, ['password','refreshToken']);
      return cb(null, user);
    } catch (err) {
      console.error(err.message);
      return cb(null, err);
    }
  })
);
