import { React, useState } from 'react'
import { useQuery, useApolloClient } from '@apollo/client'
import Persons from './components/Persons';
import PersonForm from './components/PersonForm';
import Notify from './components/Notify';
import { ALL_PERSONS } from './queries';
import PhoneForm from './components/PhoneForm';
import LoginForm from './components/LoginForm';


const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const result = useQuery(ALL_PERSONS)
  const client = useApolloClient()

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    !token ? (
      <div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <LoginForm
          setToken={setToken}
          setError={notify}
        />
      </div>
    ) :
      result.loading ? (<div>loading...</div>) :
        <div>
          <button onClick={logout} >logout</button>
          <Notify errorMessage={errorMessage} />
          <Persons persons={result.data.allPersons} />
          <PersonForm setError={notify} />
          <PhoneForm setError={notify} />
        </div>
  )
}

export default App