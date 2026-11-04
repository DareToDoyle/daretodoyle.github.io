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
    version: '1.4.1'
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
    lastUpdated: '4 November 2026',
    operatorName: 'DareToDoyle'
  },
  analytics: {
    measurementId: 'G-NHR1LC4P30'
  },
  /**
   * Doyle Media Player library.
   *
   * Add, remove, or reorder objects in `songs` to curate the player.
   * `previewId` is the numeric Deezer track ID used for its 30-second preview.
   *
   * `artwork` may be a site-relative image path (for example
   * "media/my-song.jpg") or an HTTPS URL. It is optional.
   */
  mediaPlayer: {
    enabled: true,
    appName: 'Doyle Media Player',
    defaultTrackId: 'master-of-puppets',
    // Public SayaMusicAPI instance. Self-host the MIT-licensed Worker and
    // replace this URL if the public service becomes unavailable.
    previewApiBase: 'https://sayamusicapi.sayaproject-mailflow.workers.dev',
    // Playback is attempted on open; browser autoplay rules may require Play.
    autoplay: true,
    songs: [
      {
        id: 'master-of-puppets',
        title: 'Master Of Puppets',
        artist: 'Metallica',
        previewId: '424565232',
        artwork: 'https://cdn-images.dzcdn.net/images/cover/291e2af9295ca885b154eee75dfa0432/250x250-000000-80-0-0.jpg',
        year: '',
        note: ''
      },
      {
        id: 'animal-i-have-become',
        title: 'Animal I Have Become',
        artist: 'Three Days Grace',
        previewId: '10199904',
        artwork: 'https://cdn-images.dzcdn.net/images/cover/2bda9b70f023c72f8afa9e3e673abeb4/250x250-000000-80-0-0.jpg',
        year: '',
        note: ''
      },
      {
        id: 'man-in-the-box',
        title: 'Man in the Box',
        artist: 'Alice In Chains',
        previewId: '15523335',
        artwork: 'https://cdn-images.dzcdn.net/images/cover/e35ea43ea08ab9a2fc3d542470acf47b/250x250-000000-80-0-0.jpg',
        year: '',
        note: ''
      },
      {
        id: 'counting-worms',
        title: 'Counting Worms',
        artist: 'Knocked Loose',
        previewId: '3272621131',
        artwork: 'https://cdn-images.dzcdn.net/images/cover/bc334f7c1f42ef3ce4e5fa1950f05a6f/250x250-000000-80-0-0.jpg',
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
