const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');

const items = [
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/ScottsUnload.jpg?a', name: 'ScottsUnload', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Scotts.jpg?a', name: 'Scotts', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Village.jpg?a', name: 'Village', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/FALLStowers.jpg?a', name: 'FallsTowers', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Ruined.jpg?a', name: 'Ruined', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Cloud9.jpg?a', name: 'Cloud9', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Mainstreet.jpg?a', name: 'MainStreet', type: 'image' },
  { url: 'https://www.skifalls.com.au/Portals/0/WebCams/Live/Drovers.jpg?a', name: 'Drovers', type: 'image' }
];

function downloadImage(url, name) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const dateFolder = now.toISOString().slice(0, 10); // YYYY-MM-DD

  const dir = path.join(__dirname, 'images', dateFolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${name}_${timestamp}.jpg`;
  const filepath = path.join(dir, filename);

  return axios({
    url,
    responseType: 'stream'
  }).then(response => {
    return new Promise((resolve, reject) => {
      const stream = response.data.pipe(fs.createWriteStream(filepath));
      stream.on('finish', () => {
        console.log(`Saved: ${filename}`);
        resolve();
      });
      stream.on('error', reject);
    });
  }).catch(err => {
    console.error(`Failed to fetch ${name}:`, err.message);
  });
}

function pushToGitHub() {
  exec(`
    cd images &&
    git add . &&
    git commit -m "Auto upload batch: ${new Date().toISOString()}" &&
    git push
  `, (error, stdout, stderr) => {
    if (error) {
      console.error('Git push error:', stderr);
    } else {
      console.log('✅ GitHub push complete.');
    }
  });
}

// 🕔 Every 1 minutes: download images
cron.schedule('*/1 * * * *', async () => {
  console.log(`🕔 Downloading images at ${new Date().toLocaleTimeString()}`);
  const downloads = items
    .filter(i => i.type === 'image')
    .map(item => downloadImage(item.url, item.name));
  await Promise.allSettled(downloads);
});

// 🕐 Every 1 minute 0: push to GitHub
cron.schedule('*/1 * * * *', () => {
  console.log(`🕐 Uploading to GitHub at ${new Date().toLocaleTimeString()}`);
  pushToGitHub();
});