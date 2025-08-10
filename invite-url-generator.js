// Run this to generate a proper invite URL with all required permissions
const CLIENT_ID = 'YOUR_BOT_CLIENT_ID'; // Replace with your actual Client ID

const permissions = [
  'VIEW_CHANNEL',          // 1024
  'SEND_MESSAGES',         // 2048  
  'READ_MESSAGE_HISTORY',  // 65536
  'ADD_REACTIONS',         // 64
  'CREATE_PUBLIC_THREADS', // 34359738368
  'USE_SLASH_COMMANDS'     // Included in applications.commands scope
];

// Required permissions as a bitfield
const permissionBits = 
  1024 +      // VIEW_CHANNEL
  2048 +      // SEND_MESSAGES  
  65536 +     // READ_MESSAGE_HISTORY
  64 +        // ADD_REACTIONS
  34359738368; // CREATE_PUBLIC_THREADS

const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=${permissionBits}&scope=bot%20applications.commands`;

console.log('Invite URL:', inviteURL);
console.log('\nReplace YOUR_BOT_CLIENT_ID with your actual Client ID from Discord Developer Portal');