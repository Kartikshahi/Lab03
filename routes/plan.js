const express = require("express");
const router = express.Router();
const Plan = require("../models/plan"); // updated to "plan"
const AuthenticationMiddleware = require("../extensions/authentication");

// GET /plans/
router.get("/", async (req, res, next) => {
  let plans = await Plan.find().sort([["dueDate", "descending"]]);
  res.render("plans/index", {
    title: "Fitness Plan Tracker",
    dataset: plans,
    user: req.user,
  });
});

// GET /plans/add
router.get("/add", AuthenticationMiddleware, async (req, res, next) => {
 
  res.render("plans/add", {
    title: "Add a New Fitness Plan",
    user: req.user,
  });
});

// POST /plans/add
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  let newPlan = new Plan({
    name: req.body.name,
    startDate: req.body.startDate,
    planType: req.body.planType,
    
    
  });
  await newPlan.save();
  res.redirect("/plans");
});

// GET /plans/delete/:_id
router.get("/delete/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let planId = req.params._id;
  await Plan.findByIdAndRemove({ _id: planId });
  res.redirect("/plans");
});

// GET /plans/edit/:_id
router.get("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let planId = req.params._id;
  let planData = await Plan.findById(planId);
  
  res.render("plans/edit", {
    title: "Edit Fitness Plan Info",
    plan: planData,
    
    user: req.user,
  });
});

// POST /plans/edit/:_id
router.post("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  let planId = req.params._id;
  await Plan.findByIdAndUpdate(
    { _id: planId },
    {
      name: req.body.name,
      startDate: req.body.startDate,
      planType: req.body.planType,
      
    
    }
  );
  res.redirect("/plans");
});

module.exports = router;
