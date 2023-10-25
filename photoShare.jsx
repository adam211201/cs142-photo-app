import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import axios from 'axios';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/topBar';
import UserDetail from './components/userDetail/userDetail';
import UserList from './components/userList/userList';
import UserPhotos from './components/userPhotos/userPhotos';
import UserComments from './components/userComments/userComments';
import LoginRegister from './components/loginRegister/loginRegister';
import UserFavourites from './components/favourites/userFavourites';

function PhotoShare() {
	const [isLoggedIn, setLoggedIn] = useState(false);
	const [userId, setUserId] = useState('');
	const [loggedInUser, setLoggedInUser] = useState('');
	const [advancedFeatures, setAdvancedFeatures] = useState(false);
	const [commentsUpdated, setCommentsUpdated] = useState(true);
	const [photosUpdated, setPhotosUpdated] = useState(true);
	const [user, setUser] = useState({
		id: '',
		title: '',
	});

	const login = useCallback(async (changedUser) => {
		setUserId(changedUser.id);

		try {
			const res = await axios.get(`/user/${changedUser.id}`);
			const data = await res.data;

			setLoggedIn(true);
			setLoggedInUser(data.first_name);
		} catch (err) {
			console.log(err);
		}
	});

	const logout = useCallback(() => {
		setLoggedIn(false);
	});

	const handleUpdateComments = useCallback(() => {
		setCommentsUpdated(!commentsUpdated);
	});

	const handleUpdatePhotos = useCallback(() => {
		setPhotosUpdated(!photosUpdated);
	});

	const handleNewInfo = useCallback((changedUser) => {
		setUser({ ...changedUser });
	});

	const handleAdvancedFeatures = useCallback((value) => {
		setAdvancedFeatures(value);
	});

	return (
		<HashRouter>
			<div>
				<Grid container spacing={8}>
					<Grid item xs={12}>
						<TopBar
							user={user}
							userId={userId}
							loggedInUser={loggedInUser}
							isLoggedIn={isLoggedIn}
							logout={logout}
							updatePhotos={handleUpdatePhotos}
							onHandleAdvancedFeatures={handleAdvancedFeatures}
						/>
					</Grid>
					<div className='cs142-main-topbar-buffer' />
					<Grid item sm={3}>
						<Paper className='cs142-sidebar'>
							<UserList isLoggedIn={isLoggedIn} advancedFeatures={advancedFeatures} photosUpdated={photosUpdated} userId={userId} />
						</Paper>
					</Grid>
					<Grid item sm={9}>
						<Paper className='cs142-main-grid-item'>
							<Switch>
								{isLoggedIn && advancedFeatures ? (
									<Route
										path='/users/:userId/comments'
										render={(props) => <UserComments {...props} handleNewInfo={handleNewInfo} commentsUpdated={commentsUpdated} />}
									/>
								) : (
									<Redirect path='/users/:userId/comments' to='/login-register' />
								)}
								{isLoggedIn ? (
									<Route path='/favourites' render={(props) => <UserFavourites {...props} userId={userId} handleNewInfo={handleNewInfo} />} />
								) : (
									<Redirect path='/favourites' to='/login-register' />
								)}
								{isLoggedIn ? (
									<Route path='/users/:userId' render={(props) => <UserDetail {...props} handleNewInfo={handleNewInfo} photosUpdated={photosUpdated} />} />
								) : (
									<Redirect path='/users/:userId' to='/login-register' />
								)}
								{isLoggedIn ? (
									<Route
										path='/photos/:userId'
										render={(props) => (
											<UserPhotos
												{...props}
												handleNewInfo={handleNewInfo}
												updateComments={handleUpdateComments}
												photosUpdated={photosUpdated}
												updatePhotos={handleUpdatePhotos}
												loggedInUser={userId}
											/>
										)}
									/>
								) : (
									<Redirect path='/photos/:userId' to='/login-register' />
								)}
								{isLoggedIn ? <Route path='/users' render={(props) => <UserList {...props} />} /> : <Redirect path='/users' to='/login-register' />}
								{!isLoggedIn ? (
									<Route path='/login-register' render={(props) => <LoginRegister {...props} onLogin={login} />} />
								) : (
									<Redirect path='/login-register' to={`/users/${userId}`} />
								)}
								{!isLoggedIn && <Redirect path='/' to='/login-register' />}
							</Switch>
						</Paper>
					</Grid>
				</Grid>
			</div>
		</HashRouter>
	);
}

ReactDOM.render(<PhotoShare />, document.getElementById('photoshareapp'));
