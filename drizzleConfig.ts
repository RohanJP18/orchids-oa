drizzle.addModels({ RecentlyPlayed, MadeForYou, PopularAlbums });

const RecentlyPlayed = this.orm.define('recentlyPlayed', {
  id: {
    type: this.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  song_id: {
    type: this.Sequelize.INTEGER,
    references: {
      model: 'songs',
      key: 'id'
    }
  },
  user_id: {
    type: this.Sequelize.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  played_at: {
    type: this.Sequelize.DATE,
    defaultValue: this.Sequelize.NOW
  }
});