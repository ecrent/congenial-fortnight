import React, {useState, createContext} from 'react';

export const TimetablesContext = createContext();

export const TimetablesProvider = (props) => {
  const [timetables, setTimetables] = useState([
    {
      id: 1,
      day: 'Monday',
      time: '10:00',
      user: 'a',
    },
    {
      id: 2,
      day: 'Tuesday',
      time: '11:00',
      user: 'b',
    },
    {
      id: 3,
      day: 'Wednesday',
      time: '12:00',
      user: 'c',
    },
  ]);

  return (
    <TimetablesContext.Provider value={[timetables, setTimetables]}>
      {props.children}
    </TimetablesContext.Provider>
  );
}