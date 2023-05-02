"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companySearchSchema = require("../schemas/companySearch.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

// router.get("/", async function (req, res, next) {
//   try {
//     // console.log(req.body);
//     // const searchFilters = parseSearchFilters(req.body);
//     // console.log(searchFilters);
//     console.log(req.query, ('req.query value'));
//     console.log(req.body);
//     const searchFilters = parseSearchFilters(req.body);
//     console.log(searchFilters);
//     const companies = await Company.findAll(searchFilters);
//     return res.json({ companies });
//   } catch (err) {
//     return next(err);
//   }
// });

// function parseSearchFilters(query) {
//   // const { minEmployees, maxEmployees } = query;
//   // console.log(minEmployees, 555555);
//   // console.log(maxEmployees, 222222)
//   const searchFilters = {
//   minEmployees: Number.isInteger(parseInt(query.minEmployees)) ? parseInt(query.minEmployees) : undefined,
//   maxEmployees: Number.isInteger(parseInt(query.maxEmployees)) ? parseInt(query.maxEmployees) : undefined,
//   name: query.name,
//my SearchFilters do return the values I input here, but not able to use them as a filter
//   };

//   if (searchFilters.minEmployees > searchFilters.maxEmployees) {
//     throw new BadRequestError("Min employees cannot be greater than max");
//   }

//   validateSearchFilters(searchFilters);
//   console.log(searchFilters);

//   return searchFilters;
// }
router.get("/", async function (req, res, next) {
  // console.log(req.query);
  // console.log(req.body);
  //need to use req.query cant use req.body in this case while it can fill the value 
  let Values = req.query;
  console.log(req.query,  "line 95 routes companies");

  // arrive as strings from querystring, but we want as ints
  if (Values.minEmployees !== undefined) Values.minEmployees = +Values.minEmployees;
  if (Values.maxEmployees !== undefined) Values.maxEmployees = +Values.maxEmployees;

  try {
    const validator = jsonschema.validate(Values, companySearchSchema);
    console.log(validator, "line 102 of routes company");
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const companies = await Company.findAll(Values);
    console.log(Values, "line 109 routes companies");
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

// function validateSearchFilters(searchFilters) {
//   console.log(searchFilters);
//   const validator = jsonschema.validate(searchFilters, companySearchSchema);
//   if (!validator.valid) {
//     const errs = validator.errors.map((e) => e.stack);
//     throw new BadRequestError(errs);
//   }
// }
/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
