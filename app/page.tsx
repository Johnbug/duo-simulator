'use client';
import { flushSync } from 'react-dom';
import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowUpRight, BatteryFull, Wifi, Signal, RotateCcw, Smartphone, Tablet, Laptop, Tent, Home as HomeIcon, PanelsTopLeft, Image as ImageIcon, Camera, Music2, CalendarDays, Settings, Compass, NotebookPen, Mail, MessageCircle, Phone, Play, Pause, ChevronLeft, ChevronRight, Check, Sun, Info, MoveHorizontal } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type AppId='home'|'photos'|'notes'|'safari'|'music'|'calendar'|'settings'|'camera'|'mail'|'messages'|'phone';
type Pose='open'|'closed'|'laptop'|'tent';
const apps=[
 {id:'photos',name:'照片',icon:ImageIcon,color:'photos-icon'}, {id:'camera',name:'相机',icon:Camera,color:'camera-icon'},
 {id:'calendar',name:'日历',icon:CalendarDays,color:'calendar-icon'}, {id:'notes',name:'备忘录',icon:NotebookPen,color:'notes-icon'},
 {id:'music',name:'音乐',icon:Music2,color:'music-icon'}, {id:'safari',name:'Safari',icon:Compass,color:'safari-icon'},
 {id:'mail',name:'邮件',icon:Mail,color:'mail-icon'}, {id:'settings',name:'设置',icon:Settings,color:'settings-icon'},
] as const;
const poses=[{id:'open',name:'展开',icon:Tablet,angle:180},{id:'closed',name:'闭合',icon:Smartphone,angle:0},{id:'laptop',name:'坐立',icon:Laptop,angle:100},{id:'tent',name:'站立',icon:Tent,angle:70}] as const;
const source='https://www.apple.com.cn/iphone-duo/';
const photos=['/assets/seated.jpg','/assets/display.webp','/assets/night-sky.webp'];
const poseDetails={open:['大一点，尽兴一点。','展开 7.6 英寸内屏，轻点屏幕里的 App，或试试并排处理两件事。'],closed:['合上，也很出色。','5.4 英寸外屏，熟悉的体验装进口袋。当前 App 会延续到外屏。'],laptop:['摆个角度，放开双手。','拖动滑块调整开合角度，探索坐立形态。回到完全展开即可操作 App。'],tent:['立起来，换种看法。','外屏化身桌面时钟。这里模拟待机显示，轻点时钟可切换显示样式。']};

