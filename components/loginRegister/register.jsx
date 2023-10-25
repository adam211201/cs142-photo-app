import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import './loginRegister.css';
import axios from 'axios';

function Register() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [retypePassword, setRetypePassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [location, setLocation] = useState('');
	const [description, setDescription] = useState('');
	const [occupation, setOccupation] = useState('');
	const [error, setError] = useState(undefined);
	const [success, setSuccess] = useState(undefined);

	const handleRegistration = async (e) => {
		e.preventDefault();

		try {
			setError(undefined);

			if (!username) {
				setError('Username field is required.');
			} else if (!password) {
				setError('Password field is required.');
			} else if (!retypePassword) {
				setError('Retype password field is required.');
			} else if (!firstName) {
				setError('First name field is required.');
			} else if (!lastName) {
				setError('Last name field is required.');
			} else if (password !== retypePassword) {
				setError('Passwords are not identical.');
			} else {
				await axios.post('/user', {
					login_name: username,
					password: password,
					first_name: firstName,
					last_name: lastName,
					locationPlace: location,
					description: description,
					occupation: occupation,
				});

				setUsername('');
				setPassword('');
				setRetypePassword('');
				setFirstName('');
				setLastName('');
				setLocation('');
				setDescription('');
				setOccupation('');

				setError('');
				setSuccess('User successfully created.');
			}
		} catch (err) {
			setSuccess('');
			setError(err.response.data);
		}
	};

	return (
		<form className='cs142-login-form' onSubmit={handleRegistration}>
			<TextField label='Username' variant='outlined' value={username} onChange={(e) => setUsername(e.target.value)} />
			<TextField label='Password' variant='outlined' value={password} onChange={(e) => setPassword(e.target.value)} type='password' />
			<TextField label='Retype Password' variant='outlined' value={retypePassword} onChange={(e) => setRetypePassword(e.target.value)} type='password' />
			<TextField label='First Name' variant='outlined' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
			<TextField label='Last Name' variant='outlined' value={lastName} onChange={(e) => setLastName(e.target.value)} />
			<TextField label='Location' variant='outlined' value={location} onChange={(e) => setLocation(e.target.value)} />
			<TextField label='Description' variant='outlined' value={description} onChange={(e) => setDescription(e.target.value)} />
			<TextField label='Occupation' variant='outlined' value={occupation} onChange={(e) => setOccupation(e.target.value)} />
			<Button variant='contained' type='submit'>
				Register Me
			</Button>
			{error && (
				<Typography variant='body1' style={{ color: 'red' }}>
					{error}
				</Typography>
			)}
			{success && (
				<Typography variant='body1' style={{ color: 'green' }}>
					{success}
				</Typography>
			)}
		</form>
	);
}

export default Register;
