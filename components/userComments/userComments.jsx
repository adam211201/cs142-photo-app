import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import { List } from '@mui/material';
import UserComment from './userComment';

function UserComments(props) {
	const [photosCommentedOn, setPhotosCommentedOn] = useState([]);
	const { userId } = useParams();

	useEffect(async () => {
		let didReceiveUserPhotosCommentedOn = true;

		try {
			const res = await axios.get(`/user/${userId}/comments`);
			const data = await res.data;

			if (didReceiveUserPhotosCommentedOn) {
				setPhotosCommentedOn(data.photos);
			}
		} catch (err) {
			console.log(err);
		}

		props.handleNewInfo({ id: userId, title: 'Comments' });

		return () => {
			didReceiveUserPhotosCommentedOn = false;
		};
	}, [userId, props.commentsUpdated]);

	return (
		<List>
			{photosCommentedOn &&
				photosCommentedOn.map((photo) => {
					return <UserComment key={photo._id} photo={photo} />;
				})}
		</List>
	);
}

export default UserComments;
