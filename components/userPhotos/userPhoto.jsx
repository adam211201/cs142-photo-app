import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Card, CardMedia, CardContent, Button, TextField } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

import './userPhoto.css';

function UserPhoto({ photo, updatePost, updatePhotos, loggedInUser }) {
	const [comment, setComment] = useState('');
	const [error, setError] = useState(undefined);
	const [favourited, setFavourited] = useState(false);

	const comments = photo.comments;

	const handleCommentPost = async (e) => {
		e.preventDefault();

		setComment('');

		try {
			setError('');

			await axios.post(`/commentsOfPhoto/${photo._id}`, {
				comment: comment,
			});

			updatePhotos();
		} catch (err) {
			setError(err.response.data);
		}
	};

	const handleDeleteComment = async (e, commentId) => {
		e.preventDefault();

		try {
			await axios.delete(`/comment/${photo._id}/${commentId}`);

			updatePost();
		} catch (err) {
			console.log(err.response.data);
		}
	};

	const handleDeletePost = async (e) => {
		e.preventDefault();

		try {
			await axios.delete(`/photo/${photo._id}`);

			updatePost();
		} catch (err) {
			console.log(err.response.data);
		}
	};

	const handleFavouritePost = async (e) => {
		e.preventDefault();

		try {
			await axios.post(`/favourites/${photo._id}`, {
				user_id: photo.user_id,
			});

			setFavourited(true);
		} catch (err) {
			console.log(err.response.data);
		}
	};

	useEffect(async () => {
		let alreadyFavourited = true;

		try {
			const res = await axios.get(`/favourites`);
			const data = await res.data;

			if (alreadyFavourited) {
				for (const favourite of data) {
					if (favourite._id === photo._id) {
						setFavourited(true);
					}
				}
			}
		} catch (err) {
			console.log(err);
		}

		return () => {
			alreadyFavourited = false;
		};
	}, []);

	return (
		<Card sx={{ maxWidth: 450, marginBottom: 1 }}>
			{photo.user_id === loggedInUser && <CloseIcon style={{ cursor: 'pointer' }} onClick={handleDeletePost} />}
			<CardMedia sx={{ height: 200 }} image={`../../images/${photo.file_name}`} />
			<CardContent>
				<div className='cs142-action-bar'>
					{!favourited ? (
						<FavoriteBorderIcon style={{ color: 'grey' }} onClick={handleFavouritePost} />
					) : (
						<FavoriteIcon style={{ color: 'red', cursor: 'default' }} />
					)}
				</div>
				<Typography gutterBottom variant='h5' component='div'>
					Posted on {photo.date_time}
				</Typography>
				{comments &&
					comments.map((commentObj) => {
						return (
							<Typography key={commentObj._id} gutterBottom variant='body1' component='div'>
								<span>{commentObj.comment}</span> — <span> {commentObj.date_time}</span> —
								<Link to={`/users/${commentObj.user._id}`}>{commentObj.user.first_name}</Link> —
								{commentObj.user._id === loggedInUser && <CloseIcon style={{ cursor: 'pointer' }} onClick={(e) => handleDeleteComment(e, commentObj._id)} />}
							</Typography>
						);
					})}
				<form className='cs142-comment-form' onSubmit={handleCommentPost}>
					<TextField label='Add Comment' placeholder='Add Comment' value={comment} onChange={(e) => setComment(e.target.value)} multiline />
					<Button variant='contained' type='submit'>
						Post Comment
					</Button>
					{error && (
						<Typography variant='body1' style={{ color: 'red' }}>
							{error}
						</Typography>
					)}
				</form>
			</CardContent>
		</Card>
	);
}

export default UserPhoto;
