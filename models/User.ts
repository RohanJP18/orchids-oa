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

User.hasMany('favorites', {as: 'favorites'}); Song.belongsTo('User', {as: 'favoritedBy', foreignKey: 'user_id'});