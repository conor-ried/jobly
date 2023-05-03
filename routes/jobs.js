const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");


const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();



router.get("/", async function (req, res, next) {
    // console.log(req.query);
    // console.log(req.body);
    //need to use req.query cant use req.body in this case while it can fill the value 
    let Values = req.query;
    console.log(req.query,  "line 21 jobs route");
    if (Values.minSalary !== undefined) Values.minSalary = +Values.minSalary;
    Values.hasEquity = Values.hasEquity === "true";
  
    // arrive as strings from querystring, but we want as ints
    // if (Values.minEmployees !== undefined) Values.minEmployees = +Values.minEmployees;
    // if (Values.maxEmployees !== undefined) Values.maxEmployees = +Values.maxEmployees;
  
    try {
      const validator = jsonschema.validate(Values, jobSearchSchema);
      console.log(validator, "line 29 of routes job");
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const jobs = await Job.findAll(Values);
      console.log(Values, "line 36 jobs ");
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });




  module.exports = router;