In Song.ts: export default class Song extends Model { static table = 'songs'; static timestamps = true; id: number; title: string; artist: string; album: string; duration: number; }
In Playlist.ts: export default class Playlist extends Model { static table = 'playlists'; static timestamps = true; id: number; name: string; songs: Song[]; }
In Album.ts: export default class Album extends Model { static table = 'albums'; static timestamps = true; id: number; name: string; artist: string; songs: Song[]; }

User.ts: 
export default class User extends Model {
  static table = 'users';
  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
  };
}

Playlist.ts: 
export default class Playlist extends Model {
  static table = 'playlists';
  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    userId: DataTypes.INTEGER,
    name: DataTypes.STRING,
  };
  static user = this.belongsTo(User, 'userId');
}

Song.ts: 
export default class Song extends Model {
  static table = 'songs';
  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    playlistId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    artist: DataTypes.STRING,
  };
  static playlist = this.belongsTo(Playlist, 'playlistId');
}