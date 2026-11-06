/**
 * Chicken Wars '26 - Global Config & Seed Definitions
 */
const AppConfig = {
  // Replace these with your Chicken Wars Supabase project credentials
  SUPABASE_URL: "https://tozmfbneiasmnxbftlqw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvem1mYm5laWFzbW54YmZ0bHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzAzMjUsImV4cCI6MjEwMzk0NjMyNX0.-Z6w_lYZ9kmRtUWLK93XHP1aRUEd0NlEYM0qLvZWtNw",

  // Storage Keys
  STORAGE_STATE_KEY: 'CW26_TOURNAMENT_STATE_V1',
  AUTH_USER_KEY: 'CW26_AUTH_USERNAME',
  VOTES_LEDGER_KEY: 'CW26_VOTES_LEDGER',

  // 3-Song Rotating Playlist
  PLAYLIST: [
    'cluck1.mp3',
    'cluck2.mp3',
    'cluck3.mp3'
  ],

  // 16-Team Bracket Placeholders (Easily modify team names here)
  TEAMS: [
    { seed: 1,  name: "Cluckin' Bell" },
    { seed: 16, name: "Tender Crispies" },
    { seed: 8,  name: "Barnyard Brawlers" },
    { seed: 9,  name: "Spicy Beaks" },
    { seed: 5,  name: "Nashville Heat" },
    { seed: 12, name: "Golden Drumsticks" },
    { seed: 4,  name: "Rooster's Roost" },
    { seed: 13, name: "Crispy Combos" },
    { seed: 6,  name: "Wing Dynasty" },
    { seed: 11, name: "Featherweights" },
    { seed: 3,  name: "The Hen House" },
    { seed: 14, name: "Buffalo Pluckers" },
    { seed: 7,  name: "Smoked Pullet" },
    { seed: 10, name: "Fryer Force" },
    { seed: 2,  name: "Atomic Clucker" },
    { seed: 15, name: "Peckish Puffs" }
  ]
};