router.get('/recentlyPlayedSongs/:userId', async (req, res) => { const recentlyPlayedSongs = await db.query('SELECT * FROM RecentlyPlayedSongs WHERE userId = ?', [req.params.userId]); res.json(recentlyPlayedSongs); });

router.post('/recentlyPlayed', (req, res) => { const { songId, userId } = req.body; const playedAt = new Date(); // Add to database });