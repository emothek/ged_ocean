const { Strategy, ExtractJwt } = require("passport-jwt");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
require("dotenv").config();
// Initialize a prisma client
const prisma = new PrismaClient();
// Set strategy options
const options = {
passReqToCallback: true,
secretOrKey: process.env.JWT_SECRET,
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};
function exclude(user, keys) {
  for (let key of keys) {
    delete user[key]
  }
  return user
}
passport.use(
new Strategy(options, async (req,jwt_payload, cb) => {

await prisma.user.findUnique({
where: {
id: jwt_payload.id
}
})
.then(user => {const userWithEx = exclude(user, ['password','refreshToken']);return cb (null, userWithEx)})
.catch(err=> {return cb (err, false, {
    message: 'Token not matched.'
  })});
})
);
module.exports = passport;