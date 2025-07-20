In each component: import useSWR from 'swr'; const { data: songs, error } = useSWR('/api/songs'); if (error) return <div>Failed to load</div>; if (!songs) return <div>Loading...</div>; return <div>{songs.map(song => <Song key={song.id} song={song} />)}</div>;

RecentlyPlayed.tsx: 
// replace hardcoded data with data from /api/songs

MadeForYou.tsx: 
// replace hardcoded data with data from /api/playlists

PopularAlbums.tsx: 
// replace hardcoded data with data from /api/songs