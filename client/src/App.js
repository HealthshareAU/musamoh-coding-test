import React from 'react';
import './App.css';


class App extends React.Component {
    constructor() {
        super();
        this.state = {
            id: '',
            user: {
                firstName: '',
                email: '',
                password: '',
            },
            registerUser: {
                firstName: '',
                email: '',
                password: '',
            },
        };

        this.post = this.post.bind(this);
        this.get = this.get.bind(this);
        this.getUser = this.getUser.bind(this);
        this.handleIdChange = this.handleIdChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.createUser = this.createUser.bind(this);
    }

    async post(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(data),
        });
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        return body;
    }

    async get(url) {
        const response = await fetch(url);
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message);
        }

        return body;
    };

    async getUser() {
        if(this.state.id.length) {
            const response = await this.get(`/api/get-user/${this.state.id}`);
            this.setState({user: response.user});
        }
    }

    handleIdChange(event) {
        this.setState({id: event.target.value});
    }

    handleInputChange(event) {
        const name = event.target.name;
        const registerUser = {
            ...this.state.registerUser,
        };
        registerUser[name] = event.target.value;

        this.setState({registerUser});
    }

    createUser(event) {
        event.preventDefault();
        this.post('/api/users/', this.state.registerUser);
    }

    render() {
        return (
            <div className="app">
                <header className="app-header">
                    <h1 className="app-title">Welcome to Coding-Test</h1>
                </header>
                <div>
                    <p className="app-intro">
                        Name: {this.state.user.firstName}
                    </p>
                    <p className="app-intro">
                        Email: {this.state.user.email}
                    </p>
                    <input value={this.state.id} onChange={this.handleIdChange}/>
                    <button
                        onClick={this.getUser}
                    >
                        Get User
                    </button>
                </div>
                <form onSubmit={this.createUser}>
                    <label>First Name</label>
                    <input name="firstName" onChange={this.handleInputChange}/>
                    <label>Email</label>
                    <input name="email" onChange={this.handleInputChange}/>
                    <label>Password</label>
                    <input name="password" onChange={this.handleInputChange}/>
                    <button type="submit">Create User</button>
                </form>
            </div>
        );
    }
}

export default App;
