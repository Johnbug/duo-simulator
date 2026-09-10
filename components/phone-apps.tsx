'use client';
import { useRef } from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  LockKeyhole,
  SquarePen,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

export function NotesApp({
  note,
  setNote,
  checked,
  setChecked,
  onHome,
}: {
  note: string;
  setNote: (value: string) => void;
  checked: boolean[];
  setChecked: (value: boolean[]) => void;
  onHome: () => void;
}) {
  const editor = useRef<HTMLTextAreaElement>(null);
  return (
    <section className="ios-notes" aria-label="备忘录">
      <header className="ios-app-nav notes-nav">
        <button onClick={onHome} aria-label="返回主屏幕">
          <ChevronLeft />
          <span>备忘录</span>
        </button>
        <button aria-label="编辑备忘录" onClick={() => editor.current?.focus()}>
          <SquarePen />
        </button>
      </header>
      <article className="note-paper">
        <p className="note-timestamp">9月10日，星期四</p>
        <h3>给周末留一点空白</h3>
        <Textarea
          ref={editor}
          className="note-editor"
          aria-label="编辑备忘录"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="note-checklist" aria-label="周末清单">
          {['带上相机，出发', '找一家海边咖啡馆', '留一点时间给日落'].map(
            (label, index) => (
              <label key={label} className={checked[index] ? 'completed' : ''}>
                <Checkbox
                  checked={checked[index]}
                  onCheckedChange={(value) =>
                    setChecked(
                      checked.map((item, i) =>
                        i === index ? Boolean(value) : item,
                      ),
                    )
                  }
                />
                <span>{label}</span>
              </label>
            ),
          )}
        </div>
        <div className="note-divider" />
        <p className="note-postscript">不赶时间，慢慢来。</p>
      </article>
      <footer className="ios-note-footer">
        <span>{checked.filter(Boolean).length} / 3 已完成</span>
        <span>仅本次体验保留</span>
      </footer>
    </section>
  );
}

export function SafariApp({
  finish,
  onHome,
}: {
  finish: string;
  onHome: () => void;
}) {
  return (
    <section className="ios-safari" aria-label="Safari 浏览器">
      <div className="safari-document">
        <header className="apple-page-nav">
          <span>iPhone Duo</span>
          <a
            href="https://www.apple.com.cn/iphone-duo/"
            target="_blank"
            rel="noreferrer"
            aria-label="访问 Apple 介绍"
          >
            进一步了解 <ArrowUpRight />
          </a>
        </header>
        <div className="apple-page-hero">
          <p>iPhone Duo</p>
          <h3>
            两面精彩。
            <br />
            一手展开。
          </h3>
          <img
            src={
              finish === 'night'
                ? '/assets/night-sky.webp'
                : '/assets/star-white.webp'
            }
            alt={`Apple  iPhone Duo ${finish === 'night' ? '夜空色' : '星光白色'}产品图`}
          />
          <span className="apple-color-caption">
            <i className={finish === 'night' ? 'night-dot' : ''} />
            {finish === 'night' ? '夜空色' : '星光白色'} · 钛金属设计
          </span>
        </div>
        <div className="apple-page-specs">
          <div>
            <strong>
              7.6<span> 英寸</span>
            </strong>
            <p>宽阔内屏</p>
          </div>
          <div>
            <strong>
              5.2<span> 毫米</span>
            </strong>
            <p>展开厚度</p>
          </div>
        </div>
        <p className="safari-source-credit">图片与资料来自 Apple</p>
      </div>
      <div className="ios-browser-bar">
        <button onClick={onHome} aria-label="返回主屏幕">
          <ChevronLeft />
        </button>
        <div className="ios-address">
          <LockKeyhole />
          <span>apple.com.cn</span>
        </div>
        <a
          href="https://www.apple.com.cn/iphone-duo/"
          target="_blank"
          rel="noreferrer"
          aria-label="在新页面访问 Apple 网站"
        >
          <ArrowUpRight />
        </a>
      </div>
    </section>
  );
}
