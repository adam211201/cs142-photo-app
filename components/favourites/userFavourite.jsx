import { ListItem, Typography } from '@mui/material';
import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import './userFavourite.css';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#photoshareapp');

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
	},
};

function UserFavourite(props) {
	const [modalIsOpen, setIsOpen] = useState(false);

	function openModal() {
		setIsOpen(true);
	}

	function closeModal() {
		setIsOpen(false);
	}

	const handleRemovePost = async (e) => {
		e.preventDefault();

		try {
			await axios.delete(`/favourites/${props.photo._id}`);

			props.updateFavourites();
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<>
			<ListItem className='user-favourite'>
				<img src={`../../images/${props.photo.file_name}`} className='user-favourite-img' onClick={openModal} />
				<CloseIcon style={{ cursor: 'pointer' }} onClick={handleRemovePost} />
			</ListItem>
			{/* eslint-disable-next-line react/jsx-no-bind */}
			<Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel='Favourited Photo'>
				<div className='user-modal-actions'>
					{/* eslint-disable-next-line react/jsx-no-bind */}
					<CloseIcon style={{ cursor: 'pointer' }} onClick={closeModal} />
				</div>
				<img src={`../../images/${props.photo.file_name}`} className='user-modal-img' />
				<Typography variant='body1' gutterBottom>
					{props.photo.date_time}
				</Typography>
			</Modal>
		</>
	);
}

export default UserFavourite;
