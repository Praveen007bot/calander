import dotenv from "dotenv";
dotenv.config({});
import express from "express";
import { google } from "googleapis";

const route = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

route.get("/google", (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  res.json({ url });
});

route.get("/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.cookie("access_token", tokens.access_token, { httpOnly: true });
    res.cookie("refresh_token", tokens.refresh_token, { httpOnly: true });

    res.redirect("http://localhost:3001");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

route.use((req, res, next) => {
  if (req.cookies.access_token) {
    oauth2Client.setCredentials({ access_token: req.cookies.access_token });
    req.oauth2Client = oauth2Client;
  }
  next();
});

export default route;
