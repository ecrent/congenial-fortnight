import React, { useContext, useEffect } from 'react';
import { TimetablesContext } from '../context/TimetablesContext';
import Scheduler from '../apis/Scheduler';
import {  useNavigate } from 'react-router-dom';

const TimetablesList = () => {
  // Use object destructuring to match the provider's value
  const { timetables, setTimetables } = useContext(TimetablesContext);
  let navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Scheduler.get("/timetables");
        console.log("API response:", response.data);
        if (response.data && response.data.data && response.data.data.timetables) {
          setTimetables(response.data.data.timetables);
        }
      } catch (err) {
        console.error("Error fetching timetables:", err);
      }
    };
    fetchData();
  }, [setTimetables]);

  const handleDelete = async (id) => {
    try {
      const response = await Scheduler.delete(`/timetables/${id}`);
      console.log("Delete response:", response);
      if (response.status === 204) {
        setTimetables(timetables.filter((timetable) => timetable.id !== id));
      }
    }catch (err) {
      console.error("Error deleting timetable:", err);
    }
  }
  const handleUpdate = (id) => {
    navigate(`/timetables/${id}/update`);
  };

  return (
    <div className="list-group">
      <table className="table table-hover table-dark">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Title</th>
            <th scope="col">Description</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {timetables.map((timetable) => (
            <tr key={timetable.id}>
              <td>{timetable.id}</td>
              <td>{timetable.title}</td>
              <td>{timetable.description}</td>
              <td>
                <button onClick={() => handleUpdate (timetable.id)} type="button" className="btn btn-secondary">Edit</button>
              </td>
              <td>
                <button onClick={() => handleDelete(timetable.id)} type="button" className="btn btn-danger">Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetablesList;