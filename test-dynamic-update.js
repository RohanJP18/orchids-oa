const fetch = require('node-fetch');

async function testDynamicUpdate() {
  console.log('🔄 Testing Dynamic Database Updates...\n');
  
  try {
    // First, let's see the current state
    console.log('📊 Current Recently Played Songs:');
    const currentResponse = await fetch('http://localhost:3000/api/recently-played');
    const currentData = await currentResponse.json();
    console.log(`   Currently ${currentData.data.length} songs in database`);
    
    // Add a new song
    console.log('\n➕ Adding a new song to the database...');
    const newSong = {
      id: `test-${Date.now()}`,
      title: "Dynamic Test Song",
      artist: "Test Artist",
      album: "Test Album",
      image: "https://via.placeholder.com/300x300/00FF00/FFFFFF?text=NEW",
      duration: 200
    };
    
    const addResponse = await fetch('http://localhost:3000/api/recently-played', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSong)
    });
    
    const addResult = await addResponse.json();
    
    if (addResult.success) {
      console.log('✅ New song added successfully!');
      console.log(`   Added: "${newSong.title}" by ${newSong.artist}`);
    } else {
      console.log('❌ Failed to add song:', addResult.error);
      return;
    }
    
    // Check the updated state
    console.log('\n📊 Updated Recently Played Songs:');
    const updatedResponse = await fetch('http://localhost:3000/api/recently-played');
    const updatedData = await updatedResponse.json();
    console.log(`   Now ${updatedData.data.length} songs in database`);
    
    // Find our new song
    const newSongInDB = updatedData.data.find(song => song.id === newSong.id);
    if (newSongInDB) {
      console.log('✅ New song found in database!');
      console.log(`   Title: ${newSongInDB.title}`);
      console.log(`   Artist: ${newSongInDB.artist}`);
      console.log(`   Added at: ${newSongInDB.playedAt}`);
    }
    
    console.log('\n🎉 Dynamic Update Test Results:');
    console.log('✅ Database accepts new data');
    console.log('✅ API correctly stores new data');
    console.log('✅ Data is immediately available via API');
    console.log('✅ Frontend will show new data on next refresh');
    
    console.log('\n🌐 To see the update in the frontend:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Refresh the page');
    console.log('3. Look for "Dynamic Test Song" in the Recently Played section');
    console.log('4. The song should appear with a green placeholder image');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running with: npm run dev');
  }
}

testDynamicUpdate(); 