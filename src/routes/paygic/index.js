const getPageUrl = require("../../api/v1/paygic/getPageUrl");
const validatePayment = require("../../api/v1/paygic/Validate-payment");

const router = require("express").Router();

router.post("/getPage", getPageUrl);
router.post("/validatePayment", validatePayment);

module.exports = router;
