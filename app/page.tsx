'use client';
import { flushSync } from 'react-dom';
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
import { FoldGesture } from '@/lib/fold-gesture.mjs';
import { ShowcaseMotion } from '@/lib/showcase-motion.mjs';
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
  { id: 'photos', name: '照片', icon: ImageIcon, color: 'photos-icon' },
  { id: 'camera', name: '相机', icon: Camera, color: 'camera-icon' },
  { id: 'calendar', name: '日历', icon: CalendarDays, color: 'calendar-icon' },
  { id: 'notes', name: '备忘录', icon: NotebookPen, color: 'notes-icon' },
  { id: 'music', name: '音乐', icon: Music2, color: 'music-icon' },
  { id: 'safari', name: 'Safari', icon: Compass, color: 'safari-icon' },
  { id: 'mail', name: '邮件', icon: Mail, color: 'mail-icon' },
  { id: 'settings', name: '设置', icon: Settings, color: 'settings-icon' },
] as const;
const poses = [
  { id: 'open', name: '展开', icon: Tablet, angle: 180 },
  { id: 'closed', name: '闭合', icon: Smartphone, angle: 0 },
  { id: 'laptop', name: '坐立', icon: Laptop, angle: 100 },
  { id: 'tent', name: '站立', icon: Tent, angle: 70 },
] as const;
const source = 'https://www.apple.com.cn/iphone-duo/';
const photos = [
  '/assets/seated.jpg',
  '/assets/display.webp',
  '/assets/night-sky.webp',
];
const poseDetails = {
  open: [
    '大一点，尽兴一点。',
    '直接拖动机身，查看真实开合。切换「操作 App」，体验主屏与分屏。',
  ],
  closed: [
    '合上，也很出色。',
    '5.4 英寸外屏，熟悉的体验装进口袋。当前 App 会延续到外屏。',
  ],
  laptop: [
    '摆个角度，放开双手。',
    '按住机身左右拖动，停在你喜欢的角度。切换「转动」可查看背面与铰链。',
  ],
  tent: [
    '立起来，换种看法。',
    '翻到外屏，查看官方待机显示画面。切换「转动」，从不同角度细看。',
  ],
};

