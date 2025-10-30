// login.js - plain React without JSX
import React, { useState } from 'react';

function Login(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    function doLogin(e) {
        e.preventDefault();
        // try to get geolocation (non-blocking)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                sendLogin(position.coords.latitude, position.coords.longitude);
            }, function () {
                sendLogin(null, null);
            }, { timeout: 5000 });
        } else {
            sendLogin(null, null);
        }
    }

    function sendLogin(lat, lng) {
        setMsg('Logging in...');
        fetch('http://localhost:5000/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password, latitude: lat, longitude: lng })
        }).then(res => res.json())
            .then(data => {
                if (data && data.id) {
                    props.onLoginSuccess(data);
                } else {
                    setMsg((data && data.error) || 'Login failed');
                }
            }).catch(err => {
                console.error(err);
                setMsg('Network error: ' + err.toString());
            });
    }

    return React.createElement('div', { className: 'login' },
        React.createElement('form', { onSubmit: doLogin },
            React.createElement('div', null,
                React.createElement('label', null, 'Username'),
                React.createElement('input', { value: username, onChange: e => setUsername(e.target.value) })),
            React.createElement('div', null,
                React.createElement('label', null, 'Password'),
                React.createElement('input', { type: 'password', value: password, onChange: e => setPassword(e.target.value) })),
            React.createElement('div', null,
                React.createElement('button', { type: 'submit' }, 'Login'))
        ),
        React.createElement('p', null, msg)
    );
}

export default Login;
