// Home.js - plain React (no JSX)
import React, { useEffect, useState } from 'react';

function Home({ user, onLogout }) {
    const [locations, setLocations] = useState(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/api/user/getEmployeeLocations/${user.id}`)
            .then(r => r.json())
            .then(d => {
                setLocations(d);
            }).catch(e => {
                setMsg('Failed to fetch locations: ' + e.toString());
            });
    }, [user]);

    function doLogout() {
        fetch('http://localhost:5000/api/user/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
        }).then(r => r.json()).then(d => {
            onLogout();
        }).catch(e => {
            console.error(e);
            onLogout();
        });
    }

    return React.createElement('div', { className: 'home' },
        React.createElement('h2', null, 'Home'),
        React.createElement('div', null,
            React.createElement('b', null, 'Logged in as: '), user.email || user.username || 'User'
        ),
        React.createElement('button', { onClick: doLogout }, 'Logout'),
        React.createElement('hr', null),
        React.createElement('div', null, msg),
        locations ? React.createElement('div', null,
            React.createElement('h3', null, 'Processed Path'),
            React.createElement('pre', null, JSON.stringify(locations.path || [], null, 2)),
            React.createElement('h3', null, 'Stops'),
            React.createElement('pre', null, JSON.stringify(locations.stops || [], null, 2)),
            React.createElement('h3', null, 'Movements'),
            React.createElement('pre', null, JSON.stringify(locations.movements || [], null, 2)),
            React.createElement('h3', null, 'Raw Points'),
            React.createElement('pre', null, JSON.stringify(locations.raw || [], null, 2)),
        ) : React.createElement('p', null, 'No location data yet.')
    );
}

export default Home;
