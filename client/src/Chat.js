import React, { Component } from 'react'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'

class Chat extends Component {

  componentDidMount() {
    this.props.messageReceiver()
  }

  componentDidUpdate() {
    this.props.messageReceiver()
  }

  logout = () => {
    this.props.logoutHandler({loggedIn: false, name: '', messages: []});
  }

  render() {
    return (
      <div>
        <ChatInput
          onSubmitMessage={messageString => this.props.handleMessageSending(messageString)} 
          logoutHandler={this.logout}
        />
        {this.props.person.messages && this.props.person.messages.map((message, index) =>
          <ChatMessage
            key={index}
            message={message.message}
            name={message.name}
            time={message.time}
            sender={this.props.person.name}
          />
        )}
      </div>
    )
  }
}

export default Chat
