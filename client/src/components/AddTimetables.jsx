import React, { useState } from 'react'
import Scheduler from '../apis/Scheduler'

const AddTimetables = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send 'name' instead of 'title'
      const response = await Scheduler.post("/timetables", {
        title: title,
        description: description
      });
      console.log(response.data);
    } catch(err) {
      console.error("Error adding timetable:", err);
    }
  }

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-row align-items-center">
          <div className="mr-2">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              type="text"
              className="form-control"
              placeholder="Title"
            />
          </div>
          <div className="mr-2">
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              type="text"
              className="form-control"
              placeholder="Description"
            />
          </div>
          <div className="mr-2">
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddTimetables