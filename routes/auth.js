const router = require("express").Router();
const { generateToken, checkIsInRole } = require("../utils");
const passport = require("passport");
const auth = require("../authorization.js");
const {
  getToken,
  COOKIE_OPTIONS,
  getRefreshToken,
} = require("../authenticate");
const jwt = require("jsonwebtoken");
const { tryCatch } = require("../utils/tryCatch");

const { PrismaClient, Role } = require("@prisma/client");
// Initialize a prisma client
const prisma = new PrismaClient();
function exclude(user, keys) {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}

router.post(
  "/signup",
  tryCatch((req, res, next) => {
    passport.authenticate("signup", { session: false }, (err, user, info) => {
      // Check for errors
      if (err) throw new Error(err);
      // Generate token
      const token = generateToken(user.id);

      if (user) {
        res.cookie("refreshToken", user.refreshToken, COOKIE_OPTIONS);
        const userWithEx = exclude(user, ["password", "refreshToken"]);
        return res.status(201).json({
          status: "success",
          data: {
            message: "Account created.",
            userWithEx,
            token,
          },
          statusCode: res.statusCode,
        });
      } else {
        res.status(400).json({
          status: "error",
        });
      }
    })(req, res, next);
  })
);

router.post(
  "/login",
  tryCatch((req, res, next) => {
    passport.authenticate("login", { session: false }, (err, user, info) => {
      // Check for errors
      if (err) throw new Error(err);
      // Generate token
      const token = generateToken(user.id);
      if (user) {
        res.cookie("refreshToken", user.refreshToken, COOKIE_OPTIONS);
        const userWithEx = exclude(user, ["password", "refreshToken"]);
        return res.status(201).json({
          status: "success",
          data: {
            message: "Welcome back.",
            userWithEx,
            token,
          },
          statusCode: res.statusCode,
        });
      } else {
        res.status(400).json({
          status: "error",
          message: info.message || "Unkown error",
        });
      }
    })(req, res, next);
  })
);

//refreshToken
router.post(
  "/refreshToken",
  tryCatch(async (req, res, next) => {
    const { signedCookies = {} } = req;

    const { refreshToken } = signedCookies;

    if (refreshToken) {
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        const userId = payload.id;

        await prisma.user.findFirst({ where: { id: userId } }).then(
          (user) => {
            if (user) {
              // Find the refresh token against the user record in database

              if (user.refreshToken !== refreshToken) {
                res.statusCode = 401;

                res.send("Unauthorized,token not matched");
              } else {
                const token = generateToken(user.id);

                // If the refresh token exists, then create new one and replace it.

                const newRefreshToken = getRefreshToken({ id: userId });

                user = prisma.user
                  .update({
                    where: {
                      id: user.id,
                    },
                    data: {
                      refreshToken: newRefreshToken,
                    },
                  })
                  .then(() => {
                    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

                    res.send({ success: true, token });
                  });
              }
            } else {
              res.statusCode = 401;

              res.send("Unauthorized, no user");
            }
          },

          (err) => next(err)
        );
      } catch (err) {
        res.statusCode = 401;

        res.send("Unauthorized,no rt");
      }
    } else {
      res.statusCode = 401;

      res.send("Unauthorized,no token");
    }
  })
);
//logout

router.get(
  "/logout",
  auth,
  tryCatch(async (req, res, next) => {
    const { signedCookies = {} } = req;

    const { refreshToken } = signedCookies;

    await prisma.user.findFirst({ where: { id: req.user.id } }).then(
      (user) => {
        if (user.refreshToken === refreshToken) {
          user = prisma.user
            .update({
              where: {
                id: user.id,
              },
              data: {
                refreshToken: "",
              },
            })
            .then(() => {
              res.clearCookie("refreshToken", COOKIE_OPTIONS);

              res.send({ success: true });
            });
        }
      },
      (err) => next(err)
    );
  })
);

