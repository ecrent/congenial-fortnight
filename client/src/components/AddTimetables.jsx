import React from 'react'

const AddTimetables = () => {
  return (
    <div className="container-fluid my-4">
      <div className="card">
        <div className="card-body">
          <form action="">
            <div className="mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Timetable Name" 
              />
            </div>
            <div className="mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Timetable Description" 
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary w-100">
                Add Timetable
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddTimetables