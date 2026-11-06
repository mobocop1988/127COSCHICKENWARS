/**
 * config.js - Global Configuration & Seeded Rooster Teams
 */
const AppConfig = {
  // SUPABASE CONFIGURATION: Update with your project URL and anon public key
  SUPABASE_URL: "https://tozmfbneiasmnxbftlqw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvem1mYm5laWFzbW54YmZ0bHF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzAzMjUsImV4cCI6MjEwMzk0NjMyNX0.-Z6w_lYZ9kmRtUWLK93XHP1aRUEd0NlEYM0qLvZWtNw",

  STORAGE_KEYS: {
    STATE: 'CW26_TOURNAMENT_STATE_V1',
    CLIENT_SECRET: 'CW26_CLIENT_SECRET',
    PLAYER_NAME: 'CW26_PLAYER_USERNAME',
    USER_HASH: 'CW26_USER_HASH',
    VOTE_LEDGER: 'CW26_VOTES_LEDGER',
    LAST_LOGIN: 'CW26_LAST_LOGIN'
  },

  // 16-MAN BRACKET: Fully adjustable placeholder chicken contenders
  SEEDED_TEAMS: [
    { seed: 1,  name: "Gus's Fried Roosters" },
    { seed: 16, name: "Joja Farm Nuggets" },
    { seed: 8,  name: "Marnie's Free-Range Wings" },
    { seed: 9,  name: "Pelican Town Tenders" },
    { seed: 5,  name: "Prairie King Hot Chicken" },
    { seed: 12, name: "Cindersap Smokers" },
    { seed: 4,  name: "Pierre's Crispy Cutlets" },
    { seed: 13, name: "Secret Woods Drumsticks" },
    { seed: 6,  name: "Calico Desert Thighs" },
    { seed: 11, name: "Saloon Buffalo Bites" },
    { seed: 3,  name: "Willy's Popcorn Poultry" },
    { seed: 14, name: "Bus Stop Strips" },
    { seed: 7,  name: "Robin's Hickory Chicken" },
    { seed: 10, name: "Wizard's Void Wings" },
    { seed: 2,  name: "Clint's Cast-Iron Skillet" },
    { seed: 15, name: "Junimo Golden Tenders" }
  ]
};
