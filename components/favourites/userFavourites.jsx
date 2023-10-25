import { List } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserFavourite from './userFavourite';

function UserFavourites(props) {
	const [userFavourites, setUserFavourites] = useState([]);
	const [favouritesUpdated, setFavouritesUpdated] = useState(false);

	const updateFavourites = () => {
		setFavouritesUpdated(!favouritesUpdated);
	};

	useEffect(async () => {
		let didReceiveFavourites = true;

		try {
			const res = await axios.get(`/favourites`);
			const data = await res.data;

			if (didReceiveFavourites) {
				console.log(data);

				setUserFavourites(data);
			}

			props.handleNewInfo({ id: props.userId, title: 'Favourites' });
		} catch (err) {
			console.log(err);
		}

		return () => {
			didReceiveFavourites = false;
		};
	}, [favouritesUpdated]);

	return (
		<List>
			{userFavourites &&
				userFavourites.map((userFavourite) => {
					return <UserFavourite key={userFavourite._id} photo={userFavourite} updateFavourites={updateFavourites} />;
				})}
		</List>
	);
}

export default UserFavourites;
