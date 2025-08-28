const addWebsiteData = require("../../api/v1/admin/addWebisteData");
const deleteUser = require("../../api/v1/admin/deleteUser");
const getAllContacts = require("../../api/v1/admin/getAllContacts");
const getAllUsers = require("../../api/v1/admin/getAllUsers");
const getLiveKit = require("../../api/v1/admin/getLiveKit");
const getPaygic = require("../../api/v1/admin/getPaygic");
const setLiveKit = require("../../api/v1/admin/setLiveKit");
const setPaygic = require("../../api/v1/admin/setPaygic");
const checkAdmin = require("../../middlewares/checkAdmin");

const router = require("express").Router();

router.get("/users/:id/:email", checkAdmin, getAllUsers);
router.delete("/user/delete/:id/:email/:userId", checkAdmin, deleteUser);

// website data related
router.post("/website/add/:id/:email", checkAdmin, addWebsiteData);

// paygic
router.get("/paygic/:id/:email", checkAdmin, getPaygic);
router.put("/paygic/set/:id/:email", checkAdmin, setPaygic);

// contact
router.get("/contacts/:id/:email", checkAdmin, getAllContacts);


// livekit
router.put("/livekit/set/:id/:email", checkAdmin, setLiveKit);
router.get("/livekit/:id/:email", checkAdmin, getLiveKit);

module.exports = router;
