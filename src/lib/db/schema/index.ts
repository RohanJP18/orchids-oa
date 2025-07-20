// Export all schema modules
export * from './recently-played';

// Main schema object for easy access
import { recentlyPlayedSongs, users, songs } from './recently-played';

export const schema = {
  recentlyPlayedSongs,
  users,
  songs,
};

export default schema; 