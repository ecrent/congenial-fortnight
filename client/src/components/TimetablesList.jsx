import React, { useState, useEffect, useContext } from 'react';
import { TimetablesContext } from '../context/TimetablesContext';
import Scheduler from '../services/Scheduler';

const TimetablesList = () => {
  const [timetables, setTimetables] = useContext(TimetablesContext);
  
  useEffect(() => {
    // Define an async function inside useEffect
    const fetchData = async () => {
      try {
        const response = await Scheduler.get("/api/v1/db/timetables");
        console.log(response.data);
        // Update your state with the response data if needed
        if (response.data && response.data.data && response.data.data.timetables) {
          setTimetables(response.data.data.timetables);
        }
      } catch(err) {
        console.error("Error fetching timetables:", err);
      }
    };
    
    // Call the async function
    fetchData();
  }, [setTimetables]); // Add setTimetables as a dependency
  
  return (
    <div className="list-group mt-4">
      <h2>Timetables</h2>
      {timetables && timetables.map(timetable => (
        <div key={timetable.id} className="list-group-item">
          {timetable.name || timetable.day} - {timetable.description || timetable.time}
        </div>
      ))}
    </div>
  );
};

export default TimetablesList;