import React, { Component } from 'react'
import './App.css'
import Chat from './Chat'
import Login from './Login'
import * as moment from "moment"
import {getErrorCodeMessageFromServer} from './CommonFunctions'
import {DUPLICATE_USERNAME_CODE, INACTIVITY_TIMEOUT_CODE, SERVER_ERROR_CODE, SERVER_SHUTDOWN} from './Constants'

class App extends Component {
  state = {
    person: {
      loggedIn: false,
      name: '',
      messages: [],
      action: '',
      validationMessage: null
    }
  }

  webSocket = null;

  componentDidUpdate() {
    this.webSocket.onclose = (err) => {
      console.log(err)
      if (err.code === DUPLICATE_USERNAME_CODE ||
            err.code === INACTIVITY_TIMEOUT_CODE ||
              err.code === SERVER_ERROR_CODE ||
                err.code === SERVER_SHUTDOWN) {
        this.resetUserInformation(err.reason, err.code)
      }
    }

    this.webSocket.onerror = (err) => {
      console.log(err)
      if (err.code === SERVER_ERROR_CODE) {
        this.resetUserInformation(err.reason, err.code)
      }
    }
  }
  
  componentWillUnmount() {
    this.webSocket.close();
  }

  resetUserInformation = (errorMessage, errCode) => {
    const newPerson = {
      loggedIn: false,
      name: '',
      messages: [],
      action: '',
      validationMessage: {code: errCode, message: errorMessage}
    }

    this.setState({person: newPerson})
  }

  handleLogin = (obj) => {
    this.webSocket = new WebSocket(`ws://localhost:3030/chat?userName=${obj.name}`);
    this.webSocket.onopen = () => {
      this.setState({person: obj})
      this.messageSender({message: `${this.state.person.name} has joined the chat!`, action: 'login'})
    }
  }

  handleLogout = (obj) => {
    this.setState({person: obj})
    this.messageSender({message: `${this.state.person.name} has left the chat!`, action: 'logout'})
    this.webSocket.close();
  }

  addMessage = (message) => {
    const newPerson = this.state.person;
    newPerson.messages = [message, ...newPerson.messages]
    this.setState({person: newPerson})
  }

  messageSender = (message) => {
    this.webSocket.send(JSON.stringify(message))
  }

  onMessageReceived = () => {
    this.webSocket.onmessage = (evt) => {
      console.log(evt.data)
      const message = JSON.parse(evt.data)
      this.addMessage(message)
    }
  }

  handleMessage = (messageString) => {
    const message = JSON.stringify({name: this.state.person.name, message: messageString, time: moment().format("YYYY-MM-DD HH:mm"), action: 'message'})
    this.webSocket.send(message)
    this.addMessage(message)
  }

  render() {
    const {person} = this.state
    return (
      <div className="app-container">
        <h1 className="app-title">{person.validationMessage ? getErrorCodeMessageFromServer(person.validationMessage) : 
          `Hey ${person.name.toUpperCase()}`}</h1>
        {person.loggedIn && 
        <Chat person={person} 
        logoutHandler={this.handleLogout} 
        messageReceiver={this.onMessageReceived}
        handleMessageSending={this.handleMessage}/>}
        {!person.loggedIn && 
        <Login loginHandler={this.handleLogin} 
        person={this.state.person}/>}
      </div>
    )
  }
}

export default App
