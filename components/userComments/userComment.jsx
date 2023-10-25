import { ListItem, ListItemText } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import './userComment.css';

function UserComment({ photo }) {
	return (
		photo.comments &&
		photo.comments.map((comment) => {
			return (
				<Link key={comment._id} to={`/photos/${photo.user_id}`} style={{ color: 'black', textDecoration: 'none' }}>
					<ListItem className='user-comment'>
						<ListItemText primary={`${comment.comment}`} />
						<img src={`../../images/${photo.file_name}`} className='user-comment-img' />
					</ListItem>
				</Link>
			);
		})
	);
}

export default UserComment;
