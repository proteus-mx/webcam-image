const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const items = [
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/ScottsUnload.jpg?a', name: 'ScottsUnload', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Scotts.jpg?a', name: 'Scotts', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Village.jpg?a', name: 'Village', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/FALLStowers.jpg?a', name: 'FallsTowers', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Ruined.jpg?a', name: 'Ruined', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Cloud9.jpg?a', name: 'Cloud9', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Mainstreet.jpg?a', name: 'MainStreet', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Drovers.jpg?a', name: 'Drovers', type: 'image' },
  // Skipping 'iframe' types for now
];

function downloadImage(url, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}_${timestamp}.jpg`;
  const dir = path.join(__dirname, 'images');

  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filepath = path.join(dir, filename);

  axios({
    url,
    responseType: 'stream'
  }).then(response => {
    response.data.pipe(fs.createWriteStream(filepath));
    console.log(`Saved: ${filename}`);
  }).catch(err => {
    console.error(`Failed to fetch ${name}:`, err.message);
  });
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log(`Fetching images at ${new Date().toLocaleString()}`);
  items.filter(i => i.type === 'image').forEach(item => {
    downloadImage(item.url, item.name);
  });
});