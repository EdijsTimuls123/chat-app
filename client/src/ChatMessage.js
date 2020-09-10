import React from 'react'

export default ({ name, message, time, sender }) =>
  <div class="chat-container">
    {!name && <p className="centered">{message && message}</p>}
    {name &&
    <div className={`${sender === name ? "aligned-left" : "aligned-right"} d-inline-flex`}>
      <p className="mt-3 mr-2"><strong>{name}</strong></p>
      <p className={`${sender === name ? "chat-message-sender" : "chat-message-receiver"}`}>
      {message && message} {time && time}
    </p>
    </div>}
  </div>