export default function DuoExperience() {
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
  const [note, setNote] = useState(
    '去海边走走，看看落日。\n把想做的小事，一件件记下来。',
  );
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
        new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      );
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
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
      title: '调整 iPhone Duo 体验',
      description: '设置可见模拟设备的折叠形态、配色和分屏状态。',
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
          choosePose(value.pose as Pose);
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
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function enterApps() {
    setView('apps');
    setAngle(180);
    setPose('open');
    setPortrait(false);
  }
  function openApp(id: AppId) {
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
            上海 <ArrowUpRight size={12} />
          </span>
          <strong>26°</strong>
          <span>
            <Sun size={17} /> 晴
          </span>
          <small>最高 28°　最低 23° · 演示</small>
        </div>
        <div className="date-widget">
          <span>星期四</span>
          <strong>10</strong>
          <small>九月 · 2026</small>
          <div className="event">给生活，留一点空间</div>
        </div>
      </div>
      <div className="app-grid">
        {apps.map((a) => (
          <button key={a.id} onClick={() => openApp(a.id)} className="app-item">
            <span className={`app-icon ${a.color}`}>
              <a.icon strokeWidth={1.7} />
            </span>
            <span>{a.name}</span>
          </button>
        ))}
      </div>
      <div className="page-dots">
        <b />
        <i />
      </div>
      <div className="dock">
        {[
          { id: 'phone', icon: Phone, color: 'phone-icon', name: '电话' },
          { id: 'safari', icon: Compass, color: 'safari-icon', name: 'Safari' },
          {
            id: 'messages',
            icon: MessageCircle,
            color: 'phone-icon',
            name: '信息',
          },
          { id: 'music', icon: Music2, color: 'music-icon', name: '音乐' },
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
            照片 <span>图库</span>
          </h3>
          {photo !== null ? (
            <button
              className="photo-focus"
              onClick={() => setPhoto(null)}
              aria-label="返回图库"
            >
              <img src={photos[photo]} alt="Apple 官方 iPhone Duo 图片" />
              <span>
                <ChevronLeft size={16} />
                所有照片
              </span>
            </button>
          ) : (
            <>
              <p>iPhone Duo · Apple 官方图集</p>
              <div className="photo-grid">
                {photos.map((p, i) => (
                  <button key={p} onClick={() => setPhoto(i)}>
                    <img
                      src={p}
                      alt={['坐立形态', '宽阔内屏', '夜空色机身'][i]}
                    />
                  </button>
                ))}
              </div>
              <small>3 张照片 · 轻点查看</small>
            </>
          )}
        </div>
      );
    if (id === 'notes')
      return (
        <NotesApp
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
          finish={finish}
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
            <h3>给自己一点空间</h3>
            <p>体验播放界面 · 无音频</p>
          </div>
          <div className="music-progress">
            <i style={{ width: playing ? '48%' : '20%' }} />
          </div>
          <div className="playback">
            <button aria-label="重置播放" onClick={() => setPlaying(false)}>
              <ChevronLeft />
            </button>
            <button
              aria-label={playing ? '暂停' : '播放演示'}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <Pause fill="currentColor" />
              ) : (
                <Play fill="currentColor" />
              )}
            </button>
            <button aria-label="重置播放" onClick={() => setPlaying(false)}>
              <ChevronRight />
            </button>
          </div>
        </div>
      );
    if (id === 'calendar')
      return (
        <div className="calendar-app">
          <span>2026</span>
          <h3>九月</h3>
          <div className="calendar-grid">
            {'一二三四五六日'.split('').map((d) => (
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
            9月{selectedDay}日　给自己安排一个小假期
          </p>
        </div>
      );
    if (id === 'settings')
      return (
        <div className="settings-app">
          <h3>设置</h3>
          <div className="settings-profile">
            <span>D</span>
            <div>
              <b>你的 iPhone Duo</b>
              <p>网页体验设备</p>
            </div>
          </div>
          <div className="setting-row">
            <span>显示亮度</span>
            <b>{brightness}%</b>
          </div>
          <Slider
            aria-label="屏幕亮度"
            value={[brightness]}
            min={40}
            max={100}
            onValueChange={(v) => setBrightness(Array.isArray(v) ? v[0] : v)}
          />
          <div className="setting-row">
            <span>显示屏</span>
            <span>{closed ? '5.4 英寸外屏' : '7.6 英寸内屏'}</span>
          </div>
          <div className="setting-row">
            <span>芯片</span>
            <span>A20 Pro</span>
          </div>
          <div className="setting-row">
            <span>系统设计参考</span>
            <span>iOS 27</span>
          </div>
        </div>
      );
    if (id === 'camera')
      return (
        <div className="camera-app">
          <div className="camera-preview">
            <img
              src="/assets/seated.jpg"
              alt="相机体验使用的 Apple 官方产品图片"
            />
            {captured && (
              <span className="capture-feedback">
                <Check size={16} /> 已模拟拍摄
              </span>
            )}
          </div>
          <p>
            照片　 <b>人像</b>　全景
          </p>
          <button
            className="shutter"
            aria-label="模拟拍照"
            onClick={() => setCaptured(!captured)}
          />
          <small>示意取景 · 未使用摄像头</small>
        </div>
      );
    if (id === 'mail')
      return (
        <div className="mail-app">
          <h3>收件箱</h3>
          <p>演示邮件</p>
          <article>
            <b>今天，展开一点新意。</b>
            <small>来自 Duo 体验室</small>
            <p>
              一边阅读，一边记下灵感。展开手机后，点击「分屏体验」，试试把两个
              App 放在一起。
            </p>
          </article>
        </div>
      );
    if (id === 'messages')
      return (
        <div className="messages-app">
          <h3>信息</h3>
          <p>演示对话</p>
          <div className="bubble">周末去海边吧？</div>
          <div className="bubble mine">好呀！我来记下行程 ☀️</div>
          <div className="bubble">在分屏里打开备忘录，边看边写。</div>
          <small>此为示例，无法发送信息</small>
        </div>
      );
    return (
      <div className="phone-app">
        <Phone size={40} />
        <h3>电话</h3>
        <p>{dialed || '在浏览器里探索界面。'}</p>
        <small>网页体验不支持拨打电话</small>
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
        aria-label="返回主屏幕"
        tabIndex={decorative ? -1 : 0}
      />
    </div>
  );
  return (
    <div className="experience">
      <header className="site-header">
        <a className="wordmark" href="/">
          duo<span>体验室</span>
        </a>
        <nav>
          <a className="nav-active" href="#experience">
            交互体验
          </a>
          <button onClick={() => setInfo(true)}>设计与规格</button>
        </nav>
        <a
          className="official-link"
          href={source}
          target="_blank"
          rel="noreferrer"
        >
          Apple 官网 <ArrowUpRight size={14} />
        </a>
      </header>
      <main id="experience">
        <div className="intro">
          <div>
            <div className="eyebrow">
              <span /> THE DUO EXPERIENCE
            </div>
            <h1>
              iPhone Duo<span className="intro-divider"> / </span>
              <span className="intro-light">亲手展开。</span>
            </h1>
            <p>探索官方三维外观，体验大屏上的更多可能。</p>
          </div>
          <span className="simulation-label">
            <Info size={14} /> 非 Apple 官方 · 网页模拟体验
          </span>
        </div>
        <div className="workbench">
          <section
            className={`stage ${view === 'model' ? 'model-stage' : 'app-stage'} ${dragging ? 'is-dragging' : ''}`}
            aria-label="iPhone Duo 交互设备"
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
                  ? 'Apple 官方三维模型'
                  : closed
                    ? '外屏体验'
                    : 'App 体验'}
              </span>
              <span>{closed ? '5.4' : '7.6'}″ SUPER RETINA XDR</span>
            </div>
            <Tabs
              className="experience-mode"
              value={view}
              onValueChange={(v) => {
                if (v === 'apps') enterApps();
                else setView('model');
              }}
            >
              <TabsList aria-label="体验模式">
                <TabsTrigger value="model">真机外观</TabsTrigger>
                <TabsTrigger value="apps">操作 App</TabsTrigger>
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
              />
              <div className="model-caption" aria-hidden="true">
                <span>
                  {dragging
                    ? '正在' + (gesture === 'fold' ? '折叠' : '转动')
                    : autoMotion
                      ? gesture === 'fold'
                        ? '自动缓慢开合 · 拖动可接管'
                        : '自动旋转 · 拖动可接管'
                      : '按住机身' +
                        (gesture === 'fold' ? '左右拖动' : '转动查看')}
                </span>
                <strong>
                  {angle}
                  <small>°</small>
                </strong>
                <i>
                  {gesture === 'fold'
                    ? '← 合上　　展开 →'
                    : '360° 查看机身与铰链'}
                </i>
              </div>
            </div>
            <div
              className={`device-space ${portrait ? 'portrait-space' : ''} ${view !== 'apps' ? 'is-hidden' : ''}`}
            >
              <button
                className="fold-grip"
                aria-label="拖动手机边缘折叠，方向键调节角度"
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
                    <span>星期四 · 9月10日</span>
                    <strong>{now}</strong>
                    <span>
                      <Sun size={22} /> 上海 26° · 天气演示
                    </span>
                    <small>轻点切换时钟</small>
                  </button>
                ) : folding ? (
                  <div
                    className="folding-panels"
                    aria-label={`开合角度 ${angle} 度`}
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
                  旋转
                </button>
                <button
                  className={gesture === 'fold' ? 'active' : ''}
                  onClick={() => selectShowcase('fold')}
                  aria-pressed={gesture === 'fold'}
                >
                  <MoveHorizontal size={16} />
                  折叠
                </button>
                <span />
                <button
                  onClick={() => {
                    setAutoMotion(false);
                    setYaw(-0.35);
                    setPitch(-0.12);
                  }}
                >
                  正面
                </button>
                <button
                  onClick={() => {
                    setAutoMotion(false);
                    setYaw(Math.PI - 0.35);
                    setPitch(-0.12);
                  }}
                >
                  背面
                </button>
                <button
                  onClick={() => setAutoMotion((running) => !running)}
                  aria-label={autoMotion ? '暂停自动展示' : '继续自动展示'}
                  aria-pressed={autoMotion}
                >
                  {autoMotion ? <Pause size={15} /> : <Play size={15} />}
                  {autoMotion ? '暂停' : '播放'}
                </button>
                <button onClick={reset} aria-label="重置体验">
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
                  aria-label="返回主屏幕"
                >
                  <HomeIcon size={17} />
                  <small>主屏</small>
                </button>
                <span />
                <button
                  className={portrait ? 'selected' : ''}
                  disabled={!closed && angle < 175}
                  onClick={() => setPortrait(!portrait)}
                  aria-label="旋转屏幕"
                >
                  <RotateCcw size={17} />
                  <small>旋转</small>
                </button>
                <button
                  className={split ? 'selected' : ''}
                  disabled={angle < 175}
                  onClick={() => {
                    setSplit(!split);
                    setPortrait(false);
                  }}
                  aria-label="切换分屏体验"
                >
                  <PanelsTopLeft size={18} />
                  <small>分屏</small>
                </button>
                <span />
                <button
                  onClick={() => setAutoMotion((running) => !running)}
                  aria-label={autoMotion ? '暂停自动展示' : '继续自动展示'}
                  aria-pressed={autoMotion}
                >
                  {autoMotion ? <Pause size={15} /> : <Play size={15} />}
                  {autoMotion ? '暂停' : '播放'}
                </button>
                <button onClick={reset} aria-label="重置体验">
                  <RotateCcw size={16} />
                  <small>重置</small>
                </button>
              </div>
            )}
            <div className="stage-caption">
              <MoveHorizontal size={14} />
              {view === 'model'
                ? '鼠标或单指拖动 · 松手停留当前角度 · 也可使用右侧滑块'
                : '轻点 App 操作 · 拖动右侧握柄折叠手机'}
            </div>
          </section>
          <aside className="controls">
            <section>
              <div className="control-heading">
                <h2>折叠形态</h2>
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
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
              <div className="angle-heading">
                <label id="angle-label">开合角度</label>
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
                <span>闭合 0°</span>
                <span>展开 180°</span>
              </div>
            </section>
            <section>
              <div className="control-heading">
                <h2>机身配色</h2>
              </div>
              <div className="finish-picker">
                <button
                  aria-label="夜空色"
                  aria-pressed={finish === 'night'}
                  className={`swatch night ${finish === 'night' ? 'active' : ''}`}
                  onClick={() => setFinish('night')}
                >
                  {finish === 'night' && <Check size={17} />}
                </button>
                <button
                  aria-label="星光白色"
                  aria-pressed={finish === 'white'}
                  className={`swatch white ${finish === 'white' ? 'active' : ''}`}
                  onClick={() => setFinish('white')}
                >
                  {finish === 'white' && <Check size={17} />}
                </button>
                <span>
                  {finish === 'night' ? '夜空色' : '星光白色'}
                  <small>钛金属设计</small>
                </span>
              </div>
            </section>
            <section className="scenario">
              <div className="control-heading">
                <h2>应用体验</h2>
              </div>
              <button
                className={split ? 'split-button is-active' : 'split-button'}
                onClick={() => {
                  enterApps();
                  setSplit(!split);
                }}
              >
                <PanelsTopLeft size={20} />
                <span>
                  浏览与记录<small>Safari ＋ 备忘录</small>
                </span>
                <ArrowUpRight size={18} />
              </button>
              <p>一边寻找灵感，一边随手记录。</p>
            </section>
            <div className="context-card">
              <button
                className="official-thumbnail"
                onClick={() => setInfo(true)}
                aria-label="查看 Apple 官方产品图片"
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
                  alt="Apple 官方 iPhone Duo 外观图片"
                />
                <span>
                  APPLE 官方图片 <ArrowUpRight size={10} />
                </span>
              </button>
              <h3>{poseDetails[pose][0]}</h3>
              <p>{poseDetails[pose][1]}</p>
            </div>
          </aside>
        </div>
        <section className="details-strip">
          <div>
            <b>
              {closed ? '5.4' : '7.6'}
              <span> 英寸</span>
            </b>
            <p>{closed ? '外屏' : '内屏'} · 超视网膜 XDR</p>
          </div>
          <div>
            <b>
              {closed ? '11.3' : '5.2'}
              <span> 毫米</span>
            </b>
            <p>{closed ? '闭合' : '展开'}机身厚度</p>
          </div>
          <div>
            <b>A20 Pro</b>
            <p>芯片 · VC 均热板散热</p>
          </div>
          <button onClick={() => setInfo(true)}>
            了解设计与官方资料 <ArrowUpRight size={17} />
          </button>
        </section>
        <footer>
          <span>
            Apple 官方三维模型与开合动画 · 独立渲染与交互 · App 体验为模拟。
          </span>
          <a href={source} target="_blank" rel="noreferrer">
            资料来源：Apple <ArrowUpRight size={12} />
          </a>
        </footer>
      </main>
      <Dialog open={info} onOpenChange={setInfo}>
        <DialogContent className="spec-dialog">
          <DialogTitle>iPhone Duo · 设计与资料</DialogTitle>
          <DialogDescription>
            三维模型、原始开合动画、屏幕素材及规格来自 Apple
            官网。页面照明、夜空色材质与交互为独立实现；App 体验为模拟。
          </DialogDescription>
          <Tabs defaultValue="design">
            <TabsList>
              <TabsTrigger value="design">官方外观</TabsTrigger>
              <TabsTrigger value="specs">技术规格</TabsTrigger>
            </TabsList>
            <TabsContent value="design">
              <img
                className="official-product"
                src={
                  finish === 'night'
                    ? '/assets/night-sky.webp'
                    : '/assets/star-white.webp'
                }
                alt={`Apple 官方 iPhone Duo ${finish === 'night' ? '夜空色' : '星光白色'}产品图`}
              />
              <p className="image-credit">
                Apple 官方产品图片 ·{' '}
                {finish === 'night' ? '夜空色' : '星光白色'}
              </p>
            </TabsContent>
            <TabsContent value="specs">
              <dl className="spec-list">
                {[
                  ['内屏', '7.6 英寸 · 2670 × 1878'],
                  ['外屏', '5.4 英寸 · 1398 × 2034'],
                  ['屏幕表层', '内屏纳米纹理减眩光 · 外屏玻璃'],
                  ['展开尺寸', '164.6 × 117.8 × 5.2 毫米'],
                  ['闭合尺寸', '84.1 × 117.8 × 11.3 毫米'],
                  ['重量', '254 克'],
                  ['材质', '5 级钛金属边框与铰链护壳'],
                  ['芯片', 'A20 Pro'],
                  ['配色', '夜空色 / 星光白色'],
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
            <a href={source} target="_blank" rel="noreferrer">
              产品介绍 <ArrowUpRight size={14} />
            </a>
            <a
              href="https://www.apple.com.cn/iphone-duo/specs/"
              target="_blank"
              rel="noreferrer"
            >
              技术规格 <ArrowUpRight size={14} />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
