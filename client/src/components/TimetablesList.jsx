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
    <div className="list-group">
      <table className="table table-hover table-dark">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Description</th>
            <td></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {timetables.map((timetable) => (
            <tr key={timetable.id}>
              <td>{timetable.id}</td>
              <td>{timetable.title}</td>
              <td>{timetable.description}</td>
              
              <td><button type="button" class="btn btn-primary">Edit</button></td>
              <td><button type="button" class="btn btn-danger">Remove</button></td>
              
              
              
            </tr>

          ))}
      
        </tbody>
    
        
      


      </table>

    </div>
  );
};

export default TimetablesList;