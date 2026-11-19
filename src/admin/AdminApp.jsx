import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImagePlus,
  LogOut,
  Music,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { contentSeed } from '../data/mockData';

const TOKEN_KEY = 'damizistan_admin_token';
const INPUT_CLASS =
  'w-full px-3 py-2 rounded-xl border border-[#E7E3D8] bg-white text-sm text-navy-900 focus:outline-none focus:border-olive-600';
const TABS = [
  { id: 'site', label: 'سایت' },
  { id: 'event', label: 'دورهمی‌ها' },
  { id: 'story', label: 'متن‌ها' },
  { id: 'gallery', label: 'گالری' },
  { id: 'music', label: 'موزیک' },
];
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(value) {
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(token, extra = {}) {
  return { 'X-Admin-Token': token, ...extra };
}

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'درخواست انجام نشد');
    err.status = res.status;
    err.needsInstall = !!data.needsInstall;
    throw err;
  }
  return data;
}

function checkSession() {
  return fetch('/api/auth.php', { cache: 'no-store', headers: authHeaders(getToken()) }).then(parseResponse);
}

function loginRequest(password) {
  return fetch('/api/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then(parseResponse);
}

function installRequest(password) {
  return fetch('/api/install.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then(parseResponse);
}

function fetchContent() {
  return fetch('/api/content.php', { cache: 'no-store' }).then(parseResponse);
}

function saveContent(payload, token) {
  return fetch('/api/content.php', {
    method: 'PUT',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  }).then(parseResponse);
}

async function uploadFile(file, kind, token) {
  const form = new FormData();
  form.append('kind', kind);
  form.append('file', file);
  const res = await fetch('/api/upload.php', {
    method: 'POST',
    headers: authHeaders(token),
    body: form,
  });
  const data = await parseResponse(res);
  return data.url;
}

function deleteUpload(url, token) {
  return fetch('/api/upload.php', {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ url }),
  }).then(parseResponse);
}

function collectUploadUrls(value, urls = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('/uploads/')) urls.add(value);
    return urls;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectUploadUrls(item, urls));
    return urls;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectUploadUrls(item, urls));
  }
  return urls;
}

