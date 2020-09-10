import React, { Component } from 'react'
import PropTypes from 'prop-types'

class ChatInput extends Component {
  static propTypes = {
    onSubmitMessage: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.myRef = React.createRef();

    this.state = {
        message: '',
    }
  }

  componentDidMount(){
    this.myRef.current.focus();
  }

  enterButtonHandler = (event) => {
    if (event.keyCode === 13) {
      this.messsageHandler(event)
    }
    return;
  }
  
  messsageHandler = (event) => {
    if (this.state.message === "") {
        event.preventDefault()
    } else {
        this.props.onSubmitMessage(this.state.message)
        this.setState({ message: '' })
    }
  }

  render() {
    return (
        <div class="input-group mb-3">
            <input type="text" class="form-control" 
            maxlength="50"
            ref={this.myRef}
            value={this.state.message}
            onKeyDown={this.enterButtonHandler}
            onChange={e => this.setState({ message: e.target.value })} 
            placeholder="Enter message..."/>
            <div class="input-group-append">
                <button class="btn btn-primary" type="button" 
                onClick={this.messsageHandler}>Send</button>
                <button class="btn btn-warning" type="button" onClick={this.props.logoutHandler}>Logout</button>
            </div>
        </div>
    )
  }
}

export default ChatInput