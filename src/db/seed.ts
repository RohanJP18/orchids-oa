import { db } from './index'
import { recentlyPlayed, madeForYou, popularAlbums } from './schema'

const seedRecentlyPlayed = [
  { 
    id: "1",
    title: "Liked Songs", 
    artist: "320 songs",
    album: "Your Music",
    image: "https://v3.fal.media/files/panda/kvQ0deOgoUWHP04ajVH3A_output.png",
    duration: 180
  },
  { 
    id: "2",
    title: "Discover Weekly", 
    artist: "Spotify",
    album: "Weekly Mix",
    image: "https://v3.fal.media/files/kangaroo/HRayeBi01JIqfkCjjoenp_output.png",
    duration: 210
  },
  { 
    id: "3",
    title: "Release Radar", 
    artist: "Spotify",
    album: "New Releases",
    image: "https://v3.fal.media/files/panda/q7hWJCgH2Fy4cJdWqAzuk_output.png",
    duration: 195
  },
  { 
    id: "4",
    title: "Daily Mix 1", 
    artist: "Spotify",
    album: "Daily Mix",
    image: "https://v3.fal.media/files/elephant/N5qDbXOpqAlIcK7kJ4BBp_output.png",
    duration: 225
  },
  { 
    id: "5",
    title: "Chill Hits", 
    artist: "Spotify",
    album: "Chill Collection",
    image: "https://v3.fal.media/files/rabbit/tAQ6AzJJdlEZW-y4eNdxO_output.png",
    duration: 240
  },
  { 
    id: "6",
    title: "Top 50 - Global", 
    artist: "Spotify",
    album: "Global Charts",
    image: "https://v3.fal.media/files/kangaroo/0OgdfDAzLEbkda0m7uLJw_output.png",
    duration: 205
  }
]

const seedMadeForYou = [
  { 
    id: "7",
    title: "Discover Weekly", 
    artist: "Your weekly mixtape of fresh music",
    album: "Weekly Discovery",
    image: "https://v3.fal.media/files/kangaroo/HRayeBi01JIqfkCjjoenp_output.png",
    duration: 210,
    description: "Your weekly mixtape of fresh music",
    category: "playlist"
  },
  { 
    id: "8",
    title: "Release Radar", 
    artist: "Catch all the latest music from artists you follow",
    album: "New Music Friday",
    image: "https://v3.fal.media/files/panda/q7hWJCgH2Fy4cJdWqAzuk_output.png",
    duration: 195,
    description: "Catch all the latest music from artists you follow",
    category: "playlist"
  },
  { 
    id: "9",
    title: "Daily Mix 1", 
    artist: "Billie Eilish, Lorde, Clairo and more",
    album: "Alternative Mix",
    image: "https://v3.fal.media/files/elephant/N5qDbXOpqAlIcK7kJ4BBp_output.png",
    duration: 225,
    description: "Billie Eilish, Lorde, Clairo and more",
    category: "playlist"
  },
  { 
    id: "10",
    title: "Daily Mix 2", 
    artist: "Arctic Monkeys, The Strokes, Tame Impala and more",
    album: "Indie Rock Mix",
    image: "https://v3.fal.media/files/rabbit/tAQ6AzJJdlEZW-y4eNdxO_output.png",
    duration: 240,
    description: "Arctic Monkeys, The Strokes, Tame Impala and more",
    category: "playlist"
  },
  { 
    id: "11",
    title: "Daily Mix 3", 
    artist: "Taylor Swift, Olivia Rodrigo, Gracie Abrams and more",
    album: "Pop Mix",
    image: "https://v3.fal.media/files/rabbit/b11V_uidRMsa2mTr5mCfz_output.png",
    duration: 190,
    description: "Taylor Swift, Olivia Rodrigo, Gracie Abrams and more",
    category: "playlist"
  },
  { 
    id: "12",
    title: "On Repeat", 
    artist: "The songs you can't get enough of",
    album: "Your Favorites",
    image: "https://v3.fal.media/files/rabbit/mVegWQYIe0yj8NixTQQG-_output.png",
    duration: 220,
    description: "The songs you can't get enough of",
    category: "playlist"
  }
]

const seedPopularAlbums = [
  { 
    id: "13",
    title: "Midnights", 
    artist: "Taylor Swift",
    album: "Midnights",
    image: "https://v3.fal.media/files/elephant/C_rLsEbIUdbn6nQ0wz14S_output.png",
    duration: 275,
    releaseYear: 2022,
    genre: "Pop"
  },
  { 
    id: "14",
    title: "Harry's House", 
    artist: "Harry Styles",
    album: "Harry's House",
    image: "https://v3.fal.media/files/panda/kvQ0deOgoUWHP04ajVH3A_output.png",
    duration: 245,
    releaseYear: 2022,
    genre: "Pop"
  },
  { 
    id: "15",
    title: "Un Verano Sin Ti", 
    artist: "Bad Bunny",
    album: "Un Verano Sin Ti",
    image: "https://v3.fal.media/files/kangaroo/HRayeBi01JIqfkCjjoenp_output.png",
    duration: 265,
    releaseYear: 2022,
    genre: "Reggaeton"
  },
  { 
    id: "16",
    title: "Renaissance", 
    artist: "Beyoncé",
    album: "Renaissance",
    image: "https://v3.fal.media/files/elephant/N5qDbXOpqAlIcK7kJ4BBp_output.png",
    duration: 290,
    releaseYear: 2022,
    genre: "R&B"
  },
  { 
    id: "17",
    title: "SOUR", 
    artist: "Olivia Rodrigo",
    album: "SOUR",
    image: "https://v3.fal.media/files/rabbit/tAQ6AzJJdlEZW-y4eNdxO_output.png",
    duration: 215,
    releaseYear: 2021,
    genre: "Pop"
  },
  { 
    id: "18",
    title: "Folklore", 
    artist: "Taylor Swift",
    album: "Folklore",
    image: "https://v3.fal.media/files/rabbit/b11V_uidRMsa2mTr5mCfz_output.png",
    duration: 285,
    releaseYear: 2020,
    genre: "Indie Folk"
  },
  { 
    id: "19",
    title: "Fine Line", 
    artist: "Harry Styles",
    album: "Fine Line",
    image: "https://v3.fal.media/files/panda/q7hWJCgH2Fy4cJdWqAzuk_output.png",
    duration: 255,
    releaseYear: 2019,
    genre: "Pop Rock"
  },
  { 
    id: "20",
    title: "After Hours", 
    artist: "The Weeknd",
    album: "After Hours",
    image: "https://v3.fal.media/files/kangaroo/0OgdfDAzLEbkda0m7uLJw_output.png",
    duration: 270,
    releaseYear: 2020,
    genre: "R&B"
  }
]

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...')
    
    // Clear existing data
    await db.delete(recentlyPlayed)
    await db.delete(madeForYou)
    await db.delete(popularAlbums)
    
    // Insert recently played data
    for (const song of seedRecentlyPlayed) {
      await db.insert(recentlyPlayed).values({
        ...song,
        playedAt: new Date()
      })
    }
    
    // Insert made for you data
    for (const playlist of seedMadeForYou) {
      await db.insert(madeForYou).values(playlist)
    }
    
    // Insert popular albums data
    for (const album of seedPopularAlbums) {
      await db.insert(popularAlbums).values(album)
    }
    
    console.log('✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
} 

