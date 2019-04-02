if(document.readyState == 'loading'){
	document.onreadystatechange = function () {
		if(document.readyState == 'interactive'){
			app();
		}
	}
} else{
	app();
}

function app() {
	const token = window.location.href.split('=')[1]
	const headers = new Headers({
		'Authorization': 'Bearer ' + token,
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	})

	function get(url) {
		return fetch(url, {
			headers: headers
		})
	}

	// todo: err handling 401 token expired

	// todo: object sorting: playlist name asc, tracks track_number asc

	const saveButton = document.querySelector('#saveButton');

	fetchPlaylists = async(url) => {
		let promise = undefined
		if (!url) {
			promise = get(`https://api.spotify.com/v1/me/playlists`)
		} else {
			promise = get(url)
		}

		return promise
		.then(res => res.json())
		.then(async (res) => {
			const lists = res.items.map(async (playlist) => {
				return await handlePlaylist(playlist)
			})
			if (res.next) {
				return await fetchPlaylists(res.next)
			} else {
				return lists
			}
		})
	}

	handlePlaylist = async (playlist) => {
		let playlistMapped = {
			name: playlist.name,
			trackCount: playlist.tracks.total,
			tracks: []
		}

		
		playlistMapped = await fetchPlaylistTracks(playlistMapped, playlist.tracks.href)

		return playlistMapped;
	}

	fetchPlaylistTracks = async (playlistMapped, url) => {
		return get(url)
		.then(res => res.json())
		.then(async res => {
			await res.items.map((track) => {
				playlistMapped.tracks.push({
					name: track.track.name,
					duration_ms: track.track.duration_ms,
					artists: track.track.artists.map(artist => {
						return  {
							name: artist.name,
							id: artist.id
						}
					}),
					album: {
						name: track.track.album.name,
						id: track.track.album.id
					},
					track_number: track.track.track_number,
					id: track.track.id
				})
			})
			if (res.next) {
				return await fetchPlaylistTracks(playlistMapped, res.next)
			} else {
				return playlistMapped
			}
		})
	}

	function download(content, fileName, contentType) {
		var a = document.createElement("a");
		var file = new Blob([content], {type: contentType});
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	}

	saveButton.onclick = async() => {
		const playlists = await Promise.all(await fetchPlaylists()) 
		download(JSON.stringify(playlists), 'playlists.json', 'text/json');
	}
}