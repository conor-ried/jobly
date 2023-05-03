"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureAdmin, ensureAdminOrUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: login
 **/

router.post("/",ensureAdmin,   async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
  
});
// To hit ensureAdmin as error add token for non user admin in authorization header 
// {
//   "username": "Mhfgreg",
//   "firstName": "MshfgerL",
//   "lastName": "JatergN",
//   "password": "tEWshgeegryy4",
//   "email": "TreqewerT@aol.com",
//   "isAdmin": false
// }
// {
// 	"error": {
// 		"message": "Unauthorized",
// 		"status": 401
// 	}
// }
// {
//   "username": "bcefgd",
//   "firstName": "sawcgdfy",
//   "lastName": "lagfdqcy",
//   "password": "boyfgdyce234",
//   "email": "springyspringspring@aol.com",
//   "isAdmin": true
// }
// Content-Type application/json
// authorization Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJvZnJ5IiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNjgzMDYxMDUzfQ.x0z1cgQt5u6G_NgCa6aAjQlk2QdIu9IP_azuWMrNGZI
// {
//   "username": "sdfd",
//   "firstName": "sayyyyyyy",
//   "lastName": "layyyyyyy",
// //   "password": "boyyyyyyyyy4",
// //   "email": "spyyyy@aol.com",
// //   "isAdmin": false
// // }
// {
// 	"user": {
// 		"username": "sdfd",
// 		"firstName": "sayyyyyyy",
// 		"lastName": "layyyyyyy",
// 		"email": "spyyyy@aol.com",
// 		"isAdmin": false
// 	},
// 	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNkZmQiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjgzMTE5NzgxfQ.FmtmuokLK3sFGp2r8xVx-9ZR4t_o95-y7_wpntwBBxE"
// }
/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: login
 **/

router.get("/:username", ensureAdmin, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: login
 **/

router.patch("/:username", ensureAdminOrUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login
 **/

router.delete("/:username", ensureAdminOrUser, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

router.post("/:username/jobs/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const jobId = +req.params.id;
    await User.applyToJob(req.params.username, jobId);
    return res.json({ applied: jobId });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
