import React, {useState, createContext} from 'react';

export const TimetablesContext = createContext();

export const TimetablesProvider = (props) => {
  const [timetables, setTimetables] = useState([

  ]);

  return (
    <TimetablesContext.Provider value={[timetables, setTimetables]}>
      {props.children}
    </TimetablesContext.Provider>
  );
}