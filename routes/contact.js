const { createContact } = require("../controllers/contact");

const router = require("express").Router();

router.post("/create", createContact);

module.exports = router;
