import { createElement } from 'react';

export function GithubLink({ onClick }) {
  return createElement(
    'a',
    {
      className: 'github-link',
      href: 'https://github.com/Johnbug/duo-simulator',
      target: '_blank',
      rel: 'noreferrer',
      'aria-label': 'GitHub repository',
      onClick,
    },
    createElement(
      'svg',
      {
        width: 15,
        height: 15,
        viewBox: '0 0 24 24',
        fill: 'currentColor',
        'aria-hidden': true,
      },
      createElement('path', {
        d: 'M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.93 10.93 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.41-2.7 5.38-5.28 5.67.42.36.79 1.06.79 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z',
      }),
    ),
    createElement('span', null, 'GitHub'),
  );
}
