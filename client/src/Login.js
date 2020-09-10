import React, { Component } from 'react'

class Login extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  
    this.state = { 
      name: ''
     };
  }

  componentDidMount(){
    this.myRef.current.focus();
  }

  enterButtonHandler = (event) => {
    if (event.keyCode === 13) {
      this.login(event)
    }
    return;
  }

  login = (event) => {
    if (this.state.name === "") {
      event.preventDefault();
    } else {
      const newPerson = {
        loggedIn: true,
        name: this.state.name,
        messages: [],
        action: '',
        validationMessage: null
      }
      this.props.loginHandler(newPerson);
    }
  }

  render() {
    return (
      <div>
        <div class="input-group">
          <input type="text" class="form-control" 
          onKeyDown={this.enterButtonHandler}
          ref={this.myRef}
          placeholder="Username" 
          onChange={(e) => this.setState({name: e.target.value})}/>
          <div class="input-group-append">
            <button onClick={() => this.login()} className="btn btn-primary">Login</button>
          </div>
        </div>
      </div>
    )
  }
}

export default Login
