import React from 'react'
import AddTimetables from '../components/AddTimetables'
import Header from '../components/Header'
import TimetablesList from '../components/TimetablesList'

const Home = () => {
  return (
    <div>
      <Header />
      <AddTimetables />
      <TimetablesList />
    </div>
  )
}

export default Home