router.get(
  "/sa/users",
  auth,
  checkIsInRole(Role.SUPERADMIN),
  tryCatch(async (req, res) => {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { AND: [{ role: "USER" }, { validByAdmin: true }] },
          { role: "ADMIN" },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organisation: true,
        valid: true,
      },
    });

    res.send(users);
  })
);

router.get(
  "/admin/users",
  auth,
  checkIsInRole(Role.ADMIN),
  tryCatch(async (req, res) => {
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organisation: true,
        valid: true,
      },
    });

    res.send(users);
  })
);

router.post(
  "/sa/validate/:id",
  auth,
  checkIsInRole(Role.SUPERADMIN),
  tryCatch(async (req, res) => {
    let id = req.params.id;
    await prisma.user
      .update({
        where: {
          id: parseInt(id),
        },
        data: {
          valid: true,
        },
      })
      .then(() => {
        res.send("validé");
      });
  })
);

router.post(
  "/admin/validate/:id",
  auth,
  checkIsInRole(Role.ADMIN),
  tryCatch(async (req, res) => {
    let id = req.params.id;
    await prisma.user
      .update({
        where: {
          id: parseInt(id),
        },
        data: {
          validByAdmin: true,
        },
      })
      .then(() => {
        res.send("validé");
      });
  })
);

router.delete(
  "/user/:id",
  auth,
  tryCatch(async (req, res) => {
    let id = req.params.id;

    await prisma.user
      .delete({
        where: {
          id: parseInt(id),
        },
      })
      .then(() => {
        res.send("done !");
      });
  })
);

//user_activities

router.post(
  "/user/activity",
  auth,
  tryCatch(async (req, res) => {
    let id = req.user.id;

    let activity = req.body.activity;
    if (
      activity === "userLoggedIn" ||
      activity === "userLoggedOut" ||
      activity === "userSignedUp"
    ) {
      await prisma.activity
        .create({
          data: {
            activity: activity,
            userId: id,
            organisationId: req.user.organisationId,
            payload: { key: req.user.email },
          },
        })
        .then((activity) => res.status(200).send(activity))
        .catch((err) => res.status(400).send(err));
    } else if (activity === "userNavigate") {
      await prisma.activity
        .create({
          data: {
            activity: activity,
            userId: id,
            organisationId: req.user.organisationId,
            payload: { route: req.body.route },
          },
        })
        .then((activity) => res.status(200).send(activity))
        .catch((err) => res.status(400).send(err));
    } else {
      if (Array.isArray(req.body.doc_id)) {
        req.body.doc_id.forEach((did) => {
          prisma.activity
            .create({
              data: {
                activity: activity,
                userId: id,
                organisationId: req.user.organisationId,

                payload: { key: did },
              },
            })
            .then((activity) => console.log(activity))
            .catch((err) => console.log(err));
        });
        return res.send("done");
      } else {
        await prisma.activity
          .create({
            data: {
              activity: activity,
              userId: id,
              organisationId: req.user.organisationId,
              fileId: req.body.doc_id,
              payload: { key: req.body.doc_id },
            },
          })
          .then((activity) => res.status(200).send(activity))
          .catch((err) => res.status(400).send(err));
      }
    }
  })
);

router.get(
  "/activities",
  auth,
  tryCatch(async (req, res) => {
    let user = req.user;
    if (user.role === "SUPERADMIN") {
      await prisma.activity
        .findMany({ include: { user: true, file: true } })
        .then((activities) => res.status(200).send(activities))
        .catch((err) => res.status(400).send(err));
    } else if (user.role === "ADMIN") {
      await prisma.activity
        .findMany({
          where: {
            organisationId: req.user.organisationId,
          },
          include: { user: true, file: true },
        })
        .then((activities) => res.status(200).send(activities))
        .catch((err) => res.status(400).send(err));
    }
  })
);

router.get(
  "/profile",
  auth,
  tryCatch((req, res, next) => {
    return res.json({ message: "Welcome friend", user: req.user });
  })
);

module.exports = router;
