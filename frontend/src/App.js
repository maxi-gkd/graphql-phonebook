import { React, useState } from 'react'
import {
  useQuery, useSubscription, useApolloClient
} from '@apollo/client'

import Persons from './components/Persons';
import PersonForm from './components/PersonForm';
import Notify from './components/Notify';
import { ALL_PERSONS, PERSON_ADDED } from './queries';
import PhoneForm from './components/PhoneForm';
import LoginForm from './components/LoginForm';


const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const result = useQuery(ALL_PERSONS)
  const client = useApolloClient()


  const updateCacheWith = (addedPerson) => {
    const includedIn = (set, object) =>
      set.map(p => p.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_PERSONS })
    if (!includedIn(dataInStore.allPersons, addedPerson)) {
      client.writeQuery({
        query: ALL_PERSONS,
        data: { allPersons: dataInStore.allPersons.concat(addedPerson) }
      })
    }
  }

  useSubscription(PERSON_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedPerson = subscriptionData.data.personAdded
      notify(`${addedPerson.name} added`)
      updateCacheWith(addedPerson)
    }
  })


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
        <Notify message={errorMessage} />
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
          <Notify message={errorMessage} />
          <Persons persons={result.data.allPersons} />
          <PersonForm setError={notify} updateCacheWith={updateCacheWith} />
          <PhoneForm setError={notify} />
        </div>
  )
}

export default App