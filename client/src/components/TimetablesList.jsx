import React, { useEffect, useState } from 'react';
import Scheduler from '../apis/Scheduler';

const TimetablesList = () => {

  useEffect(() => { 
    // Define the async function inside useEffect
    const fetchData = async () => {
      try {
        const response = await Scheduler.get("/");
        console.log(response);
      } catch(err) {
        console.error("Error fetching data:", err);
      }
    };
    
    // Call the async function
    fetchData();
  }, []);

  return (
    <div className="container-fluid">
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Timetable 1</td>
              <td>Timetable 1 Description</td>
              <td><button className="btn btn-warning">Update</button></td>
              <td><button className="btn btn-danger">Delete</button></td>
            </tr>
            <tr>
              <td>Timetable 2</td>
              <td>Timetable 2 Description</td>
              <td><button className="btn btn-warning">Update</button></td>
              <td><button className="btn btn-danger">Delete</button></td>
            </tr>
            <tr>
              <td>Timetable 3</td>
              <td>Timetable 3 Description</td>
              <td><button className="btn btn-warning">Update</button></td>
              <td><button className="btn btn-danger">Delete</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetablesList