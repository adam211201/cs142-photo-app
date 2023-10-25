import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import axios from 'axios';
import './userDetail.css';

function UserDetail(props) {
	const [user, setUser] = useState({});
	const [mostRecentPhoto, setMostRecentPhoto] = useState();
	const [mostCommentedPhoto, setMostCommentedPhoto] = useState();
	const { userId } = useParams();

	useEffect(async () => {
		let didReceiveUser = true;
		let didReceiveMostRecentPhoto = true;
		let didReceiveMostCommentedPhoto = true;

		try {
			const res = await axios.get(`/user/${userId}`);
			const data = await res.data;

			if (didReceiveUser) {
				setUser(data);
			}
		} catch (err) {
			console.log(err);
		}

		try {
			const res = await axios.get(`/user/${userId}/mostRecentPhoto`);
			const data = await res.data;

			if (didReceiveMostRecentPhoto) {
				setMostRecentPhoto(data);
			}
		} catch (err) {
			console.log(err);
		}

		try {
			const res = await axios.get(`/user/${userId}/mostCommentedPhoto`);
			const data = await res.data;

			if (didReceiveMostCommentedPhoto) {
				setMostCommentedPhoto(data);
			}
		} catch (err) {
			console.log(err);
		}

		props.handleNewInfo({ id: userId, title: 'Details' });

		return () => {
			didReceiveUser = false;
			didReceiveMostRecentPhoto = false;
		};
	}, [userId, props.photosUpdated]);

	return (
		<div>
			<Typography variant='h3' gutterBottom>
				{user.first_name} {user.last_name}
			</Typography>
			<Typography variant='body1' gutterBottom>
				is a {user.occupation} from {user.location}.
			</Typography>
			<Typography gutterBottom>They say: {user.description}</Typography>
			<Typography variant='body1' gutterBottom>
				See <Link to={`/photos/${user._id}`}>{`${user.first_name}'s Photos`}</Link>.
			</Typography>
			{mostRecentPhoto && (
				<div style={{ marginTop: 16 }}>
					<Link to={`/photos/${mostRecentPhoto.user_id}`}>
						<img src={`../../images/${mostRecentPhoto.file_name}`} className='user-detail-img' />
					</Link>
					<Typography variant='body1' gutterBottom>
						Most recent photo uploaded on — {mostRecentPhoto.date_time}
					</Typography>
				</div>
			)}
			{mostCommentedPhoto && (
				<div style={{ marginTop: 16 }}>
					<Link to={`/photos/${mostCommentedPhoto.user_id}`}>
						<img src={`../../images/${mostCommentedPhoto.file_name}`} className='user-detail-img' />
					</Link>
					<Typography variant='body1' gutterBottom>
						Comment Count: {mostCommentedPhoto.comment_count}
					</Typography>
				</div>
			)}
		</div>
	);
}

export default UserDetail;
