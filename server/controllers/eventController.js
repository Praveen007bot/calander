import dotenv from "dotenv";
dotenv.config({});
import { google } from "googleapis";
import Event from "../models/eventModel.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

export const getEvents = async (req, res) => {
  const accessToken = req.cookies.access_token || req.id;

  if (!accessToken) {
    return res.status(401).send("Unauthorized: No access token provided");
  }

  try {
    const events = await getAllEvents(accessToken);
    return res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addEvent = async (req, res) => {
  const { title, description, date, time, duration } = req.body;

  if (!req.cookies.access_token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  oauth2Client.setCredentials({ access_token: req.cookies.access_token });

  try {
    const startDateTime = new Date(`${date}T${time}`);
    if (isNaN(startDateTime.getTime())) {
      throw new Error("Invalid date or time format");
    }
    const event = new Event({ title, description, date, time, duration });
    const syncedEvent = await syncEventWithGoogleCalendar(event, {
      accessToken: req.cookies.access_token,
    });
    await syncedEvent.save();
    res.status(201).json(syncedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, duration } = req.body;

  try {
    const updateEvent = await Event.findOne({ googleEventId: id });

    await updateEvent.updateOne({ title, description, date, time, duration });

    const event = await Event.findOne({ googleEventId: id });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    );
    oauth2Client.setCredentials({ access_token: req.cookies.access_token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startDateTime = new Date(`${event.date}T${event.time}`).toISOString();
    const endDateTime = new Date(
      new Date(`${event.date}T${event.time}`).getTime() +
        event.duration * 60 * 60 * 1000
    ).toISOString();

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata",
      },
      attendees: [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };
    const response = await calendar.events.update({
      calendarId: "primary",
      requestBody: googleEvent,
      eventId: event.googleEventId,
    });

    res.status(200).json({
      event,
      response,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  if (!req.cookies.access_token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
  );

  oauth2Client.setCredentials({ access_token: req.cookies.access_token });
  try {
    const event = await Event.findOneAndDelete({ googleEventId: id });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.googleEventId) {
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      await calendar.events.delete({
        calendarId: "primary",
        eventId: event.googleEventId,
      });
    }

    // Delete event from MongoDB
    //await event.remove();
    res.json({ message: "Deleted Event" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncEventWithGoogleCalendar = async (event, user) => {
  oauth2Client.setCredentials({ access_token: user.accessToken });
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const startDateTime = new Date(`${event.date}T${event.time}`).toISOString();
  const endDateTime = new Date(
    new Date(`${event.date}T${event.time}`).getTime() +
      event.duration * 60 * 60 * 1000
  ).toISOString();

  const googleEvent = {
    summary: event.title,
    description: event.description,
    start: {
      dateTime: startDateTime,
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: endDateTime,
      timeZone: "Asia/Kolkata",
    },
    attendees: [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: googleEvent,
  });

  event.googleEventId = response.data.id;
  return event;
};

const getAllEvents = async (accessToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  try {
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: "primary",
      maxResults: 1000,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items;
  } catch (error) {
    console.error("Error retrieving events:", error);
    throw error;
  }
};
