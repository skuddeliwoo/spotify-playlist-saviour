const express = require('express')

const app = express();

app.use(express.static('public'))

const port = 3001;

app.get('/', (req, res) => {
	res.send('hello there! to use, please go to /login') // TODO: add anchor to /login
})

app.get('/login', (req, res) => {
	const clientId = '620f16a20cf34c52a093c714264195ad'
	const scopes = 'playlist-read-private playlist-read-collaborative'
	const redirect_uri = 'http://' + req.hostname + ':' + port + '/playlists.html'
// TODO: change 'http://' to actual used protocol of express
	res.redirect('https://accounts.spotify.com/authorize'
		+ '?response_type=token'
		+ '&client_id=' + clientId
		+ '&scope=' + encodeURIComponent(scopes)
		+ '&redirect_uri=' + encodeURIComponent(redirect_uri)
		)
});

app.listen(port, () => {
	console.log('listening on port ' + port)
})