function newId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function reorder(list, index, delta) {
  const next = index + delta;
  if (next < 0 || next >= list.length) return list;
  const copy = list.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

function defaultTrackFromSite(siteConfig = {}) {
  return {
    id: 'track-default',
    title: 'نوای دل‌نشین سنتور',
    artist: siteConfig.name || 'دَمی برای زیستن',
    album: 'تکنوازی سنتور',
    description: 'دستگاه شور',
    url: siteConfig.musicUrl || '/music.mp3',
  };
}

function cloneDraft(raw) {
  const source = raw || contentSeed;
  const siteConfig = { ...(source.siteConfig || {}) };
  const tracks =
    Array.isArray(source.tracks) && source.tracks.length
      ? source.tracks.map((track) => ({
          id: track.id || newId('track'),
          title: track.title || '',
          artist: track.artist || '',
          album: track.album || '',
          description: track.description || '',
          url: track.url || siteConfig.musicUrl || '/music.mp3',
        }))
      : [defaultTrackFromSite(siteConfig)];

  return structuredClone({
    siteConfig,
    meetupSection: { ...(source.meetupSection || {}) },
    upcomingEvents: Array.isArray(source.upcomingEvents) ? source.upcomingEvents : [],
    upcomingEvent: source.upcomingEvent ? { ...source.upcomingEvent } : undefined,
    features: Array.isArray(source.features) ? source.features : [],
    meetupAlbums: Array.isArray(source.meetupAlbums) ? source.meetupAlbums : [],
    aboutContent: source.aboutContent
      ? structuredClone(source.aboutContent)
      : {
          heroTitle: '',
          heroSubtitle: '',
          philosophy: { title: '', p1: '', p2: '' },
          values: [],
          kermanStory: { title: '', desc: '' },
        },
    tracks,
    storySlides: Array.isArray(source.storySlides) ? source.storySlides : [],
  });
}

function syncMusicUrl(draft) {
  const first = draft.tracks?.[0]?.url;
  return {
    ...draft,
    siteConfig: {
      ...draft.siteConfig,
      musicUrl: first || '/music.mp3',
    },
  };
}

function Field({ label, value, onChange, textarea, dir, hint, type = 'text' }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-navy-800">{label}</span>
      {textarea ? (
        <textarea
          rows={4}
          className={`${INPUT_CLASS} resize-y leading-7`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          dir={dir}
          className={INPUT_CLASS}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <span className="block text-[11px] text-[#8C9681] leading-5">{hint}</span>}
    </label>
  );
}

function ImageField({ label, value, onChange, token, onUploaded, onRelease }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const url = await uploadFile(file, 'image', token);
      onUploaded?.(url);
      if (value) onRelease?.(value);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold text-navy-800">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl border border-[#E7E3D8] bg-[#F4EFE6] overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus size={16} className="text-[#8C9681]" />
          )}
        </div>
        <label className="inline-flex items-center px-3 py-2 rounded-full bg-olive-700 text-white text-xs font-medium cursor-pointer hover:bg-olive-800">
          {busy ? 'در حال فشرده‌سازی…' : 'انتخاب عکس'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onPick}
            disabled={busy}
          />
        </label>
      </div>
      <p className="text-[11px] text-[#8C9681]">عکس پیش از ذخیره کوچک می‌شود تا فضای هاست کم بماند.</p>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

function AuthForm({ mode, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'install' && password !== confirm) {
      setError('تکرار رمز یکسان نیست');
      return;
    }
    setBusy(true);
    try {
      const result = mode === 'install' ? await installRequest(password) : await loginRequest(password);
      setToken(result.token);
      onDone(result.token);
    } catch (err) {
      if (err.needsInstall) setError('ابتدا باید پنل را نصب کنید.');
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F0] flex items-center justify-center px-4" dir="rtl">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white border border-[#E7E3D8] rounded-3xl p-8 shadow-sm space-y-5"
      >
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold text-olive-700">دَمی برای زیستن</p>
          <h1 className="text-2xl font-extrabold text-[#222D42]">
            {mode === 'install' ? 'ساخت رمز پنل' : 'ورود به پنل'}
          </h1>
          <p className="text-sm text-[#5F6B7A] leading-7">
            {mode === 'install'
              ? 'این رمز فقط همین یک بار ساخته می‌شود و روی هاست، جدا از کد سایت، ذخیره می‌گردد.'
              : 'با رمزی که موقع راه‌اندازی پنل ساختید وارد شوید.'}
          </p>
        </div>
        <Field label="رمز" type="password" value={password} onChange={setPassword} dir="ltr" />
        {mode === 'install' && (
          <Field label="تکرار رمز" type="password" value={confirm} onChange={setConfirm} dir="ltr" />
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl bg-olive-700 hover:bg-olive-800 disabled:opacity-60 text-white text-sm font-semibold"
        >
          {busy ? 'لطفاً صبر کنید…' : mode === 'install' ? 'ساختن پنل' : 'ورود'}
        </button>
      </form>
    </main>
  );
}

function EventTab({ draft, setDraft }) {
  const section = draft.meetupSection || { heading: '', subheading: '', categoryBadge: '' };
  const events = draft.upcomingEvents || [];

  const patchSection = (key, val) => {
    setDraft((prev) => ({
      ...prev,
      meetupSection: { ...(prev.meetupSection || {}), [key]: val },
    }));
  };

  const patchEvent = (index, patch) => {
    setDraft((prev) => {
      const list = (prev.upcomingEvents || []).slice();
      list[index] = { ...list[index], ...patch };
      return { ...prev, upcomingEvents: list };
    });
  };

  const addEvent = () => {
    setDraft((prev) => ({
      ...prev,
      upcomingEvents: [
        ...(prev.upcomingEvents || []),
        {
          id: newId('event'),
          title: 'دورهمی تازه',
          subtitle: '',
          badge: 'ظرفیت محدود',
          date: '',
          time: '',
          location: prev.siteConfig?.city || '',
          note: '',
          status: 'open',
        },
      ],
    }));
  };

  return (
    <div className="space-y-4">
      <section className="bg-white border border-[#E7E3D8] rounded-3xl p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="عنوان بخش" value={section.heading} onChange={(v) => patchSection('heading', v)} />
        </div>
        <div className="sm:col-span-2">
          <Field
            label="توضیح کوتاه"
            value={section.subheading}
            onChange={(v) => patchSection('subheading', v)}
            textarea
          />
        </div>
        <Field label="برچسب دسته" value={section.categoryBadge} onChange={(v) => patchSection('categoryBadge', v)} />
      </section>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#8C9681] leading-6">هر دورهمی روی سایت کارت و فرم ثبت جداگانه دارد. حداکثر ۱۲ دورهمی.</p>
        <button
          type="button"
          onClick={addEvent}
          disabled={events.length >= 12}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-navy-800 text-white text-sm shrink-0 disabled:opacity-40"
        >
          <Plus size={15} />
          دورهمی جدید
        </button>
      </div>

      {events.map((ev, index) => (
        <article key={ev.id} className="bg-white border border-[#E7E3D8] rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">{ev.title || 'بدون عنوان'}</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#F4EFE6]"
                aria-label="بالا"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, upcomingEvents: reorder(prev.upcomingEvents, index, -1) }))
                }
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#F4EFE6]"
                aria-label="پایین"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, upcomingEvents: reorder(prev.upcomingEvents, index, 1) }))
                }
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full text-red-700 hover:bg-red-50"
                aria-label="حذف دورهمی"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    upcomingEvents: prev.upcomingEvents.filter((_, i) => i !== index),
                  }))
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="عنوان قرار" value={ev.title} onChange={(v) => patchEvent(index, { title: v })} />
            <Field label="زیرعنوان" value={ev.subtitle} onChange={(v) => patchEvent(index, { subtitle: v })} />
            <Field
              label="تاریخ"
              value={ev.date}
              onChange={(v) => patchEvent(index, { date: v })}
              hint="مثلاً پنج‌شنبه ۱۶ مهرماه"
            />
            <Field label="ساعت" value={ev.time} onChange={(v) => patchEvent(index, { time: v })} />
            <Field label="مکان" value={ev.location} onChange={(v) => patchEvent(index, { location: v })} />
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-navy-800">وضعیت ثبت‌نام</span>
              <select
                className={INPUT_CLASS}
                value={ev.status || 'open'}
                onChange={(e) => patchEvent(index, { status: e.target.value })}
              >
                <option value="open">باز است</option>
                <option value="full">ظرفیت پر شده</option>
                <option value="completed">برگزار شده</option>
              </select>
            </label>
            <Field label="برچسب کوچک" value={ev.badge} onChange={(v) => patchEvent(index, { badge: v })} />
          </div>
          <Field
            label="یادداشت پایین کارت"
            value={ev.note}
            onChange={(v) => patchEvent(index, { note: v })}
            textarea
          />
        </article>
      ))}
      {events.length === 0 && (
        <p className="text-sm text-[#5F6B7A] text-center py-10">هنوز دورهمی‌ای نیست.</p>
      )}
    </div>
  );
}

