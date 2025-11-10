import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PWA icon sizes
const iconSizes = [
  16, 32, 57, 60, 72, 76, 96, 114, 120, 128, 144, 152, 180, 192, 384, 512
];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG icon as base
const createBaseIcon = () => {
  return `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#0ea5e9"/>
  <path d="M256 128C185.307 128 128 185.307 128 256s57.307 128 128 128 128-57.307 128-128S326.693 128 256 128zm0 224c-52.935 0-96-43.065-96-96s43.065-96 96-96 96 43.065 96 96-43.065 96-96 96z" fill="white"/>
  <path d="M256 160c-52.935 0-96 43.065-96 96s43.065 96 96 96 96-43.065 96-96-43.065-96-96-96zm0 160c-35.346 0-64-28.654-64-64s28.654-64 64-64 64 28.654 64 64-28.654 64-64 64z" fill="#0ea5e9"/>
  <circle cx="256" cy="256" r="32" fill="white"/>
</svg>`;
};

// Create a simple badge icon
const createBadgeIcon = () => {
  return `<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="72" height="72" rx="36" fill="#ef4444"/>
  <text x="36" y="45" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">!</text>
</svg>`;
};

// Create a dashboard icon
const createDashboardIcon = () => {
  return `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="24" fill="#0ea5e9"/>
  <rect x="20" y="20" width="20" height="20" rx="4" fill="white"/>
  <rect x="48" y="20" width="20" height="20" rx="4" fill="white"/>
  <rect x="20" y="48" width="20" height="20" rx="4" fill="white"/>
  <rect x="48" y="48" width="20" height="20" rx="4" fill="white"/>
</svg>`;
};

// Create a search icon
const createSearchIcon = () => {
  return `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="24" fill="#0ea5e9"/>
  <circle cx="40" cy="40" r="16" stroke="white" stroke-width="4" fill="none"/>
  <path d="M56 56L72 72" stroke="white" stroke-width="4" stroke-linecap="round"/>
</svg>`;
};

// Create a notification icon
const createNotificationIcon = () => {
  return `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="24" fill="#0ea5e9"/>
  <path d="M48 20C52.4183 20 56 23.5817 56 28V40C56 44.4183 52.4183 48 48 48C43.5817 48 40 44.4183 40 40V28C40 23.5817 43.5817 28 48 20Z" fill="white"/>
  <path d="M48 52C50.2091 52 52 50.2091 52 48H44C44 50.2091 45.7909 52 48 52Z" fill="white"/>
</svg>`;
};

// Create a checkmark icon
const createCheckmarkIcon = () => {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 6L9 17L4 12" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
};

// Create an X mark icon
const createXMarkIcon = () => {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 6L6 18M6 6L18 18" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
};

// Generate icons
console.log('Generating PWA icons...');

// Create base icon
const baseIcon = createBaseIcon();
fs.writeFileSync(path.join(iconsDir, 'icon-base.svg'), baseIcon);

// Create actual SVG icons for all sizes
iconSizes.forEach(size => {
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  // Create a scaled version of the base icon
  const scaledIcon = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#0ea5e9"/>
  <path d="M256 128C185.307 128 128 185.307 128 256s57.307 128 128 128 128-57.307 128-128S326.693 128 256 128zm0 224c-52.935 0-96-43.065-96-96s43.065-96 96-96 96 43.065 96 96-43.065 96-96 96z" fill="white"/>
  <path d="M256 160c-52.935 0-96 43.065-96 96s43.065 96 96 96 96-43.065 96-96-43.065-96-96-96zm0 160c-35.346 0-64-28.654-64-64s28.654-64 64-64 64 28.654 64 64-28.654 64-64 64z" fill="#0ea5e9"/>
  <circle cx="256" cy="256" r="32" fill="white"/>
</svg>`;
  
  fs.writeFileSync(filepath, scaledIcon);
  console.log(`Created ${filename}`);
});

// Create additional icon files
const additionalIcons = [
  { name: 'badge-72x72.svg', content: createBadgeIcon() },
  { name: 'dashboard-96x96.svg', content: createDashboardIcon() },
  { name: 'search-96x96.svg', content: createSearchIcon() },
  { name: 'notification-96x96.svg', content: createNotificationIcon() },
  { name: 'checkmark.svg', content: createCheckmarkIcon() },
  { name: 'xmark.svg', content: createXMarkIcon() }
];

additionalIcons.forEach(icon => {
  const filepath = path.join(iconsDir, icon.name);
  fs.writeFileSync(filepath, icon.content);
  console.log(`Created ${icon.name}`);
});

console.log('\nPWA SVG icons created successfully!');
console.log('\nNote: These are SVG icons. For production, you should:');
console.log('1. Convert these to PNG format for better compatibility');
console.log('2. Use an image processing library like sharp or jimp');
console.log('3. Optimize the icons for different sizes');
console.log('4. Test the icons on different devices and browsers'); 