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
    subtitle: 'DareToDoyle'
  },
  login: {
    userName: 'Jacque',
    simulatedPassword: 'doyleos1',
    startDelayMs: 320,
    keyDelayMs: 75,
    passwordDelayMs: 55,
    // Duration of the visible "Opening DoyleOS..." loading phase.
    loadingDurationMs: 4000
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
