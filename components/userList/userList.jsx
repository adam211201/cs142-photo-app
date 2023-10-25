import React, { useEffect, useState } from 'react';
import { Divider, List, Typography } from '@mui/material';
import axios from 'axios';
import UserListItem from './userListItem';

function UserList(props) {
	const [users, setUsers] = useState([]);

	useEffect(async () => {
		let didReceiveUserList = true;

		if (props.isLoggedIn) {
			try {
				const res = await axios.get(`/user/list`);
				const data = await res.data;

				if (didReceiveUserList) {
					setUsers(data);
				}
			} catch (err) {
				console.log(err);
			}
		}

		return () => {
			didReceiveUserList = false;
		};
	}, [props.isLoggedIn, props.photosUpdated]);

	return (
		<div>
			<Typography variant='body1'>
				{props.isLoggedIn ? 'Welcome! Please select one of the users from the list below to see their information and photos.' : 'Login to view users.'}
			</Typography>
			{props.isLoggedIn && (
				<Typography variant='h6' style={{ marginTop: 10 }} gutterBottom>
					Current User
				</Typography>
			)}
			{props.isLoggedIn && (
				<List component='nav'>
					{users &&
						users
							.filter((user) => user._id === props.userId)
							.map((user) => {
								return (
									<div key={user._id}>
										<UserListItem user={user} advancedFeatures={props.advancedFeatures} />
										<Divider />
									</div>
								);
							})}
				</List>
			)}
			{props.isLoggedIn && (
				<Typography variant='h6' style={{ marginTop: 10 }} gutterBottom>
					Friends
				</Typography>
			)}
			{props.isLoggedIn && (
				<List component='nav'>
					{users &&
						users
							.filter((user) => user._id !== props.userId)
							.map((user) => {
								return (
									<div key={user._id}>
										<UserListItem user={user} advancedFeatures={props.advancedFeatures} />
										<Divider />
									</div>
								);
							})}
				</List>
			)}
		</div>
	);
}

export default UserList;