function AboutTab({ draft, setDraft }) {
  const about = draft.aboutContent || {};

  const patchAbout = (key, val) => {
    setDraft((prev) => ({
      ...prev,
      aboutContent: { ...prev.aboutContent, [key]: val },
    }));
  };

  const patchPhilosophy = (key, val) => {
    setDraft((prev) => ({
      ...prev,
      aboutContent: {
        ...prev.aboutContent,
        philosophy: { ...prev.aboutContent.philosophy, [key]: val },
      },
    }));
  };

  const patchValue = (index, key, val) => {
    setDraft((prev) => {
      const values = prev.aboutContent.values.slice();
      values[index] = { ...values[index], [key]: val };
      return { ...prev, aboutContent: { ...prev.aboutContent, values } };
    });
  };

  const patchKerman = (key, val) => {
    setDraft((prev) => ({
      ...prev,
      aboutContent: {
        ...prev.aboutContent,
        kermanStory: { ...prev.aboutContent.kermanStory, [key]: val },
      },
    }));
  };

  return (
    <section className="bg-white border border-[#E7E3D8] rounded-3xl p-5 sm:p-6 space-y-4">
      <h2 className="font-bold">صفحه درباره ما</h2>
      <Field label="عنوان" value={about.heroTitle} onChange={(v) => patchAbout('heroTitle', v)} />
      <Field label="زیرعنوان" value={about.heroSubtitle} onChange={(v) => patchAbout('heroSubtitle', v)} textarea />
      <Field label="عنوان فلسفه" value={about.philosophy?.title} onChange={(v) => patchPhilosophy('title', v)} />
      <Field label="بند اول" value={about.philosophy?.p1} onChange={(v) => patchPhilosophy('p1', v)} textarea />
      <Field label="بند دوم" value={about.philosophy?.p2} onChange={(v) => patchPhilosophy('p2', v)} textarea />
      {(about.values || []).map((val, index) => (
        <div key={`${val.title}-${index}`} className="grid sm:grid-cols-2 gap-3">
          <Field label={`ارزش ${index + 1}`} value={val.title} onChange={(v) => patchValue(index, 'title', v)} />
          <Field label="شرح" value={val.desc} onChange={(v) => patchValue(index, 'desc', v)} />
        </div>
      ))}
      <Field label="عنوان کرمان" value={about.kermanStory?.title} onChange={(v) => patchKerman('title', v)} />
      <Field label="متن کرمان" value={about.kermanStory?.desc} onChange={(v) => patchKerman('desc', v)} textarea />
    </section>
  );
}

