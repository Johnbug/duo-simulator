import type { Locale } from './i18n.mjs';

export type BehaviorEventName =
  | 'locale_changed'
  | 'experience_mode_changed'
  | 'pose_selected'
  | 'finish_selected'
  | 'model_dragged'
  | 'app_opened'
  | 'split_toggled'
  | 'auto_motion_toggled'
  | 'info_opened'
  | 'github_link_clicked'
  | 'official_link_clicked';

export function behaviorEvent(
  name: BehaviorEventName,
  locale: Locale,
  value: string,
  context?: string | number | boolean,
): {
  name: BehaviorEventName;
  properties: {
    locale: Locale;
    value: string;
    context?: string | number | boolean;
  };
};
