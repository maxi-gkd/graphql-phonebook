import { React, useState } from 'react'
import { useQuery } from '@apollo/client';
import Persons from './components/Persons';
import PersonForm from './components/PersonForm';
import Notify from './components/Notify';
import { ALL_PERSONS } from './queries';
import PhoneForm from './components/PhoneForm';


const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const result = useQuery(ALL_PERSONS)

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  return (
    result.loading ? (<div>loading...</div>) :
      <div>
        <Notify errorMessage={errorMessage} />
        <Persons persons={result.data.allPersons} />
        <PersonForm setError={notify} />
        <PhoneForm setError={notify} />
      </div>
  )
}

export default App