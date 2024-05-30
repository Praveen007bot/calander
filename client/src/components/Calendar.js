import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import integrationPlugin from "@fullcalendar/interaction";
import axios from "axios";
import EventForm from "./EventForm";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/events", {
        withCredentials: true,
      });
      const googleEvents = response?.data?.map((event) => ({
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        googleEventId: event.id,
        description: event.description
      }));
      
      setEvents(googleEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = events.find((e) => e.googleEventId === clickInfo?.event?._def?.extendedProps?.googleEventId);
    if (event) {
      setSelectedEvent(event);
      setIsFormOpen(true);
    } else {
      console.error("Event not found:",clickInfo?.event?._def?.extendedProps?.googleEventId);
    }
  };
  


  const handleSaveEvent = async (event) => {
    try {
      if (event.id) {
        await axios.patch(`http://localhost:4000/api/events/${event.id}`, event, { withCredentials: true });
      } else {
        await axios.post("http://localhost:4000/api/events", event, { withCredentials: true });
      }
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`http://localhost:4000/api/events/${eventId}`, { withCredentials: true });
      setIsFormOpen(false);
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <div>
      <button onClick={fetchEvents}>Fetch Events</button>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, integrationPlugin]}
        initialView="dayGridMonth"
        weekends={true}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
      <EventForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Calendar;