export default function DuoExperience(){
 const [angle,setAngle]=useState(180); const [pose,setPose]=useState<Pose>('open');
 const [finish,setFinish]=useState('night'); const [app,setApp]=useState<AppId>('home');
 const [split,setSplit]=useState(false); const [portrait,setPortrait]=useState(false);
 const [info,setInfo]=useState(false); const [note,setNote]=useState('周末，去看看更大的世界。\n\n☐ 带上相机\n☐ 找一家海边咖啡馆\n☐ 留一点时间给日落');
 const [selectedDay,setSelectedDay]=useState(10); const [dialed,setDialed]=useState('');
 const [photo,setPhoto]=useState<number|null>(null);const [playing,setPlaying]=useState(false);
 const [brightness,setBrightness]=useState(100);const [clockStyle,setClockStyle]=useState(false);
 const [now,setNow]=useState('9:41');const [captured,setCaptured]=useState(false);
 useEffect(()=>{const update=()=>setNow(new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}));update();const t=setInterval(update,1000);return()=>clearInterval(t)},[]);
 useEffect(()=>{
 const context=(document as Document & {modelContext?:{registerTool:(tool:object, options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
 if(!context?.registerTool)return;
 const lifecycle=new AbortController();
 const tool={name:'configure_duo_experience',title:'调整 iPhone Duo 体验',description:'设置可见模拟设备的折叠形态、配色和分屏状态。',inputSchema:{type:'object',properties:{pose:{type:'string',enum:['open','closed','laptop','tent']},finish:{type:'string',enum:['night','white']},split:{type:'boolean'}},required:['pose','finish','split'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input:unknown){
 if(!input||typeof input!=='object')throw new Error('Expected configuration object');
 const value=input as Record<string,unknown>;
 if(!poses.some(p=>p.id===value.pose)||!['night','white'].includes(String(value.finish))||typeof value.split!=='boolean'||Object.keys(value).some(k=>!['pose','finish','split'].includes(k)))throw new Error('Invalid configuration');
 if(value.split&&value.pose!=='open')throw new Error('Split view requires an open device');
 flushSync(()=>{choosePose(value.pose as Pose);setFinish(value.finish as string);setSplit(value.split as boolean)});
 return {pose:value.pose,finish:value.finish,split:value.split};
 }};
 try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
 return()=>lifecycle.abort();
 },[]);
 function choosePose(p:Pose){setPose(p);setAngle(poses.find(x=>x.id===p)!.angle);setPortrait(false);if(p!=='open')setSplit(false)}
 function openApp(id:AppId){setApp(id);setPhoto(null);setCaptured(false)}
 function reset(){setAngle(180);setPose('open');setFinish('night');setApp('home');setSplit(false);setPortrait(false);setBrightness(100);setPhoto(null);setPlaying(false);setDialed('');setSelectedDay(10)}
 const closed=angle<15;const folding=angle>=15&&angle<175&&pose!=='tent';
 const home=()=> <div className="home-screen">
   <div className="widgets"><div className="weather-widget"><span>上海 <ArrowUpRight size={12}/></span><strong>26°</strong><span><Sun size={17}/> 晴</span><small>最高 28°　最低 23° · 演示</small></div><div className="date-widget"><span>星期四</span><strong>10</strong><small>九月 · 2026</small><div className="event">给生活，留一点空间</div></div></div>
   <div className="app-grid">{apps.map(a=><button key={a.id} onClick={()=>openApp(a.id)} className="app-item"><span className={`app-icon ${a.color}`}><a.icon strokeWidth={1.7}/></span><span>{a.name}</span></button>)}</div>
   <div className="page-dots"><b/><i/></div>
   <div className="dock">{[{id:'phone',icon:Phone,color:'phone-icon',name:'电话'},{id:'safari',icon:Compass,color:'safari-icon',name:'Safari'},{id:'messages',icon:MessageCircle,color:'phone-icon',name:'信息'},{id:'music',icon:Music2,color:'music-icon',name:'音乐'}].map(a=><button key={a.id} className={`app-icon ${a.color}`} aria-label={a.name} onClick={()=>openApp(a.id as AppId)}><a.icon strokeWidth={1.8}/></button>)}</div>
 </div>;
 function appView(id:AppId){
 if(id==='home')return home();
 if(id==='photos')return <div className="photos-app"><h3>照片 <span>图库</span></h3>{photo!==null?<button className="photo-focus" onClick={()=>setPhoto(null)} aria-label="返回图库"><img src={photos[photo]} alt="Apple 官方 iPhone Duo 图片"/><span><ChevronLeft size={16}/>所有照片</span></button>:<><p>iPhone Duo · Apple 官方图集</p><div className="photo-grid">{photos.map((p,i)=><button key={p} onClick={()=>setPhoto(i)}><img src={p} alt={['坐立形态','宽阔内屏','夜空色机身'][i]}/></button>)}</div><small>3 张照片 · 轻点查看</small></>}</div>;
 if(id==='notes')return <div className="notes-app"><span className="app-kicker">备忘录　/　我的灵感</span><h3>下一站，慢下来。</h3><p className="note-date">2026年9月10日 · 仅本次体验保留</p><textarea aria-label="编辑备忘录" value={note} onChange={e=>setNote(e.target.value)}/><span className="note-count">{note.length} 字</span></div>;
 if(id==='safari')return <div className="safari-app"><div className="address"><span>◉</span> apple.com.cn <RotateCcw size={13}/></div><div className="browser-page"><span>来自 Apple</span><h3>iPhone Duo</h3><img src="/assets/star-white.webp" alt="Apple 官方星光白色 iPhone Duo"/><p>新的可能，就此展开。</p><a href={source} target="_blank" rel="noreferrer">访问官方网站 <ArrowUpRight size={14}/></a></div></div>;
 if(id==='music')return <div className="music-app"><div className="album"><Music2 size={72}/><span>ROOM TO<br/>BREATHE</span></div><div className="track"><h3>给自己一点空间</h3><p>体验播放界面 · 无音频</p></div><div className="music-progress"><i style={{width:playing?'48%':'20%'}}/></div><div className="playback"><button aria-label="重置播放" onClick={()=>setPlaying(false)}><ChevronLeft/></button><button aria-label={playing?'暂停':'播放演示'} onClick={()=>setPlaying(!playing)}>{playing?<Pause fill="currentColor"/>:<Play fill="currentColor"/>}</button><button aria-label="重置播放" onClick={()=>setPlaying(false)}><ChevronRight/></button></div></div>;
 if(id==='calendar')return <div className="calendar-app"><span>2026</span><h3>九月</h3><div className="calendar-grid">{'一二三四五六日'.split('').map(d=><small key={d}>{d}</small>)}{Array.from({length:35},(_,i)=><button key={i} className={i===selectedDay?'today':''} disabled={i===0||i>30} onClick={()=>setSelectedDay(i)}>{i>0&&i<31?i:''}</button>)}</div><p className="calendar-event">9月{selectedDay}日　给自己安排一个小假期</p></div>;
 if(id==='settings')return <div className="settings-app"><h3>设置</h3><div className="settings-profile"><span>D</span><div><b>你的 iPhone Duo</b><p>网页体验设备</p></div></div><div className="setting-row"><span>显示亮度</span><b>{brightness}%</b></div><Slider aria-label="屏幕亮度" value={[brightness]} min={40} max={100} onValueChange={v=>setBrightness(Array.isArray(v)?v[0]:v)}/><div className="setting-row"><span>显示屏</span><span>{closed?'5.4 英寸外屏':'7.6 英寸内屏'}</span></div><div className="setting-row"><span>芯片</span><span>A20 Pro</span></div><div className="setting-row"><span>系统设计参考</span><span>iOS 27</span></div></div>;
 if(id==='camera')return <div className="camera-app"><div className="camera-preview"><img src="/assets/seated.jpg" alt="相机体验使用的 Apple 官方产品图片"/>{captured&&<span className="capture-feedback"><Check size={16}/> 已模拟拍摄</span>}</div><p>照片　 <b>人像</b>　全景</p><button className="shutter" aria-label="模拟拍照" onClick={()=>setCaptured(!captured)}/><small>示意取景 · 未使用摄像头</small></div>;
 if(id==='mail')return <div className="mail-app"><h3>收件箱</h3><p>演示邮件</p><article><b>今天，展开一点新意。</b><small>来自 Duo 体验室</small><p>一边阅读，一边记下灵感。展开手机后，点击「分屏体验」，试试把两个 App 放在一起。</p></article></div>;
 if(id==='messages')return <div className="messages-app"><h3>信息</h3><p>演示对话</p><div className="bubble">周末去海边吧？</div><div className="bubble mine">好呀！我来记下行程 ☀️</div><div className="bubble">在分屏里打开备忘录，边看边写。</div><small>此为示例，无法发送信息</small></div>;
 return <div className="phone-app"><Phone size={40}/><h3>电话</h3><p>{dialed||'在浏览器里探索界面。'}</p><small>网页体验不支持拨打电话</small><div className="dialpad">{'123456789*0#'.split('').map(n=><button key={n} onClick={()=>setDialed(d=>d.length<18?d+n:d)}>{n}</button>)}</div></div>;
 }
 const content=(decorative=false)=><div className={`display-content ${app==='home'&&!split?'wallpaper':''}`} style={{filter:`brightness(${brightness/100})`}}>
   <div className="status-bar"><b>{now}</b><div className="dynamic-island"/><span><Signal size={13}/><Wifi size={13}/><BatteryFull size={18}/></span></div>
   {split?<div className="split-apps"><div>{appView('safari')}</div><div>{appView('notes')}</div><span className="split-handle"/></div>:<div className="app-content">{appView(app)}</div>}
   <button className="home-indicator" onClick={()=>{openApp('home');setSplit(false)}} aria-label="返回主屏幕" tabIndex={decorative?-1:0}/>
 </div>;
 return <div className="experience">
   <header className="site-header"><a className="wordmark" href="/">duo<span>体验室</span></a><nav><a className="nav-active" href="#experience">交互体验</a><button onClick={()=>setInfo(true)}>设计与规格</button></nav><a className="official-link" href={source} target="_blank" rel="noreferrer">Apple 官网 <ArrowUpRight size={14}/></a></header>
   <main id="experience"><div className="intro"><div><div className="eyebrow"><span/> IPHONE DUO · INTERACTIVE EXPERIENCE</div><h1>展开，另一种可能。</h1><p>亲手折叠，轻点探索。让大屏的想象，发生在眼前。</p></div><span className="simulation-label"><Info size={14}/> 非 Apple 官方 · 网页模拟体验</span></div>
   <div className="workbench"><section className="stage" aria-label="iPhone Duo 交互设备"><div className="stage-top"><span><i/>{closed?'外屏体验':pose==='tent'?'待机显示':'内屏体验'}</span><span>{closed?'5.4': '7.6'}″ SUPER RETINA XDR</span></div>
     <div className={`device-space ${portrait?'portrait-space':''}`}><div className={`device ${finish==='white'?'white-device':''} ${closed?'closed-device':''} ${portrait?'portrait-device':''} ${pose==='tent'?'tent-device':''} ${folding?'folding-device':''}`} style={{'--fold':`${180-angle}deg`} as CSSProperties}>
       {pose==='tent'?<button className={`standby ${clockStyle?'standby-alt':''}`} onClick={()=>setClockStyle(!clockStyle)}><span>星期四 · 9月10日</span><strong>{now}</strong><span><Sun size={22}/> 上海 26° · 天气演示</span><small>轻点切换时钟</small></button>:folding?<div className="folding-panels" aria-label={`开合角度 ${angle} 度`}><div className="fold-left" inert><div>{content(true)}</div></div><div className="fold-right" inert><div>{content(true)}</div></div></div>:content()}
     </div></div>
     <div className="device-toolbar"><button onClick={()=>{openApp('home');setSplit(false)}} aria-label="返回主屏幕"><HomeIcon size={17}/></button><span/><button className={portrait?'selected':''} disabled={!closed&&angle<175} onClick={()=>setPortrait(!portrait)} aria-label="旋转屏幕"><RotateCcw size={17}/></button><button className={split?'selected':''} disabled={angle<175} onClick={()=>{setSplit(!split);setPortrait(false)}} aria-label="切换分屏体验"><PanelsTopLeft size={18}/></button><span/><button onClick={reset} aria-label="重置体验"><RotateCcw size={16}/><small>重置</small></button></div>
     <div className="stage-caption"><MoveHorizontal size={14}/>{folding?'拖动右侧滑块，感受开合变化':'轻点屏幕里的 App，开始探索'}</div>
   </section>
   <aside className="controls"><section><div className="control-heading"><span className="step">01</span><h2>选择形态</h2></div><div className="pose-grid">{poses.map(p=><button key={p.id} className={pose===p.id?'active':''} onClick={()=>choosePose(p.id)} aria-pressed={pose===p.id}><p.icon strokeWidth={1.5}/><span>{p.name}</span></button>)}</div><div className="angle-heading"><label id="angle-label">开合角度</label><output>{angle}°</output></div><Slider aria-labelledby="angle-label" value={[angle]} min={0} max={180} onValueChange={v=>{const a=Array.isArray(v)?v[0]:v;setAngle(a);setPose(a<15?'closed':a>=175?'open':'laptop');setPortrait(false);if(a<175)setSplit(false)}}/><div className="range-labels"><span>闭合 0°</span><span>展开 180°</span></div></section>
   <section><div className="control-heading"><span className="step">02</span><h2>选个喜欢的颜色</h2></div><div className="finish-picker"><button aria-label="夜空色" aria-pressed={finish==='night'} className={`swatch night ${finish==='night'?'active':''}`} onClick={()=>setFinish('night')}>{finish==='night'&&<Check size={17}/>}</button><button aria-label="星光白色" aria-pressed={finish==='white'} className={`swatch white ${finish==='white'?'active':''}`} onClick={()=>setFinish('white')}>{finish==='white'&&<Check size={17}/>}</button><span>{finish==='night'?'夜空色':'星光白色'}<small>钛金属设计</small></span></div></section>
   <section className="scenario"><div className="control-heading"><span className="step">03</span><h2>探索大屏体验</h2></div><button className={split?'split-button is-active':'split-button'} onClick={()=>{choosePose('open');setSplit(!split)}}><PanelsTopLeft size={20}/><span>分屏体验<small>Safari + 备忘录</small></span><ArrowUpRight size={18}/></button><p>一边寻找灵感，一边随手记录。</p></section>
   <div className="context-card"><button className="official-thumbnail" onClick={()=>setInfo(true)} aria-label="查看 Apple 官方产品图片"><img src={pose==='laptop'?'/assets/seated.jpg':pose==='tent'?'/assets/standing.webp':finish==='night'?'/assets/night-sky.webp':'/assets/star-white.webp'} alt="Apple 官方 iPhone Duo 外观图片"/><span>APPLE 官方图片 <ArrowUpRight size={10}/></span></button><span className="context-mark">{String(poses.findIndex(p=>p.id===pose)+1).padStart(2,'0')} / 04</span><h3>{poseDetails[pose][0]}</h3><p>{poseDetails[pose][1]}</p></div>
   </aside></div>
   <section className="details-strip"><div><b>{closed?'5.4':'7.6'}<span> 英寸</span></b><p>{closed?'外屏':'内屏'} · 超视网膜 XDR</p></div><div><b>{closed?'11.3':'5.2'}<span> 毫米</span></b><p>{closed?'闭合':'展开'}机身厚度</p></div><div><b>A20 Pro</b><p>芯片 · VC 均热板散热</p></div><button onClick={()=>setInfo(true)}>了解设计与官方资料 <ArrowUpRight size={17}/></button></section>
   <footer><span>基于 Apple 官方图片与产品资料制作。App 内容与折叠动画为交互示意。</span><a href={source} target="_blank" rel="noreferrer">资料来源：Apple <ArrowUpRight size={12}/></a></footer>
   </main>
   <Dialog open={info} onOpenChange={setInfo}><DialogContent className="spec-dialog"><DialogTitle>iPhone Duo · 设计与资料</DialogTitle><DialogDescription>图片及规格来自 Apple。此体验由独立开发者制作，模拟界面与实际设备可能不同。</DialogDescription><Tabs defaultValue="design"><TabsList><TabsTrigger value="design">官方外观</TabsTrigger><TabsTrigger value="specs">技术规格</TabsTrigger></TabsList><TabsContent value="design"><img className="official-product" src={finish==='night'?'/assets/night-sky.webp':'/assets/star-white.webp'} alt={`Apple 官方 iPhone Duo ${finish==='night'?'夜空色':'星光白色'}产品图`}/><p className="image-credit">Apple 官方产品图片 · {finish==='night'?'夜空色':'星光白色'}</p></TabsContent><TabsContent value="specs"><dl className="spec-list">{[['内屏','7.6 英寸 · 2670 × 1878'],['外屏','5.4 英寸 · 1398 × 2034'],['展开尺寸','164.6 × 117.8 × 5.2 毫米'],['闭合尺寸','84.1 × 117.8 × 11.3 毫米'],['重量','254 克'],['材质','5 级钛金属边框与铰链护壳'],['芯片','A20 Pro'],['配色','夜空色 / 星光白色']].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></TabsContent></Tabs><div className="source-links"><a href={source} target="_blank" rel="noreferrer">产品介绍 <ArrowUpRight size={14}/></a><a href="https://www.apple.com.cn/iphone-duo/specs/" target="_blank" rel="noreferrer">技术规格 <ArrowUpRight size={14}/></a></div></DialogContent></Dialog>
 </div>;
}
