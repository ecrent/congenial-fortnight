// filepath: /workspaces/congenial-fortnight/client/src/components/UpdateTimetables.jsx
import React, {  useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Scheduler from '../apis/Scheduler'; // Import the Scheduler

const UpdateTimetables = (props) => {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Scheduler.get(`/timetables/${id}`);
                setTitle(response.data.data.timetable.title);
                setDescription(response.data.data.timetable.description);
            } catch (err) {
                console.error('Failed to fetch timetable:', err);
            }
        };
        fetchData();
    }, [id]);

    return (
        <div>
            <h1>{title || 'Loading...'}</h1>
            <form action="">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} id="title" className="form-control" type="text" />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input value={description} onChange={(e) => setDescription(e.target.value)} id="description" className="form-control" type="text" />
                </div>
                <button type="submit" className="btn btn-primary">Update</button>
            </form>
        </div>
    );
};

export default UpdateTimetables;