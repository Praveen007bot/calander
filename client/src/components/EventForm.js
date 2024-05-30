import React, { useState, useEffect } from "react";
import { Modal } from "@mui/material";

const EventForm = ({ open, onClose, onSave, onDelete, event }) => {
  const [title, setTitle] = useState(event ? event.title : "");
  const [description, setDescription] = useState(
    event ? event.description : ""
  );
  const [date, setDate] = useState(event ? event.date : "");
  const [time, setTime] = useState(event ? event.time : "");
  const [duration, setDuration] = useState(event ? event.duration : "");


  useEffect(() => {
    if (event) {
      setTitle(event?.title);
      setDescription(event?.description);
      setDate(event?.date);
      setTime(event?.time);
      setDuration(event?.duration);
    }else{
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setDuration('');

    }
  }, [event]);

  const handleSubmit = () => {
    onSave({ id: event?.googleEventId, title, description, date, time, duration });
    onClose();
  };
  const handleDelete = () => {
    if (event) {
      onDelete(event.googleEventId);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between">
            <h2 className="text-xl mb-4">
              {event ? "Edit Event" : "Add New Event"}
            </h2>
            <span className="cursor-pointer" onClick={() => onClose()}>
              ❎
            </span>
          </div>
          <input
            className="w-full p-2 border border-gray-300 rounded mb-4"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="w-full p-2 border border-gray-300 rounded mb-4"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            className="w-full p-2 border border-gray-300 rounded mb-4"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <input
            className="w-full p-2 border border-gray-300 rounded mb-4"
            type="number"
            placeholder="Duration (hours)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <div className="flex justify-between">
            {event && (
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white p-2 rounded"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EventForm;
