import React, { useState } from 'react';
import { Button } from '@mui/material';
import './loginRegister.css';
import Login from './login';
import Register from './register';

function LoginRegister(props) {
	const [showRegister, setShowRegister] = useState(false);

	return (
		<>
			<Button onClick={() => setShowRegister(!showRegister)}>{showRegister ? 'Login' : 'Register'}</Button>
			{showRegister ? <Register></Register> : <Login onLogin={props.onLogin}></Login>}
		</>
	);
}

export default LoginRegister;
