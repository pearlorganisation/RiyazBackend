import express from "express";
import {
  createContact,
  deleteContact,
  getAllContacts,
} from "../controllers/contact/contactController.js";

const router = express.Router();

router.route("/").get(getAllContacts).post(createContact);
router.route("/:id").delete(deleteContact);

export default router;
