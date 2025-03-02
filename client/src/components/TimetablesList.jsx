import React, { useEffect, useState } from 'react';
import Scheduler from '../apis/Scheduler';

const TimetablesList = () => {

  useEffect(async () => { 
    try{
      const response = await Scheduler.get("/");
      console.log(response);
    }
    catch(err){}
  },[]);

  return (
    <div className="container-fluid">
      <div className="table-responsive">
        <table className="table table-hover table-dark w-100">
          <thead>
            <tr className="bg-primary">
              <th scope="col">Timetable</th>
              <th scope="col">Description</th>
              <th scope="col">Update</th>
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