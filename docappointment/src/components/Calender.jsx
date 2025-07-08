import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

export default function Calender() {
  const [events, setEvents] = useState([]);

  const calenderRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("/api/appointments");
        const formattedEvents = response.data.map((event) => ({
          title: event.title,
          start: event.start,
          end: event.end,
          id: event._id,
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      <div className="container mx-auto p-4">
        <FullCalendar
          ref={calenderRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          editable={true}
          selectable={true}
          eventClick={(info) => {
            alert(`Event: ${info.event.title}`);
            // You can add more functionality here, like opening a modal to edit the event
          }}
        />
      </div>
    </>
  );
}
