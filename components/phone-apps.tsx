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
import type { Locale } from '@/lib/i18n.mjs';
import { getTranslations } from '@/lib/translations';

export function NotesApp({
  locale,
  note,
  setNote,
  checked,
  setChecked,
  onHome,
}: {
  locale: Locale;
  note: string;
  setNote: (value: string) => void;
  checked: boolean[];
  setChecked: (value: boolean[]) => void;
  onHome: () => void;
}) {
  const copy = getTranslations(locale);
  const editor = useRef<HTMLTextAreaElement>(null);
  return (
    <section className="ios-notes" aria-label={copy.notes}>
      <header className="ios-app-nav notes-nav">
        <button onClick={onHome} aria-label={copy.backHome}>
          <ChevronLeft />
          <span>{copy.notes}</span>
        </button>
        <button
          aria-label={copy.editNote}
          onClick={() => editor.current?.focus()}
        >
          <SquarePen />
        </button>
      </header>
      <article className="note-paper">
        <p className="note-timestamp">{copy.noteDate}</p>
        <h3>{copy.noteTitle}</h3>
        <Textarea
          ref={editor}
          className="note-editor"
          aria-label={copy.editNote}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="note-checklist" aria-label={copy.weekendList}>
          {[copy.checklist1, copy.checklist2, copy.checklist3].map(
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
        <p className="note-postscript">{copy.notePostscript}</p>
      </article>
      <footer className="ios-note-footer">
        <span>
          {checked.filter(Boolean).length} / 3 {copy.completed}
        </span>
        <span>{copy.sessionOnly}</span>
      </footer>
    </section>
  );
}

export function SafariApp({
  locale,
  finish,
  onHome,
  onOfficialLink,
}: {
  locale: Locale;
  finish: string;
  onHome: () => void;
  onOfficialLink: (location: string) => void;
}) {
  const copy = getTranslations(locale);
  return (
    <section className="ios-safari" aria-label={copy.safariBrowser}>
      <div className="safari-document">
        <header className="apple-page-nav">
          <span>iPhone Duo</span>
          <a
            href="https://www.apple.com.cn/iphone-duo/"
            target="_blank"
            rel="noreferrer"
            aria-label={copy.visitApple}
            onClick={() => onOfficialLink('safari_content')}
          >
            {copy.learnMore} <ArrowUpRight />
          </a>
        </header>
        <div className="apple-page-hero">
          <p>iPhone Duo</p>
          <h3>
            {copy.hero1}
            <br />
            {copy.hero2}
          </h3>
          <img
            src={
              finish === 'night'
                ? '/assets/night-sky.webp'
                : '/assets/star-white.webp'
            }
            alt={`Apple iPhone Duo ${finish === 'night' ? copy.night : copy.white}`}
          />
          <span className="apple-color-caption">
            <i className={finish === 'night' ? 'night-dot' : ''} />
            {finish === 'night' ? copy.night : copy.white} · {copy.titanium}
          </span>
        </div>
        <div className="apple-page-specs">
          <div>
            <strong>
              7.6<span>{copy.inches}</span>
            </strong>
            <p>{copy.wideDisplay}</p>
          </div>
          <div>
            <strong>
              5.2<span>{copy.millimeters}</span>
            </strong>
            <p>{copy.openThickness}</p>
          </div>
        </div>
        <p className="safari-source-credit">{copy.appleSource}</p>
      </div>
      <div className="ios-browser-bar">
        <button onClick={onHome} aria-label={copy.backHome}>
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
          aria-label={copy.visitNewPage}
          onClick={() => onOfficialLink('safari_toolbar')}
        >
          <ArrowUpRight />
        </a>
      </div>
    </section>
  );
}
