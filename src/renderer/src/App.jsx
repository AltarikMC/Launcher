/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import CheckingUpdate from './components/CheckingUpdate'
import Login from './components/Login'
import Main from './components/Main'
import Menubar from './components/Menubar'

export default function App() {
  const [checkingUpdate, setCheckingUpdate] = useState(true)
  const [login, setLogin] = useState(false)
  return (
    <>
      <Menubar />
      {checkingUpdate ? <CheckingUpdate /> : login ? <Login /> : <Main />}
    </>
  )
}
