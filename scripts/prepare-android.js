// Prepares Android assets, launcher icons and splash screens
import fs from 'fs';
import path from 'path';

const androidResDir = path.resolve('android', 'app', 'src', 'main', 'res');
const srcIcon512 = path.resolve('public', 'icons', 'icon-512.png');
const srcIcon192 = path.resolve('public', 'icons', 'icon-192.png');

if (fs.existsSync(androidResDir) && fs.existsSync(srcIcon512)) {
  const mipmaps = [
    'mipmap-mdpi',
    'mipmap-hdpi',
    'mipmap-xhdpi',
    'mipmap-xxhdpi',
    'mipmap-xxxhdpi'
  ];

  mipmaps.forEach((m) => {
    const targetDir = path.join(androidResDir, m);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    // Copy launcher icon
    fs.copyFileSync(srcIcon192, path.join(targetDir, 'ic_launcher.png'));
    fs.copyFileSync(srcIcon512, path.join(targetDir, 'ic_launcher_round.png'));
    fs.copyFileSync(srcIcon512, path.join(targetDir, 'ic_launcher_foreground.png'));
  });

  console.log('Android app icons and splash icons synced successfully to res/mipmap!');
} else {
  console.log('Android folder not yet added. Run "npx cap add android" first.');
}
