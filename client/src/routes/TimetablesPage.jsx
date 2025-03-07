import React from 'react';
import Header from '../components/Header';
import AddTimetables from '../components/AddTimetables';
import TimetablesList from '../components/TimetablesList';

function TimetablesPage() {
  return( 
  <div>
    <Header />
    <AddTimetables />
    <TimetablesList />
  </div>);
}

export default TimetablesPage;