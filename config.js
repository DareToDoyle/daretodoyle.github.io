/**
 * DoyleOS owner-editable content.
 *
 * To activate a button, replace `url: null` with the exact HTTPS destination
 * (or a validated `mailto:` address for Contact). Never put passwords or other
 * secrets here: this file is public when deployed.
 *
 * `icon` values select original CSS-drawn icons in styles.css.
 */
window.DOYLE_OS_CONFIG = {
  brand: {
    name: 'DoyleOS 98',
    subtitle: 'DareToDoyle',
    version: '1.3.0'
  },
  login: {
    userName: 'Jacque',
    // Visual bullets only. This is not a credential or real password.
    simulatedPassword: '••••••••',
    startDelayMs: 320,
    keyDelayMs: 120,
    passwordDelayMs: 95,
    betweenFieldsDelayMs: 320,
    beforeLoadingDelayMs: 380,
    buttonPressDurationMs: 240,
    // Duration of the visible "Opening DoyleOS..." loading phase.
    loadingDurationMs: 4000
  },
  legal: {
    lastUpdated: '3 November 2026',
    operatorName: 'DareToDoyle'
  },
  analytics: {
    measurementId: 'G-NHR1LC4P30'
  },
  /**
   * Doyle Media Player library.
   *
   * Add, remove, or reorder objects in `songs` to curate the player. Spotify
   * track links must use https://open.spotify.com/track/TRACK_ID. Leave a URL
   * as null until you have the exact link; DoyleOS will show that entry as
   * unavailable instead of guessing a destination.
   *
   * `artwork` may be a site-relative image path (for example
   * "media/my-song.jpg") or an HTTPS URL. It is optional.
   */
  mediaPlayer: {
    enabled: true,
    appName: 'Doyle Media Player',
    defaultTrackId: 'master-of-puppets',
    // DoyleOS asks Spotify to begin when the app opens. Some browsers may
    // still require the visitor to press the DoyleOS play button once.
    autoplay: true,
    songs: [
      {
        id: 'master-of-puppets',
        title: 'Master Of Puppets',
        artist: 'Metallica',
        spotifyUrl: 'https://open.spotify.com/track/2MuWTIM3b0YEAskbeeFE1i?si=b3aa3f6b96e643d8',
        artwork: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02668e3aca3167e6e569a9aa20',
        year: '',
        note: ''
      },
      {
        id: 'animal-i-have-become',
        title: 'Animal I Have Become',
        artist: 'Three Days Grace',
        spotifyUrl: 'https://open.spotify.com/track/5eFxwmqKrHpSQDOEIFYlgY?si=c1051e645f4746b7',
        artwork: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02fa4c18fdbd1bf1a39b7b794f',
        year: '',
        note: ''
      },
      {
        id: 'man-in-the-box',
        title: 'Man in the Box',
        artist: 'Alice In Chains',
        spotifyUrl: 'https://open.spotify.com/track/6gZVQvQZOFpzIy3HblJ20F?si=728cd12c95d14d94',
        artwork: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e023cf83c82a8e976d7b51e2d00',
        year: '',
        note: ''
      },
      {
        id: 'counting-worms',
        title: 'Counting Worms',
        artist: 'Knocked Loose',
        spotifyUrl: 'https://open.spotify.com/track/7g3OmlRZ15Gq5Lo3WBMol0?si=7e8182bc77fc49b3',
        artwork: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02f87207e3c1f0e58ab9dc84e2',
        year: '',
        note: ''
      }
    ]
  },
  apps: [
    {
      id: 'about', label: 'About Me.txt', icon: 'document',
      heading: 'Hi, I’m Jacque.',
      description: 'Welcome to DoyleOS — a little corner of the internet for my work, interests and whatever I’m building next.',
      cta: 'Learn more', url: null
    },
    {
      id: 'linkedin', label: 'LinkedIn.exe', icon: 'linkedin',
      heading: 'LinkedIn',
      description: 'My professional profile, experience and the technology I work with. Mostly Microsoft 365, automation and building useful digital tools.',
      cta: 'Open LinkedIn', url: null
    },
    {
      id: 'instagram', label: 'Instagram.exe', icon: 'camera',
      heading: 'Instagram',
      description: 'Photos, travel, life updates and the occasional questionable decision.',
      cta: 'Open Instagram', url: null
    },
    {
      id: 'projects', label: 'Projects', icon: 'folder',
      heading: 'Projects',
      description: 'A collection of things I’ve built, experimented with or worked on. More projects coming soon.',
      cta: 'View projects', url: null
    },
    {
      id: 'fitness', label: 'Fitness Tracker', icon: 'fitness',
      heading: 'Fitness Tracker',
      description: 'Training, big walks, challenges and fitness milestones.',
      cta: 'View fitness profile', url: null
    },
    {
      id: 'contact', label: 'Contact.exe', icon: 'mail',
      heading: 'Contact',
      description: 'Want to get in touch? Reach out for a conversation, collaboration or just to say hello.',
      cta: 'Get in touch', url: null
    }
  ]
};