function AlbumPhotos({ photos, onChange, token, onUploaded, onRelease }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const addPhotos = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setError('');
    try {
      const added = [];
      for (const file of files) {
        const url = await uploadFile(file, 'image', token);
        onUploaded?.(url);
        added.push({
          id: newId('photo'),
          title: file.name.replace(/\.[^.]+$/, ''),
          image: url,
          description: '',
        });
      }
      onChange([...photos, ...added]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">عکس‌ها</h3>
        <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#E7E3D8] text-xs cursor-pointer hover:bg-[#F4EFE6]">
          <ImagePlus size={13} />
          {busy ? 'در حال بارگذاری…' : 'افزودن عکس'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={addPhotos}
            disabled={busy}
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        {photos.map((photo, index) => (
          <div key={photo.id} className="border border-[#E7E3D8] rounded-2xl p-3 space-y-2">
            <img src={photo.image} alt="" className="w-full h-32 object-cover rounded-xl bg-[#F4EFE6]" />
            <Field
              label="عنوان"
              value={photo.title}
              onChange={(v) => {
                const next = photos.slice();
                next[index] = { ...photo, title: v };
                onChange(next);
              }}
            />
            <Field
              label="شرح"
              value={photo.description}
              onChange={(v) => {
                const next = photos.slice();
                next[index] = { ...photo, description: v };
                onChange(next);
              }}
              textarea
            />
            <button
              type="button"
              className="text-xs text-red-700"
              onClick={() => {
                onRelease?.(photo.image);
                onChange(photos.filter((_, i) => i !== index));
              }}
            >
              حذف این عکس
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryTab({ draft, setDraft, token, onUploaded, onRelease }) {
  const albums = draft.meetupAlbums || [];

  const patchAlbum = (index, patch) => {
    setDraft((prev) => {
      const list = prev.meetupAlbums.slice();
      list[index] = { ...list[index], ...patch };
      return { ...prev, meetupAlbums: list };
    });
  };

  const addAlbum = () => {
    setDraft((prev) => ({
      ...prev,
      meetupAlbums: [
        {
          id: newId('album'),
          title: 'دورهمی تازه',
          shortTitle: 'دورهمی تازه',
          date: '',
          location: prev.siteConfig?.venue || '',
          coverImage: '',
          description: '',
          photos: [],
        },
        ...prev.meetupAlbums,
      ],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addAlbum}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-navy-800 text-white text-sm"
        >
          <Plus size={15} />
          آلبوم جدید
        </button>
      </div>
      {albums.map((album, index) => (
        <article key={album.id} className="bg-white border border-[#E7E3D8] rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">{album.title || 'بدون عنوان'}</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#F4EFE6]"
                aria-label="بالا"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, meetupAlbums: reorder(prev.meetupAlbums, index, -1) }))
                }
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#F4EFE6]"
                aria-label="پایین"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, meetupAlbums: reorder(prev.meetupAlbums, index, 1) }))
                }
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full text-red-700 hover:bg-red-50"
                aria-label="حذف آلبوم"
                onClick={() => {
                  (album.photos || []).forEach((p) => onRelease(p.image));
                  onRelease(album.coverImage);
                  setDraft((prev) => ({
                    ...prev,
                    meetupAlbums: prev.meetupAlbums.filter((_, i) => i !== index),
                  }));
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="عنوان" value={album.title} onChange={(v) => patchAlbum(index, { title: v })} />
            <Field label="عنوان کوتاه" value={album.shortTitle} onChange={(v) => patchAlbum(index, { shortTitle: v })} />
            <Field label="تاریخ" value={album.date} onChange={(v) => patchAlbum(index, { date: v })} />
            <Field label="مکان" value={album.location} onChange={(v) => patchAlbum(index, { location: v })} />
          </div>
          <Field
            label="شرح آلبوم"
            value={album.description}
            onChange={(v) => patchAlbum(index, { description: v })}
            textarea
          />
          <ImageField
            label="تصویر جلد"
            value={album.coverImage}
            token={token}
            onUploaded={onUploaded}
            onRelease={onRelease}
            onChange={(v) => patchAlbum(index, { coverImage: v })}
          />
          <AlbumPhotos
            photos={album.photos || []}
            token={token}
            onUploaded={onUploaded}
            onRelease={onRelease}
            onChange={(photos) =>
              patchAlbum(index, {
                photos,
                coverImage: album.coverImage || photos[0]?.image || '',
              })
            }
          />
        </article>
      ))}
      {albums.length === 0 && (
        <p className="text-sm text-[#5F6B7A] text-center py-10">هنوز آلبومی نیست.</p>
      )}
    </div>
  );
}

function MusicTab({ draft, setDraft, token, onUploaded, onRelease }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const setTracks = (tracks) => {
    setDraft((prev) => syncMusicUrl({ ...prev, tracks }));
  };

  const uploadAudio = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_AUDIO_BYTES) {
      setError('هر فایل حداکثر ۸ مگابایت است.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const url = await uploadFile(file, 'audio', token);
      onUploaded?.(url);
      setTracks([
        ...draft.tracks,
        {
          id: newId('track'),
          title: file.name.replace(/\.[^.]+$/, ''),
          artist: draft.siteConfig?.name || '',
          album: '',
          description: '',
          url,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const patchTrack = (index, patch) => {
    const tracks = draft.tracks.slice();
    tracks[index] = { ...tracks[index], ...patch };
    setTracks(tracks);
  };

  const replaceAudio = async (index, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_AUDIO_BYTES) {
      setError('هر فایل حداکثر ۸ مگابایت است.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const url = await uploadFile(file, 'audio', token);
      onUploaded?.(url);
      const prevUrl = draft.tracks[index]?.url;
      if (prevUrl?.startsWith('/uploads/') && prevUrl !== url) onRelease(prevUrl);
      patchTrack(index, { url });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-white border border-[#E7E3D8] rounded-3xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">قطعه‌ها و متن پلیر</h2>
          <p className="text-xs text-[#8C9681] mt-1 leading-6">
            برای هر موزیک عنوان، متن زیر نوازنده و مجموعه را تنظیم کنید؛ همین‌ها روی پلیر سایت دیده می‌شوند.
          </p>
        </div>
        <label className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-navy-800 text-white text-sm cursor-pointer shrink-0">
          <Music size={15} />
          {busy ? 'در حال بارگذاری…' : 'افزودن موزیک'}
          <input
            type="file"
            accept="audio/mpeg,audio/ogg,audio/wav,audio/mp4,.mp3,.ogg,.wav,.m4a"
            className="hidden"
            onChange={uploadAudio}
            disabled={busy}
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {draft.tracks.map((track, index) => (
        <div key={track.id} className="border border-[#E7E3D8] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-olive-800">قطعه {index + 1}</p>
            <p className="text-[11px] text-[#8C9681] truncate dir-ltr" title={track.url}>
              {track.url || '/music.mp3'}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="عنوان پلیر"
              value={track.title}
              onChange={(v) => patchTrack(index, { title: v })}
              hint="متن اصلی بالای پلیر"
            />
            <Field
              label="متن زیر / توضیح"
              value={track.description}
              onChange={(v) => patchTrack(index, { description: v })}
              hint="زیر عنوان روی پلیر دیده می‌شود"
            />
            <Field label="نوازنده" value={track.artist} onChange={(v) => patchTrack(index, { artist: v })} />
            <Field label="مجموعه / آلبوم" value={track.album} onChange={(v) => patchTrack(index, { album: v })} />
          </div>
          <div className="rounded-2xl bg-[#FAF7F0] border border-[#E7E3D8] px-4 py-3">
            <p className="text-[11px] text-[#8C9681] mb-1">پیش‌نمایش پلیر</p>
            <p className="text-sm font-bold text-navy-900 truncate">{track.title || 'بدون عنوان'}</p>
            <p className="text-xs text-[#718096] truncate mt-0.5">
              {[track.description, track.artist, track.album].filter(Boolean).join(' • ') || 'متن پلیر خالی است'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <audio controls preload="none" src={track.url} className="h-9 w-full sm:max-w-md" />
            <div className="flex items-center gap-1 shrink-0">
              <label className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-[#E7E3D8] text-xs cursor-pointer hover:bg-[#F4EFE6]">
                تعویض فایل
                <input
                  type="file"
                  accept="audio/mpeg,audio/ogg,audio/wav,audio/mp4,.mp3,.ogg,.wav,.m4a"
                  className="hidden"
                  onChange={(e) => replaceAudio(index, e)}
                  disabled={busy}
                />
              </label>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#F4EFE6]"
                onClick={() => setTracks(reorder(draft.tracks, index, -1))}
                aria-label="بالا"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-[#F4EFE6]"
                onClick={() => setTracks(reorder(draft.tracks, index, 1))}
                aria-label="پایین"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                className="p-2 rounded-full text-red-700 hover:bg-red-50"
                aria-label="حذف موزیک"
                onClick={() => {
                  if (track.url?.startsWith('/uploads/')) onRelease(track.url);
                  const next = draft.tracks.filter((_, i) => i !== index);
                  setTracks(next.length ? next : [defaultTrackFromSite(draft.siteConfig)]);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default function AdminApp() {
  const [gate, setGate] = useState('loading');
  const [token, setTokenState] = useState(getToken());
  const [tab, setTab] = useState('site');
  const [draft, setDraft] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [contentSource, setContentSource] = useState('local');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const pendingUploads = useRef(new Set());

  const markUploaded = useCallback((url) => {
    if (url) pendingUploads.current.add(url);
  }, []);

  const releaseUpload = useCallback(
    (url) => {
      if (!url || !url.startsWith('/uploads/')) return;
      if (pendingUploads.current.has(url)) {
        pendingUploads.current.delete(url);
        deleteUpload(url, token).catch(() => {});
      }
    },
    [token],
  );

  useEffect(() => {
    let alive = true;
    checkSession()
      .then((data) => {
        if (!alive) return;
        if (!data.installed) {
          setToken('');
          setGate('install');
          return;
        }
        setGate(data.authenticated ? 'ready' : 'login');
      })
      .catch(() => {
        if (alive) setGate('offline');
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (gate !== 'ready' || draft) return;
    let alive = true;
    (async () => {
      try {
        const api = await fetchContent();
        if (!alive) return;
        const next = cloneDraft(api);
        setDraft(next);
        setSavedSnapshot(JSON.stringify(next));
        setContentSource('api');
      } catch {
        if (!alive) return;
        const next = cloneDraft(contentSeed);
        setDraft(next);
        setSavedSnapshot(JSON.stringify(next));
        setContentSource('local');
      }
    })();
    return () => {
      alive = false;
    };
  }, [gate, draft]);

  const dirty = useMemo(() => draft && JSON.stringify(draft) !== savedSnapshot, [draft, savedSnapshot]);

  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const patchSite = (key, val) => {
    setDraft((prev) => ({
      ...prev,
      siteConfig: { ...prev.siteConfig, [key]: val },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const payload = syncMusicUrl(draft);
      const previousUrls = collectUploadUrls(JSON.parse(savedSnapshot || '{}'));
      const result = await saveContent(payload, token);
      const next = cloneDraft(result.content || payload);
      const nextUrls = collectUploadUrls(next);
      previousUrls.forEach((url) => {
        if (!nextUrls.has(url)) deleteUpload(url, token).catch(() => {});
      });
      pendingUploads.current.clear();
      setDraft(next);
      setSavedSnapshot(JSON.stringify(next));
      setStatusMsg('ذخیره شد و روی سایت دیده می‌شود.');
    } catch (err) {
      if (err.status === 401) {
        setToken('');
        setTokenState('');
        setGate('login');
        return;
      }
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    setToken('');
    setTokenState('');
    setDraft(null);
    setSavedSnapshot('');
    setGate('login');
  };

  if (gate === 'loading') {
    return (
      <main className="min-h-screen bg-[#FAF7F0] grid place-items-center text-sm text-[#5F6B7A]" dir="rtl">
        در حال باز کردن پنل…
      </main>
    );
  }

  if (gate === 'offline') {
    return (
      <main className="min-h-screen bg-[#FAF7F0] grid place-items-center px-4 text-center" dir="rtl">
        <div className="max-w-md space-y-3">
          <h1 className="text-xl font-bold text-[#222D42]">ارتباط با بخش مدیریت برقرار نشد</h1>
          <p className="text-sm leading-7 text-[#5F6B7A]">
            PHP روی این محیط در دسترس نیست. برای کار محلی، PHP باید کنار دستور اجرای سایت روشن باشد.
          </p>
        </div>
      </main>
    );
  }

  if (gate === 'install' || gate === 'login') {
    return (
      <AuthForm
        mode={gate}
        onDone={(newToken) => {
          setTokenState(newToken);
          setGate('ready');
        }}
      />
    );
  }

  if (!draft) {
    return (
      <main className="min-h-screen bg-[#FAF7F0] grid place-items-center text-sm text-[#5F6B7A]" dir="rtl">
        در حال خواندن محتوا…
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-navy-900" dir="rtl">
      <header className="sticky top-0 z-20 bg-[#FAF7F0]/95 backdrop-blur border-b border-[#E7E3D8]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-olive-700">پنل مدیریت</p>
            <h1 className="text-lg font-extrabold text-[#222D42]">دَمی برای زیستن</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium text-navy-800 hover:bg-white"
            >
              دیدن سایت
              <ExternalLink size={13} />
            </a>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs text-[#5F6B7A] hover:bg-white"
            >
              <LogOut size={14} />
              خروج
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-olive-700 text-white text-sm font-semibold disabled:opacity-40"
            >
              <Save size={15} />
              {saving ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                tab === item.id
                  ? 'bg-navy-800 text-white'
                  : 'bg-white text-navy-800 border border-[#E7E3D8]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {contentSource !== 'api' && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            محتوای زنده از هاست خوانده نشد و فرم با متن‌های داخل کد پر شده است. ذخیره، همان را روی هاست می‌نویسد.
          </p>
        )}
        {statusMsg && (
          <p className="text-sm text-olive-800 bg-olive-50 border border-olive-200 rounded-2xl px-4 py-3">
            {statusMsg}
          </p>
        )}
        {errorMsg && (
          <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{errorMsg}</p>
        )}

        {tab === 'site' && (
          <section className="bg-white border border-[#E7E3D8] rounded-3xl p-5 sm:p-6 grid sm:grid-cols-2 gap-4">
            <Field label="نام" value={draft.siteConfig.name} onChange={(v) => patchSite('name', v)} />
            <Field label="شعار" value={draft.siteConfig.slogan} onChange={(v) => patchSite('slogan', v)} />
            <Field label="تلفن" value={draft.siteConfig.phone} onChange={(v) => patchSite('phone', v)} />
            <Field
              label="اینستاگرام"
              value={draft.siteConfig.instagramUrl}
              onChange={(v) => patchSite('instagramUrl', v)}
              dir="ltr"
              hint="با https شروع شود."
            />
            <div className="sm:col-span-2">
              <Field
                label="آدرس موزیک پس‌زمینه"
                value={draft.siteConfig.musicUrl}
                onChange={(v) => patchSite('musicUrl', v)}
                dir="ltr"
                hint="با تغییر لیست موزیک، به‌طور خودکار به اولین قطعه تنظیم می‌شود."
              />
            </div>
            <ImageField
              label="تصویر بالای صفحه"
              value={draft.siteConfig.heroImage}
              token={token}
              onUploaded={markUploaded}
              onRelease={releaseUpload}
              onChange={(v) => patchSite('heroImage', v)}
            />
            <Field label="برچسب داستان" value={draft.siteConfig.storyBadge} onChange={(v) => patchSite('storyBadge', v)} />
            <Field label="عنوان داستان" value={draft.siteConfig.storyTitle} onChange={(v) => patchSite('storyTitle', v)} />
            <div className="sm:col-span-2">
              <Field
                label="متن داستان"
                value={draft.siteConfig.storyText}
                onChange={(v) => patchSite('storyText', v)}
                textarea
              />
            </div>
            <Field
              label="متن دکمه داستان"
              value={draft.siteConfig.storyButtonLabel}
              onChange={(v) => patchSite('storyButtonLabel', v)}
            />
            <ImageField
              label="تصویر بخش داستان"
              value={draft.siteConfig.storyImage}
              token={token}
              onUploaded={markUploaded}
              onRelease={releaseUpload}
              onChange={(v) => patchSite('storyImage', v)}
            />
          </section>
        )}

        {tab === 'event' && <EventTab draft={draft} setDraft={setDraft} />}
        {tab === 'story' && <AboutTab draft={draft} setDraft={setDraft} />}
        {tab === 'gallery' && (
          <GalleryTab
            draft={draft}
            setDraft={setDraft}
            token={token}
            onUploaded={markUploaded}
            onRelease={releaseUpload}
          />
        )}
        {tab === 'music' && (
          <MusicTab
            draft={draft}
            setDraft={setDraft}
            token={token}
            onUploaded={markUploaded}
            onRelease={releaseUpload}
          />
        )}
      </main>
    </div>
  );
}