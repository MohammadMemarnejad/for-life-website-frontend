import seed from './content.seed.json';

export const siteConfig = {
  ...seed.siteConfig,
};

export const upcomingEvent = {
  ...seed.upcomingEvent,
};

export const meetupSection = {
  heading: seed.meetupSection?.heading || seed.upcomingEvent?.heading || '',
  subheading: seed.meetupSection?.subheading || seed.upcomingEvent?.subheading || '',
  categoryBadge: seed.meetupSection?.categoryBadge || seed.upcomingEvent?.categoryBadge || '',
};

export const upcomingEvents = Array.isArray(seed.upcomingEvents) && seed.upcomingEvents.length
  ? seed.upcomingEvents
  : [seed.upcomingEvent].filter(Boolean);

export const storySlides = seed.storySlides || [];

export const features = seed.features || [];

export const meetupAlbums = seed.meetupAlbums || [];

export const aboutContent = seed.aboutContent || {
  heroTitle: '',
  heroSubtitle: '',
  philosophy: { title: '', p1: '', p2: '' },
  values: [],
  kermanStory: { title: '', desc: '' },
};

export const tracks = Array.isArray(seed.tracks) && seed.tracks.length
  ? seed.tracks
  : [
      {
        id: 'track-default',
        title: 'نوای دل‌نشین سنتور',
        artist: siteConfig.name || 'دَمی برای زیستن',
        album: 'تکنوازی سنتور',
        description: 'دستگاه شور',
        url: siteConfig.musicUrl || '/music.mp3',
      },
    ];

export const galleryItems = meetupAlbums.flatMap((album) =>
  (album.photos || []).map((photo) => ({
    ...photo,
    event: album.shortTitle || album.title,
    fullEventTitle: album.title,
    date: album.date,
    location: album.location,
    albumId: album.id,
  }))
);

export const galleryCategories = [
  'همه رویدادها',
  ...meetupAlbums.map((album) => album.shortTitle || album.title),
];

/** Raw seed snapshot from /dami/for-life (used as local fallback). */
export const contentSeed = seed;
