import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import './loginRegister.css';
import axios from 'axios';

function Login(props) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(undefined);

	const handleLogin = async (e) => {
		e.preventDefault();

		try {
			setError(undefined);

			const res = await axios.post('/admin/login', {
				login_name: username,
				password: password,
			});
			const data = await res.data;

			props.onLogin({ id: data._id, text: 'Home' });
		} catch (err) {
			setError(err.response.data);
		}
	};

	return (
		<form className='cs142-login-form' onSubmit={handleLogin}>
			<TextField label='Username' variant='outlined' value={username} onChange={(e) => setUsername(e.target.value)} />
			<TextField label='Password' variant='outlined' value={password} onChange={(e) => setPassword(e.target.value)} type='password' />
			<Button variant='contained' type='submit'>
				Sign In
			</Button>
			{error && (
				<Typography variant='body1' style={{ color: 'red' }}>
					{error}
				</Typography>
			)}
		</form>
	);
}

export default Login;
