import React, { createContext, useState } from 'react';

export const TimetablesContext = createContext();

export const TimetablesProvider = ({ children }) => {
  const [timetables, setTimetables] = useState([]);

  const addNewTimetables = (newTimetable) => {
    setTimetables((timetables) => [...timetables, newTimetable]);
  };

  return (
    <TimetablesContext.Provider value={{ timetables, setTimetables, addNewTimetables }}>
      {children}
    </TimetablesContext.Provider>
  );
};