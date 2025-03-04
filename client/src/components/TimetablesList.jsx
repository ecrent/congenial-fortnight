import React, { useState, useEffect, useContext } from 'react';
import { TimetablesContext } from '../context/TimetablesContext';
import Scheduler from '../apis/Scheduler';

const TimetablesList = () => {
  const [timetables, setTimetables] = useContext(TimetablesContext);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Scheduler.get("/timetables");
        console.log("API response:", response.data);
        
        if (response.data && response.data.data && response.data.data.timetables) {
          setTimetables(response.data.data.timetables);
        }
      } catch(err) {
        console.error("Error fetching timetables:", err);
      }
    };
    
    fetchData();
  }, [setTimetables]); 
  
  return (
    <div className="list-group">
      <table className="table table-hover table-dark">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Description</th>
            <td>Edit</td>
            <td>Delete</td>
          </tr>
        </thead>
        <tbody>
          {timetables.map((timetable) => (
            <tr key={timetable.id}>
              <td>{timetable.id}</td>
              <td>{timetable.title}</td> 
              <td>{timetable.description}</td>
              <td><button type="button" className="btn btn-secondary">Edit</button></td>
              <td><button type="button" className="btn btn-danger">Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetablesList;