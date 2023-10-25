import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chip, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

import './userListItem.css';

function UserListItem({ user, advancedFeatures }) {
	const [photoCount, setPhotoCount] = useState(0);
	const [commentCount, setCommentCount] = useState(0);

	useEffect(async () => {
		let didReceiveUserPhotoCount = true;
		let didReceiveUserCommentCount = true;

		try {
			const res = await axios.get(`/user/${user._id}/photos`);
			const data = await res.data;

			if (didReceiveUserPhotoCount) {
				setPhotoCount(data.num_photos);
			}
		} catch (err) {
			console.log(err);
		}

		try {
			const res = await axios.get(`/user/${user._id}/comments`);
			const data = await res.data;

			if (didReceiveUserCommentCount) {
				setCommentCount(data.num_comments);
			}
		} catch (err) {
			console.log(err);
		}

		return () => {
			didReceiveUserPhotoCount = false;
			didReceiveUserCommentCount = false;
		};
	}, []);

	return (
		<div>
			<ListItem className='user-list-item'>
				<Link to={`/users/${user._id}`}>
					<ListItemText primary={`${user.first_name} ${user.last_name}`} />
				</Link>
				{advancedFeatures && (
					<div>
						<Chip label={photoCount} color='success' style={{ marginRight: '8px' }} />
						<Link to={`/users/${user._id}/comments`} style={{ textDecoration: 'none' }}>
							<Chip label={commentCount} color='error' />
						</Link>
					</div>
				)}
			</ListItem>
			{user.activity.activity && (
				<div className='user-list-item-activity'>
					{user.activity.photo_id && <img className='user-list-item-activity-img' src={`../../images/${user.activity.photo_id}`} />}
					<span>
						{user.first_name} {user.activity.activity}{' '}
					</span>
				</div>
			)}
		</div>
	);
}

export default UserListItem;
