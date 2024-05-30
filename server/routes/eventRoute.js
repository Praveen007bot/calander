import dotenv from "dotenv";
dotenv.config({});
import express from "express";
import { addEvent, deleteEvent, getEvents, updateEvent } from "../controllers/eventController.js";
import { google } from "googleapis";

const route = express.Router();


route.get("/", getEvents);
route.post("/", addEvent);
route.patch("/:id", updateEvent);
route.delete("/:id", deleteEvent);

export default route;
