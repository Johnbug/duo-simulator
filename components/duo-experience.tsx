'use client';
import { flushSync } from 'react-dom';
import { track } from '@vercel/analytics';
import { usePathname, useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  ArrowUpRight,
  BatteryFull,
  Wifi,
  Signal,
  RotateCcw,
  Smartphone,
  Tablet,
  Laptop,
  Tent,
  Home as HomeIcon,
  PanelsTopLeft,
  Image as ImageIcon,
  Camera,
  Music2,
  CalendarDays,
  Settings,
  Compass,
  NotebookPen,
  Mail,
  MessageCircle,
  Phone,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Check,
  Sun,
  Info,
  MoveHorizontal,
} from 'lucide-react';
import { NotesApp, SafariApp } from '@/components/phone-apps';
import { DuoModel } from '@/components/duo-model';
import { GithubLink } from '@/components/github-link.mjs';
import { FoldGesture } from '@/lib/fold-gesture.mjs';
import { ShowcaseMotion } from '@/lib/showcase-motion.mjs';
import {
  behaviorEvent,
  type BehaviorEventName,
} from '@/lib/analytics-events.mjs';
import { localePath, type Locale } from '@/lib/i18n.mjs';
import { getTranslations } from '@/lib/translations';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type AppId =
  | 'home'
  | 'photos'
  | 'notes'
  | 'safari'
  | 'music'
  | 'calendar'
  | 'settings'
  | 'camera'
  | 'mail'
  | 'messages'
  | 'phone';
type Pose = 'open' | 'closed' | 'laptop' | 'tent';
const apps = [
  { id: 'photos', name: 'photos', icon: ImageIcon, color: 'photos-icon' },
  { id: 'camera', name: 'camera', icon: Camera, color: 'camera-icon' },
  {
    id: 'calendar',
    name: 'calendar',
    icon: CalendarDays,
    color: 'calendar-icon',
  },
  { id: 'notes', name: 'notes', icon: NotebookPen, color: 'notes-icon' },
  { id: 'music', name: 'music', icon: Music2, color: 'music-icon' },
  { id: 'safari', name: null, icon: Compass, color: 'safari-icon' },
  { id: 'mail', name: 'mail', icon: Mail, color: 'mail-icon' },
  { id: 'settings', name: 'settings', icon: Settings, color: 'settings-icon' },
] as const;
const poses = [
  { id: 'open', icon: Tablet, angle: 180 },
  { id: 'closed', icon: Smartphone, angle: 0 },
  { id: 'laptop', icon: Laptop, angle: 100 },
  { id: 'tent', icon: Tent, angle: 70 },
] as const;
const source = 'https://www.apple.com.cn/iphone-duo/';
const photos = [
  '/assets/seated.jpg',
  '/assets/display.webp',
  '/assets/night-sky.webp',
];
const poseCopy = {
  open: ['openTitle', 'openDetail'],
  closed: ['closedTitle', 'closedDetail'],
  laptop: ['laptopTitle', 'laptopDetail'],
  tent: ['tentTitle', 'tentDetail'],
} as const;

