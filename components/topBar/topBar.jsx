import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	ButtonGroup,
	MenuItem,
	DialogActions,
	FormGroup,
	FormControlLabel,
	Checkbox,
	FormControl,
	Select,
} from '@mui/material';
import './topBar.css';
import { Link } from 'react-router-dom';

function TopBar(props) {
	const [version, setVersion] = useState(undefined);
	const [name, setName] = useState(undefined);
	const [open, setOpen] = useState(false);
	const [users, setUsers] = useState([]);
	const [uploadInput, setUploadInput] = useState();
	const [sharingPermissions, setSharingPermissions] = useState([]);
	const [visibility, setVisibility] = useState(true);

	const handleAddPhoto = async (e) => {
		e.preventDefault();

		if (uploadInput.files.length > 0) {
			const domForm = new FormData();

			domForm.append('uploadedphoto', uploadInput.files[0]);
			domForm.append('visibility', visibility);

			if (!visibility) {
				domForm.append('sharing_permissions', sharingPermissions);
			}

			try {
				await axios.post('/photos/new', domForm);

				setOpen(false);
				setVisibility(true);

				props.updatePhotos();
			} catch (err) {
				console.log(err);
			}
		}
	};

	const handleAddPerson = (e) => {
		const {
			target: { value },
		} = e;
		setSharingPermissions(typeof value === 'string' ? value.split(',') : value);
	};

	const handleAccountDeletion = async (e) => {
		e.preventDefault();

		/* eslint-disable-next-line */
		if (confirm('Are you sure you want to delete your account?!')) {
			try {
				await axios.delete('/user');

				props.logout();
			} catch (err) {
				console.log(err.response.data);
			}
		}
	};

	const handleLogout = async (e) => {
		e.preventDefault();

		try {
			await axios.post('/admin/logout', {});

			props.logout();
		} catch (err) {
			console.log(err.response.data);
		}
	};

	useEffect(async () => {
		let didReceiveSchema = true;
		let didReceiveName = true;
		let didReceiveUserList = true;

		try {
			const res = await axios.get('/test/info');
			const data = await res.data;

			if (didReceiveSchema) {
				setVersion(data.__v);
			}
		} catch (err) {
			console.log(err);
		}

		if (props.user.id) {
			try {
				const res = await axios.get(`/user/list`);
				const data = await res.data;

				if (didReceiveUserList) {
					setUsers(data);
				}
			} catch (err) {
				console.log(err);
			}

			try {
				const res = await axios.get(`/user/${props.user.id}`);
				const data = await res.data;

				if (didReceiveName) {
					setName(data.first_name);
				}
			} catch (err) {
				console.log(err);
			}
		}

		return () => {
			didReceiveSchema = false;
			didReceiveName = false;
			didReceiveUserList = false;
		};
	}, [props.user]);

	const handleOpen = () => {
		setOpen(true);
		setVisibility(true);
	};

	const handleClose = () => {
		setOpen(false);
		setVisibility(true);
	};

	return (
		<>
			<AppBar className='cs142-topbar-appBar' position='absolute'>
				<Toolbar className='cs142-topbar-toolBar'>
					<Typography variant='h5' color='inherit'>
						Adam Barry {`v-${version}`}
					</Typography>
					{props.isLoggedIn ? (
						<Typography variant='h5' color='inherit'>
							Hi {props.loggedInUser}
						</Typography>
					) : (
						<Typography variant='h5' color='inherit'>
							Please Log In
						</Typography>
					)}
					{props.isLoggedIn && (
						<FormGroup>
							<FormControlLabel
								control={
									/* eslint-disable-next-line */
									<Checkbox
										color='default'
										onChange={(e) => {
											props.onHandleAdvancedFeatures(e.target.checked);
										}}
									/>
								}
								label='Enable Advanced Features'
							/>
						</FormGroup>
					)}
					{props.isLoggedIn && (
						<Typography variant='h5' color='inherit'>
							{props.user.title} of {name}
						</Typography>
					)}
					{props.isLoggedIn && (
						<ButtonGroup variant='contained'>
							<Button variant='contained' onClick={handleOpen}>
								Add Photo
							</Button>
							<Link to='/favourites' style={{ textDecoration: 'none' }}>
								<Button>Favourites</Button>
							</Link>
							<form onSubmit={handleLogout}>
								<Button variant='contained' type='submit'>
									Logout
								</Button>
								<Button onClick={handleAccountDeletion}>Delete Account</Button>
							</form>
						</ButtonGroup>
					)}
				</Toolbar>
			</AppBar>
			{/* This is the pop up dialog for add photo*/}
			<div>
				<Dialog open={open} onClose={handleClose}>
					<DialogTitle>Add Photo</DialogTitle>
					<DialogContent>
						<DialogContentText style={{ marginBottom: 10 }}>Add a new photo to your feed!</DialogContentText>
						<input
							type='file'
							style={{ marginBottom: 10 }}
							accept='image/*'
							ref={(domFileRef) => {
								setUploadInput(domFileRef);
							}}
						/>
						<DialogContentText style={{ marginBottom: 10 }}>
							Select who can view your photo.{' '}
							<Checkbox
								value={visibility}
								onChange={() => {
									setVisibility(!visibility);
								}}
							/>
						</DialogContentText>
						{!visibility && (
							<FormControl fullWidth>
								<Select multiple value={sharingPermissions} onChange={handleAddPerson}>
									{users &&
										users
											.filter((user) => user._id !== props.userId)
											.map((user) => {
												return (
													<MenuItem key={user._id} value={user._id}>
														{user.first_name}
													</MenuItem>
												);
											})}
								</Select>
							</FormControl>
						)}
					</DialogContent>
					<DialogActions>
						<Button onClick={handleClose}>Cancel</Button>
						<Button onClick={handleAddPhoto}>Add Photo</Button>
					</DialogActions>
				</Dialog>
			</div>
		</>
	);
}

export default TopBar;
