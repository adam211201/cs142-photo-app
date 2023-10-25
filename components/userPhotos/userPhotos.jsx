import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import UserPhoto from './userPhoto';

function UserPhotos(props) {
	const [userPhotos, setUserPhotos] = useState([]);
	const [postUpdated, setPostUpdated] = useState(false);
	const { userId } = useParams();

	const updatePost = () => {
		setPostUpdated(!postUpdated);
	};

	useEffect(async () => {
		let didReceiveUserPhotos = true;

		try {
			const res = await axios.get(`/photosOfUser/${userId}`);
			const data = await res.data;

			if (didReceiveUserPhotos) {
				setUserPhotos(data);
			}
		} catch (err) {
			console.log(err);
		}

		props.handleNewInfo({ id: userId, title: 'Photos' });

		return () => {
			didReceiveUserPhotos = false;
		};
	}, [props.photosUpdated, postUpdated]);

	return (
		<div>
			{userPhotos &&
				userPhotos.map((photo) => {
					return <UserPhoto key={photo._id} photo={photo} updatePost={updatePost} updatePhotos={props.updatePhotos} loggedInUser={props.loggedInUser} />;
				})}
		</div>
	);
}

export default UserPhotos;
