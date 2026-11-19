import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  aboutContent as fallbackAbout,
  features as fallbackFeatures,
  meetupAlbums as fallbackAlbums,
  meetupSection as fallbackMeetupSection,
  siteConfig as fallbackSite,
  storySlides as fallbackSlides,
  tracks as fallbackTracks,
  upcomingEvent as fallbackEvent,
  upcomingEvents as fallbackEvents,
} from '../data/mockData';

const ContentContext = createContext(null);

function normalizeEvent(event, index = 0) {
  return {
    id: event?.id || `event-${index + 1}`,
    title: event?.title || '',
    subtitle: event?.subtitle || '',
    badge: event?.badge || '',
    date: event?.date || '',
    time: event?.time || '',
    location: event?.location || '',
    note: event?.note || '',
    status: event?.status || 'open',
  };
}

export function mergeContent(apiContent) {
  const hasApi = apiContent && typeof apiContent === 'object';
  const siteConfig = {
    ...fallbackSite,
    ...(hasApi ? apiContent.siteConfig || {} : {}),
  };

  const upcomingEventBase = {
    ...fallbackEvent,
    ...(hasApi ? apiContent.upcomingEvent || {} : {}),
  };

  const meetupSection = {
    heading: fallbackMeetupSection.heading,
    subheading: fallbackMeetupSection.subheading,
    categoryBadge: fallbackMeetupSection.categoryBadge,
    ...(hasApi && apiContent.meetupSection
      ? apiContent.meetupSection
      : {
          heading: upcomingEventBase.heading,
          subheading: upcomingEventBase.subheading,
          categoryBadge: upcomingEventBase.categoryBadge,
        }),
  };

  const upcomingEvents =
    hasApi && Array.isArray(apiContent.upcomingEvents) && apiContent.upcomingEvents.length
      ? apiContent.upcomingEvents.filter((e) => e && typeof e === 'object').map(normalizeEvent)
      : (fallbackEvents.length ? fallbackEvents : [upcomingEventBase]).map(normalizeEvent);

  const upcomingEvent = {
    ...meetupSection,
    ...upcomingEvents[0],
  };

  const features =
    hasApi && Array.isArray(apiContent.features) ? apiContent.features : fallbackFeatures;
  const meetupAlbums =
    hasApi && Array.isArray(apiContent.meetupAlbums) ? apiContent.meetupAlbums : fallbackAlbums;

  const aboutRaw = hasApi ? apiContent.aboutContent || {} : {};
  const aboutContent = {
    ...fallbackAbout,
    ...aboutRaw,
    philosophy: {
      ...fallbackAbout.philosophy,
      ...(aboutRaw.philosophy || {}),
    },
    values:
      Array.isArray(aboutRaw.values) && aboutRaw.values.length
        ? aboutRaw.values
        : fallbackAbout.values,
    kermanStory: {
      ...fallbackAbout.kermanStory,
      ...(aboutRaw.kermanStory || {}),
    },
  };

  const storySlides =
    hasApi && Array.isArray(apiContent.storySlides) ? apiContent.storySlides : fallbackSlides;

  const tracks =
    hasApi && Array.isArray(apiContent.tracks) && apiContent.tracks.length
      ? apiContent.tracks.map((track) => ({
          id: track.id,
          title: track.title || '',
          artist: track.artist || '',
          album: track.album || '',
          description: track.description || '',
          url: track.url || siteConfig.musicUrl || '/music.mp3',
        }))
      : [
          {
            ...fallbackTracks[0],
            description: fallbackTracks[0]?.description || '',
            url: siteConfig.musicUrl || fallbackTracks[0]?.url || '/music.mp3',
          },
        ];

  if (tracks[0]?.url) {
    siteConfig.musicUrl = tracks[0].url;
  }

  const galleryItems = meetupAlbums.flatMap((album) =>
    (album.photos || []).map((photo) => ({
      ...photo,
      event: album.shortTitle || album.title,
      fullEventTitle: album.title,
      date: album.date,
      location: album.location,
      albumId: album.id,
    }))
  );

  return {
    siteConfig,
    meetupSection,
    upcomingEvents,
    upcomingEvent,
    features,
    meetupAlbums,
    aboutContent,
    tracks,
    storySlides,
    galleryItems,
    galleryCategories: [
      'همه رویدادها',
      ...meetupAlbums.map((album) => album.shortTitle || album.title),
    ],
  };
}

export function ContentProvider({ children }) {
  const [apiContent, setApiContent] = useState(null);
  const [source, setSource] = useState('local');
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        const res = await fetch('/api/content.php', { cache: 'no-store' });
        if (!res.ok) throw new Error('content');
        const data = await res.json();
        setApiContent(data);
        setSource('api');
        setLoaded(true);
        return data;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    setSource('local');
    setLoaded(true);
    return null;
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      ...mergeContent(apiContent),
      source,
      loaded,
      reload,
    }),
    [apiContent, source, loaded, reload]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return ctx;
}