export default function DuoExperience({ locale }: { locale: Locale }) {
  const copy = getTranslations(locale);
  const router = useRouter();
  const pathname = usePathname();
  const record = (
    name: BehaviorEventName,
    value: string,
    context?: string | number | boolean,
  ) => {
    const event = behaviorEvent(name, locale, value, context);
    track(event.name, event.properties);
  };
  const [angle, setAngle] = useState(135);
  const [pose, setPose] = useState<Pose>('open');
  const [finish, setFinish] = useState('white');
  const [app, setApp] = useState<AppId>('home');
  const [view, setView] = useState<'model' | 'apps'>('model');
  const [dragging, setDragging] = useState(false);
  const [gesture, setGesture] = useState<'fold' | 'orbit'>('orbit');
  const [autoMotion, setAutoMotion] = useState(true);
  const motionState = useRef({ angle, yaw: -0.35 });
  const motionRunner = useRef<ShowcaseMotion | null>(null);
  const [motionRevision, setMotionRevision] = useState(0);
  const [yaw, setYaw] = useState(-0.35);
  const [pitch, setPitch] = useState(-0.12);
  const foldGesture = useRef(new FoldGesture());
  const orbitGesture = useRef<{
    pointerId: number;
    x: number;
    y: number;
    yaw: number;
    pitch: number;
  } | null>(null);
  const [split, setSplit] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [info, setInfo] = useState(false);
  const [note, setNote] = useState(copy.defaultNote);
  const [checked, setChecked] = useState([false, false, false]);
  const [selectedDay, setSelectedDay] = useState(10);
  const [dialed, setDialed] = useState('');
  const [photo, setPhoto] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [clockStyle, setClockStyle] = useState(false);
  const [now, setNow] = useState('9:41');
  const [captured, setCaptured] = useState(false);
  motionState.current = { angle, yaw };
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (preference.matches) setAutoMotion(false);
    };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!autoMotion || dragging || view !== 'model' || info) return;
    const saved = motionRunner.current;
    const state = motionState.current;
    const motion =
      saved &&
      saved.mode === gesture &&
      Math.round(saved.angle) === state.angle &&
      Math.abs(saved.yaw - state.yaw) < 1e-8
        ? saved
        : new ShowcaseMotion(gesture, state.angle, state.yaw);
    motionRunner.current = motion;
    let frame = 0;
    let previous = 0;
    let accumulated = 0;
    const animate = (time: number) => {
      if (document.hidden) {
        previous = 0;
        accumulated = 0;
      } else {
        if (previous) accumulated += Math.min((time - previous) / 1000, 0.1);
        previous = time;
        // Feed targets at 30 Hz; the existing model renderer interpolates each frame.
        if (accumulated >= 1 / 30) {
          const next = motion.step(accumulated);
          accumulated = 0;
          if (gesture === 'orbit') setYaw(next.yaw);
          else setAngle(Math.round(next.angle));
        }
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [autoMotion, dragging, view, gesture, info, motionRevision]);
  function selectShowcase(mode: 'fold' | 'orbit') {
    record('experience_mode_changed', mode);
    motionRunner.current = null;
    setMotionRevision((revision) => revision + 1);
    setGesture(mode);
    setAutoMotion(true);
    if (mode === 'fold') {
      setPose('open');
      setPortrait(false);
      setYaw(-0.35);
      setPitch(-0.12);
    }
  }

  useEffect(() => {
    const update = () =>
      setNow(
        new Date().toLocaleTimeString(locale === 'zh' ? 'zh-CN' : locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      );
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [locale]);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: object,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool = {
      name: 'configure_duo_experience',
      title: 'Configure the iPhone Duo experience',
      description:
        'Set the visible device fold position, finish, and split view.',
      inputSchema: {
        type: 'object',
        properties: {
          pose: { type: 'string', enum: ['open', 'closed', 'laptop', 'tent'] },
          finish: { type: 'string', enum: ['night', 'white'] },
          split: { type: 'boolean' },
        },
        required: ['pose', 'finish', 'split'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        if (!input || typeof input !== 'object')
          throw new Error('Expected configuration object');
        const value = input as Record<string, unknown>;
        if (
          !poses.some((p) => p.id === value.pose) ||
          !['night', 'white'].includes(String(value.finish)) ||
          typeof value.split !== 'boolean' ||
          Object.keys(value).some(
            (k) => !['pose', 'finish', 'split'].includes(k),
          )
        )
          throw new Error('Invalid configuration');
        if (value.split && value.pose !== 'open')
          throw new Error('Split view requires an open device');
        flushSync(() => {
          const nextPose = value.pose as Pose;
          setAutoMotion(false);
          setPose(nextPose);
          setAngle(poses.find((item) => item.id === nextPose)!.angle);
          setPortrait(false);
          setYaw(nextPose === 'tent' ? 2.65 : -0.35);
          setPitch(nextPose === 'laptop' ? -0.45 : -0.12);
          setFinish(value.finish as string);
          setSplit(value.split as boolean);
          setView(value.split ? 'apps' : 'model');
        });
        return { pose: value.pose, finish: value.finish, split: value.split };
      },
    };
    try {
      Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  function choosePose(p: Pose) {
    record('pose_selected', p);
    setAutoMotion(false);
    setPose(p);
    setAngle(poses.find((x) => x.id === p)!.angle);
    setPortrait(false);
    if (p !== 'open') {
      setSplit(false);
      setView('model');
    }
    setYaw(p === 'tent' ? 2.65 : -0.35);
    setPitch(p === 'laptop' ? -0.45 : -0.12);
  }
  function applyAngle(a: number) {
    setAutoMotion(false);
    setAngle(a);
    setPose(a === 0 ? 'closed' : 'open');
    setPortrait(false);
    if (a < 175) setSplit(false);
  }
  function startDrag(e: ReactPointerEvent<HTMLElement>) {
    const target = e.target as HTMLElement;
    if (e.button !== 0 || target.closest('button:not(.fold-grip),a,[role=tab]'))
      return;
    if (!target.closest('.model-surface canvas,.fold-grip')) return;
    if (foldGesture.current.session || orbitGesture.current) return;
    const width =
      e.currentTarget.querySelector('.model-surface')?.clientWidth ||
      e.currentTarget.clientWidth;
    if (
      gesture === 'orbit' &&
      view === 'model' &&
      !target.closest('.fold-grip')
    )
      orbitGesture.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        yaw,
        pitch,
      };
    else {
      if (!foldGesture.current.begin(e.pointerId, e.clientX, angle, width))
        return;
      setView('model');
    }
    setAutoMotion(false);
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }
  function moveDrag(e: ReactPointerEvent<HTMLElement>) {
    const orbit = orbitGesture.current;
    if (orbit?.pointerId === e.pointerId) {
      setYaw(orbit.yaw + (e.clientX - orbit.x) * 0.008);
      setPitch(
        Math.max(
          -1.2,
          Math.min(1.2, orbit.pitch + (e.clientY - orbit.y) * 0.008),
        ),
      );
      return;
    }
    const a = foldGesture.current.move(e.pointerId, e.clientX);
    if (a !== null) applyAngle(a);
  }
  function endDrag(e: ReactPointerEvent<HTMLElement>) {
    const a = foldGesture.current.end(e.pointerId);
    const orbit = orbitGesture.current?.pointerId === e.pointerId;
    if (a === null && !orbit) return;
    if (orbit) orbitGesture.current = null;
    record(
      'model_dragged',
      orbit ? 'orbit' : 'fold',
      orbit ? Math.round(yaw * 100) / 100 : (a ?? angle),
    );
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function enterApps() {
    record('experience_mode_changed', 'apps');
    setView('apps');
    setAngle(180);
    setPose('open');
    setPortrait(false);
  }
  function openApp(id: AppId) {
    record('app_opened', id);
    setApp(id);
    setPhoto(null);
    setCaptured(false);
  }
  function reset() {
    motionRunner.current = null;
    setMotionRevision((revision) => revision + 1);
    setGesture('orbit');
    setAutoMotion(true);
    setAngle(135);
    setPose('open');
    setFinish('white');
    setView('model');
    setYaw(-0.35);
    setPitch(-0.12);
    setApp('home');
    setSplit(false);
    setPortrait(false);
    setBrightness(100);
    setPhoto(null);
    setPlaying(false);
    setDialed('');
    setSelectedDay(10);
  }
  const closed = angle < 15;
  const folding = angle >= 15 && angle < 175 && pose !== 'tent';
  const home = () => (
    <div className="home-screen">
      <div className="widgets">
        <div className="weather-widget">
          <span>
            {copy.shanghai} <ArrowUpRight size={12} />
          </span>
          <strong>26°</strong>
          <span>
            <Sun size={17} /> {copy.sunny}
          </span>
          <small>{copy.weatherRange}</small>
        </div>
        <div className="date-widget">
          <span>{copy.thursday}</span>
          <strong>10</strong>
          <small>{copy.september2026}</small>
          <div className="event">{copy.calendarEvent}</div>
        </div>
      </div>
      <div className="app-grid">
        {apps.map((a) => (
          <button key={a.id} onClick={() => openApp(a.id)} className="app-item">
            <span className={`app-icon ${a.color}`}>
              <a.icon strokeWidth={1.7} />
            </span>
            <span>{a.name ? copy[a.name] : 'Safari'}</span>
          </button>
        ))}
      </div>
      <div className="page-dots">
        <b />
        <i />
      </div>
      <div className="dock">
        {[
          { id: 'phone', icon: Phone, color: 'phone-icon', name: copy.phone },
          { id: 'safari', icon: Compass, color: 'safari-icon', name: 'Safari' },
          {
            id: 'messages',
            icon: MessageCircle,
            color: 'phone-icon',
            name: copy.messages,
          },
          { id: 'music', icon: Music2, color: 'music-icon', name: copy.music },
        ].map((a) => (
          <button
            key={a.id}
            className={`app-icon ${a.color}`}
            aria-label={a.name}
            onClick={() => openApp(a.id as AppId)}
          >
            <a.icon strokeWidth={1.8} />
          </button>
        ))}
      </div>
    </div>
  );
  function appView(id: AppId) {
    if (id === 'home') return home();
    if (id === 'photos')
      return (
        <div className="photos-app">
          <h3>
            {copy.photos} <span>{copy.gallery}</span>
          </h3>
          {photo !== null ? (
            <button
              className="photo-focus"
              onClick={() => setPhoto(null)}
              aria-label={copy.backGallery}
            >
              <img src={photos[photo]} alt={copy.appleProductImage} />
              <span>
                <ChevronLeft size={16} />
                {copy.allPhotos}
              </span>
            </button>
          ) : (
            <>
              <p>{copy.appleGallery}</p>
              <div className="photo-grid">
                {photos.map((p, i) => (
                  <button key={p} onClick={() => setPhoto(i)}>
                    <img
                      src={p}
                      alt={[copy.seatedAlt, copy.displayAlt, copy.nightAlt][i]}
                    />
                  </button>
                ))}
              </div>
              <small>{copy.photoCount}</small>
            </>
          )}
        </div>
      );
    if (id === 'notes')
      return (
        <NotesApp
          locale={locale}
          note={note}
          setNote={setNote}
          checked={checked}
          setChecked={setChecked}
          onHome={() => {
            openApp('home');
            setSplit(false);
          }}
        />
      );
    if (id === 'safari')
      return (
        <SafariApp
          locale={locale}
          finish={finish}
          onOfficialLink={(location) =>
            record('official_link_clicked', location)
          }
          onHome={() => {
            openApp('home');
            setSplit(false);
          }}
        />
      );
    if (id === 'music')
      return (
        <div className="music-app">
          <div className="album">
            <Music2 size={72} />
            <span>
              ROOM TO
              <br />
              BREATHE
            </span>
          </div>
          <div className="track">
            <h3>{copy.musicTitle}</h3>
            <p>{copy.playbackDemo}</p>
          </div>
          <div className="music-progress">
            <i style={{ width: playing ? '48%' : '20%' }} />
          </div>
          <div className="playback">
            <button
              aria-label={copy.resetPlayback}
              onClick={() => setPlaying(false)}
            >
              <ChevronLeft />
            </button>
            <button
              aria-label={playing ? copy.pause : copy.playDemo}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <Pause fill="currentColor" />
              ) : (
                <Play fill="currentColor" />
              )}
            </button>
            <button
              aria-label={copy.resetPlayback}
              onClick={() => setPlaying(false)}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      );
    if (id === 'calendar')
      return (
        <div className="calendar-app">
          <span>2026</span>
          <h3>{copy.september}</h3>
          <div className="calendar-grid">
            {copy.weekdays.split('').map((d) => (
              <small key={d}>{d}</small>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <button
                key={i}
                className={i === selectedDay ? 'today' : ''}
                disabled={i === 0 || i > 30}
                onClick={() => setSelectedDay(i)}
              >
                {i > 0 && i < 31 ? i : ''}
              </button>
            ))}
          </div>
          <p className="calendar-event">
            {locale === 'en'
              ? `September ${selectedDay} · `
              : locale === 'ja'
                ? `9月${selectedDay}日　`
                : `9月${selectedDay}日　`}
            {copy.vacation}
          </p>
        </div>
      );
    if (id === 'settings')
      return (
        <div className="settings-app">
          <h3>{copy.settings}</h3>
          <div className="settings-profile">
            <span>D</span>
            <div>
              <b>{copy.yourDuo}</b>
              <p>{copy.webDevice}</p>
            </div>
          </div>
          <div className="setting-row">
            <span>{copy.brightness}</span>
            <b>{brightness}%</b>
          </div>
          <Slider
            aria-label={copy.brightness}
            value={[brightness]}
            min={40}
            max={100}
            onValueChange={(v) => setBrightness(Array.isArray(v) ? v[0] : v)}
          />
          <div className="setting-row">
            <span>{copy.screen}</span>
            <span>
              {closed
                ? `5.4 ${copy.inches.trim()} ${copy.outerDisplay}`
                : `7.6 ${copy.inches.trim()} ${copy.innerDisplay}`}
            </span>
          </div>
          <div className="setting-row">
            <span>{copy.chip}</span>
            <span>A20 Pro</span>
          </div>
          <div className="setting-row">
            <span>{copy.systemReference}</span>
            <span>iOS 27</span>
          </div>
        </div>
      );
    if (id === 'camera')
      return (
        <div className="camera-app">
          <div className="camera-preview">
            <img src="/assets/seated.jpg" alt={copy.cameraAlt} />
            {captured && (
              <span className="capture-feedback">
                <Check size={16} /> {copy.captured}
              </span>
            )}
          </div>
          <p>{copy.cameraModes}</p>
          <button
            className="shutter"
            aria-label={copy.capture}
            onClick={() => setCaptured(!captured)}
          />
          <small>{copy.cameraNote}</small>
        </div>
      );
    if (id === 'mail')
      return (
        <div className="mail-app">
          <h3>{copy.inbox}</h3>
          <p>{copy.demoMail}</p>
          <article>
            <b>{copy.mailTitle}</b>
            <small>{copy.fromStudio}</small>
            <p>{copy.mailBody}</p>
          </article>
        </div>
      );
    if (id === 'messages')
      return (
        <div className="messages-app">
          <h3>{copy.messages}</h3>
          <p>{copy.demoChat}</p>
          <div className="bubble">{copy.message1}</div>
          <div className="bubble mine">{copy.message2}</div>
          <div className="bubble">{copy.message3}</div>
          <small>{copy.demoOnly}</small>
        </div>
      );
    return (
      <div className="phone-app">
        <Phone size={40} />
        <h3>{copy.phone}</h3>
        <p>{dialed || copy.exploreBrowser}</p>
        <small>{copy.noCalls}</small>
        <div className="dialpad">
          {'123456789*0#'.split('').map((n) => (
            <button
              key={n}
              onClick={() => setDialed((d) => (d.length < 18 ? d + n : d))}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }
  const content = (decorative = false) => (
    <div
      className={`display-content ${app === 'home' && !split ? 'wallpaper' : ''}`}
      style={{ filter: `brightness(${brightness / 100})` }}
    >
      <div className="status-bar">
        <b>{now}</b>
        {closed && <div className="dynamic-island" />}
        <span>
          <Signal size={13} />
          <Wifi size={13} />
          <BatteryFull size={18} />
        </span>
      </div>
      {split ? (
        <div className="split-apps">
          <div>{appView('safari')}</div>
          <div>{appView('notes')}</div>
          <span className="split-handle" />
        </div>
      ) : (
        <div className="app-content">{appView(app)}</div>
      )}
      <button
        className="home-indicator"
        onClick={() => {
          openApp('home');
          setSplit(false);
        }}
        aria-label={copy.backHome}
        tabIndex={decorative ? -1 : 0}
      />
    </div>
  );
  return (
    <div className="experience">
      <header className="site-header">
        <a className="wordmark" href={`/${locale}`}>
          duo<span>{copy.studio}</span>
        </a>
        <nav>
          <a className="nav-active" href="#experience">
            {copy.interactive}
          </a>
          <button
            onClick={() => {
              record('info_opened', 'header');
              setInfo(true);
            }}
          >
            {copy.designSpecs}
          </button>
        </nav>
        <div className="header-actions">
          <label className="locale-picker">
            <span className="sr-only">{copy.language}</span>
            <select
              value={locale}
              aria-label={copy.language}
              onChange={(event) => {
                const nextLocale = event.target.value as Locale;
                record('locale_changed', nextLocale);
                router.push(localePath(pathname, nextLocale));
              }}
            >
              <option value="zh">{copy.chinese}</option>
              <option value="en">{copy.english}</option>
              <option value="ja">{copy.japanese}</option>
            </select>
          </label>
          <GithubLink onClick={() => record('github_link_clicked', 'header')} />
          <a
            className="official-link"
            href={source}
            target="_blank"
            rel="noreferrer"
            onClick={() => record('official_link_clicked', 'header')}
          >
            {copy.appleSite} <ArrowUpRight size={14} />
          </a>
        </div>
      </header>
      <main id="experience">
        <div className="intro">
          <div>
            <div className="eyebrow">
              <span /> THE DUO EXPERIENCE
            </div>
            <h1>
              iPhone Duo<span className="intro-divider"> / </span>
              <span className="intro-light">{copy.unfoldIt}</span>
            </h1>
            <p>{copy.intro}</p>
          </div>
          <span className="simulation-label">
            <Info size={14} /> {copy.simulation}
          </span>
        </div>
        <div className="workbench">
          <section
            className={`stage ${view === 'model' ? 'model-stage' : 'app-stage'} ${dragging ? 'is-dragging' : ''}`}
            aria-label={copy.device}
            onPointerDownCapture={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={endDrag}
          >
            <div className="stage-top">
              <span>
                <i />
                {view === 'model'
                  ? copy.model
                  : closed
                    ? copy.coverExperience
                    : copy.appExperience}
              </span>
              <span>{closed ? '5.4' : '7.6'}″ SUPER RETINA XDR</span>
            </div>
            <Tabs
              className="experience-mode"
              value={view}
              onValueChange={(v) => {
                if (v === 'apps') enterApps();
                else {
                  record('experience_mode_changed', 'model');
                  setView('model');
                }
              }}
            >
              <TabsList aria-label={copy.experienceMode}>
                <TabsTrigger value="model">{copy.realDevice}</TabsTrigger>
                <TabsTrigger value="apps">{copy.useApps}</TabsTrigger>
              </TabsList>
            </Tabs>
            <div
              className={`model-container ${view !== 'model' ? 'is-hidden' : ''}`}
            >
              <DuoModel
                angle={angle}
                finish={finish}
                pose={pose}
                portrait={portrait}
                dragging={dragging}
                yaw={yaw}
                pitch={pitch}
                visible={view === 'model'}
                onFallback={enterApps}
                locale={locale}
              />
              <div className="model-caption" aria-hidden="true">
                <span>
                  {dragging
                    ? gesture === 'fold'
                      ? copy.draggingFold
                      : copy.draggingOrbit
                    : autoMotion
                      ? gesture === 'fold'
                        ? copy.autoFold
                        : copy.autoOrbit
                      : gesture === 'fold'
                        ? copy.holdFold
                        : copy.holdOrbit}
                </span>
                <strong>
                  {angle}
                  <small>°</small>
                </strong>
                <i>
                  {gesture === 'fold'
                    ? copy.foldDirection
                    : copy.orbitDirection}
                </i>
              </div>
            </div>
            <div
              className={`device-space ${portrait ? 'portrait-space' : ''} ${view !== 'apps' ? 'is-hidden' : ''}`}
            >
              <button
                className="fold-grip"
                aria-label={copy.foldGrip}
                onKeyDown={(e) => {
                  if (
                    ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
                  ) {
                    e.preventDefault();
                    setView('model');
                    applyAngle(
                      e.key === 'Home'
                        ? 0
                        : e.key === 'End'
                          ? 180
                          : Math.max(
                              0,
                              Math.min(
                                180,
                                angle + (e.key === 'ArrowRight' ? 5 : -5),
                              ),
                            ),
                    );
                  }
                }}
              >
                <span />
                <span />
                <span />
              </button>
              <div
                className={`device ${finish === 'white' ? 'white-device' : ''} ${closed ? 'closed-device' : ''} ${portrait ? 'portrait-device' : ''} ${pose === 'tent' ? 'tent-device' : ''} ${folding ? 'folding-device' : ''}`}
                style={{ '--fold': `${180 - angle}deg` } as CSSProperties}
              >
                {pose === 'tent' ? (
                  <button
                    className={`standby ${clockStyle ? 'standby-alt' : ''}`}
                    onClick={() => setClockStyle(!clockStyle)}
                  >
                    <span>{copy.standbyDate}</span>
                    <strong>{now}</strong>
                    <span>
                      <Sun size={22} /> {copy.standbyWeather}
                    </span>
                    <small>{copy.tapClock}</small>
                  </button>
                ) : folding ? (
                  <div
                    className="folding-panels"
                    aria-label={`${copy.foldAngle} ${angle}°`}
                  >
                    <div className="fold-left" inert>
                      <div>{content(true)}</div>
                    </div>
                    <div className="fold-right" inert>
                      <div>{content(true)}</div>
                    </div>
                  </div>
                ) : (
                  content()
                )}
              </div>
            </div>
            {view === 'model' ? (
              <div className="model-toolbar">
                <button
                  className={gesture === 'orbit' ? 'active' : ''}
                  onClick={() => selectShowcase('orbit')}
                  aria-pressed={gesture === 'orbit'}
                >
                  <RotateCcw size={16} />
                  {copy.rotate}
                </button>
                <button
                  className={gesture === 'fold' ? 'active' : ''}
                  onClick={() => selectShowcase('fold')}
                  aria-pressed={gesture === 'fold'}
                >
                  <MoveHorizontal size={16} />
                  {copy.fold}
                </button>
                <span />
                <button
                  onClick={() => {
                    setAutoMotion(false);
                    setYaw(-0.35);
                    setPitch(-0.12);
                  }}
                >
                  {copy.front}
                </button>
                <button
                  onClick={() => {
                    setAutoMotion(false);
                    setYaw(Math.PI - 0.35);
                    setPitch(-0.12);
                  }}
                >
                  {copy.back}
                </button>
                <button
                  onClick={() => {
                    record(
                      'auto_motion_toggled',
                      autoMotion ? 'paused' : 'playing',
                    );
                    setAutoMotion((running) => !running);
                  }}
                  aria-label={autoMotion ? copy.pauseAuto : copy.resumeAuto}
                  aria-pressed={autoMotion}
                >
                  {autoMotion ? <Pause size={15} /> : <Play size={15} />}
                  {autoMotion ? copy.pause : copy.play}
                </button>
                <button onClick={reset} aria-label={copy.resetExperience}>
                  <RotateCcw size={15} />
                </button>
              </div>
            ) : (
              <div className="device-toolbar">
                <button
                  onClick={() => {
                    openApp('home');
                    setSplit(false);
                  }}
                  aria-label={copy.backHome}
                >
                  <HomeIcon size={17} />
                  <small>{copy.home}</small>
                </button>
                <span />
                <button
                  className={portrait ? 'selected' : ''}
                  disabled={!closed && angle < 175}
                  onClick={() => setPortrait(!portrait)}
                  aria-label={copy.rotateScreen}
                >
                  <RotateCcw size={17} />
                  <small>{copy.rotate}</small>
                </button>
                <button
                  className={split ? 'selected' : ''}
                  disabled={angle < 175}
                  onClick={() => {
                    record('split_toggled', split ? 'off' : 'on');
                    setSplit(!split);
                    setPortrait(false);
                  }}
                  aria-label={copy.splitExperience}
                >
                  <PanelsTopLeft size={18} />
                  <small>{copy.split}</small>
                </button>
                <span />
                <button
                  onClick={() => {
                    record(
                      'auto_motion_toggled',
                      autoMotion ? 'paused' : 'playing',
                    );
                    setAutoMotion((running) => !running);
                  }}
                  aria-label={autoMotion ? copy.pauseAuto : copy.resumeAuto}
                  aria-pressed={autoMotion}
                >
                  {autoMotion ? <Pause size={15} /> : <Play size={15} />}
                  {autoMotion ? copy.pause : copy.play}
                </button>
                <button onClick={reset} aria-label={copy.resetExperience}>
                  <RotateCcw size={16} />
                  <small>{copy.reset}</small>
                </button>
              </div>
            )}
            <div className="stage-caption">
              <MoveHorizontal size={14} />
              {view === 'model' ? copy.modelHint : copy.appHint}
            </div>
          </section>
          <aside className="controls">
            <section>
              <div className="control-heading">
                <h2>{copy.foldPoses}</h2>
              </div>
              <div className="pose-grid">
                {poses.map((p) => (
                  <button
                    key={p.id}
                    className={pose === p.id ? 'active' : ''}
                    onClick={() => choosePose(p.id)}
                    aria-pressed={pose === p.id}
                  >
                    <p.icon strokeWidth={1.5} />
                    <span>{copy[p.id]}</span>
                  </button>
                ))}
              </div>
              <div className="angle-heading">
                <label id="angle-label">{copy.foldAngle}</label>
                <output>{angle}°</output>
              </div>
              <Slider
                aria-labelledby="angle-label"
                value={[angle]}
                min={0}
                max={180}
                onValueChange={(v) => {
                  setView('model');
                  applyAngle(Array.isArray(v) ? v[0] : v);
                }}
              />
              <div className="range-labels">
                <span>{copy.closed0}</span>
                <span>{copy.open180}</span>
              </div>
            </section>
            <section>
              <div className="control-heading">
                <h2>{copy.bodyColor}</h2>
              </div>
              <div className="finish-picker">
                <button
                  aria-label={copy.night}
                  aria-pressed={finish === 'night'}
                  className={`swatch night ${finish === 'night' ? 'active' : ''}`}
                  onClick={() => {
                    record('finish_selected', 'night');
                    setFinish('night');
                  }}
                >
                  {finish === 'night' && <Check size={17} />}
                </button>
                <button
                  aria-label={copy.white}
                  aria-pressed={finish === 'white'}
                  className={`swatch white ${finish === 'white' ? 'active' : ''}`}
                  onClick={() => {
                    record('finish_selected', 'white');
                    setFinish('white');
                  }}
                >
                  {finish === 'white' && <Check size={17} />}
                </button>
                <span>
                  {finish === 'night' ? copy.night : copy.white}
                  <small>{copy.titanium}</small>
                </span>
              </div>
            </section>
            <section className="scenario">
              <div className="control-heading">
                <h2>{copy.appsHeading}</h2>
              </div>
              <button
                className={split ? 'split-button is-active' : 'split-button'}
                onClick={() => {
                  enterApps();
                  record('split_toggled', split ? 'off' : 'on');
                  setSplit(!split);
                }}
              >
                <PanelsTopLeft size={20} />
                <span>
                  {copy.browseRecord}
                  <small>{copy.safariNotes}</small>
                </span>
                <ArrowUpRight size={18} />
              </button>
              <p>{copy.scenarioHint}</p>
            </section>
            <div className="context-card">
              <button
                className="official-thumbnail"
                onClick={() => {
                  record('info_opened', 'image');
                  setInfo(true);
                }}
                aria-label={copy.viewAppleImage}
              >
                <img
                  src={
                    pose === 'laptop'
                      ? '/assets/seated.jpg'
                      : pose === 'tent'
                        ? '/assets/standing.webp'
                        : finish === 'night'
                          ? '/assets/night-sky.webp'
                          : '/assets/star-white.webp'
                  }
                  alt={copy.appleProductImage}
                />
                <span>
                  {copy.appleImage} <ArrowUpRight size={10} />
                </span>
              </button>
              <h3>{copy[poseCopy[pose][0]]}</h3>
              <p>{copy[poseCopy[pose][1]]}</p>
            </div>
          </aside>
        </div>
        <section className="details-strip">
          <div>
            <b>
              {closed ? '5.4' : '7.6'}
              <span>{copy.inches}</span>
            </b>
            <p>
              {closed ? copy.outerDisplay : copy.innerDisplay}
              {copy.displaySuffix}
            </p>
          </div>
          <div>
            <b>
              {closed ? '11.3' : '5.2'}
              <span>{copy.millimeters}</span>
            </b>
            <p>
              {closed ? copy.closed : copy.open} {copy.thickness}
            </p>
          </div>
          <div>
            <b>A20 Pro</b>
            <p>{copy.chipCooling}</p>
          </div>
          <button
            onClick={() => {
              record('info_opened', 'details');
              setInfo(true);
            }}
          >
            {copy.learnDesign} <ArrowUpRight size={17} />
          </button>
        </section>
        <footer>
          <span>{copy.footerNote}</span>
          <a
            href={source}
            target="_blank"
            rel="noreferrer"
            onClick={() => record('official_link_clicked', 'footer')}
          >
            {copy.source} <ArrowUpRight size={12} />
          </a>
        </footer>
      </main>
      <Dialog open={info} onOpenChange={setInfo}>
        <DialogContent className="spec-dialog">
          <DialogTitle>{copy.dialogTitle}</DialogTitle>
          <DialogDescription>{copy.dialogDescription}</DialogDescription>
          <Tabs defaultValue="design">
            <TabsList>
              <TabsTrigger value="design">{copy.appearance}</TabsTrigger>
              <TabsTrigger value="specs">{copy.technicalSpecs}</TabsTrigger>
            </TabsList>
            <TabsContent value="design">
              <img
                className="official-product"
                src={
                  finish === 'night'
                    ? '/assets/night-sky.webp'
                    : '/assets/star-white.webp'
                }
                alt={`Apple iPhone Duo ${finish === 'night' ? copy.night : copy.white}`}
              />
              <p className="image-credit">
                {copy.appleProductImage} ·{' '}
                {finish === 'night' ? copy.night : copy.white}
              </p>
            </TabsContent>
            <TabsContent value="specs">
              <dl className="spec-list">
                {[
                  [copy.innerSpec, `7.6${copy.inches} · 2670 × 1878`],
                  [copy.outerSpec, `5.4${copy.inches} · 1398 × 2034`],
                  [copy.surface, copy.surfaceValue],
                  [
                    copy.openSize,
                    `164.6 × 117.8 × 5.2 ${copy.millimeters.trim()}`,
                  ],
                  [
                    copy.closedSize,
                    `84.1 × 117.8 × 11.3 ${copy.millimeters.trim()}`,
                  ],
                  [copy.weight, copy.grams254],
                  [copy.material, copy.materialValue],
                  [copy.chip, 'A20 Pro'],
                  [copy.colors, copy.colorValue],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </TabsContent>
          </Tabs>
          <div className="source-links">
            <a
              href={source}
              target="_blank"
              rel="noreferrer"
              onClick={() => record('official_link_clicked', 'dialog_product')}
            >
              {copy.productIntro} <ArrowUpRight size={14} />
            </a>
            <a
              href="https://www.apple.com.cn/iphone-duo/specs/"
              target="_blank"
              rel="noreferrer"
              onClick={() => record('official_link_clicked', 'dialog_specs')}
            >
              {copy.technicalSpecs} <ArrowUpRight size={14} />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
