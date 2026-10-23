// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Twilight docs',
  tagline: 'Proof of work, for machines that already work',
  favicon: 'favicon.ico',
  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'}},
  ],
  url: 'https://docs.twilight.org',
  baseUrl: '/',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'warn'}},
  i18n: {defaultLocale: 'en', locales: ['en']},
  future: {v4: true, faster: true},
  presets: [
    ['classic', /** @type {import('@docusaurus/preset-classic').Options} */ ({
      docs: {routeBasePath: '/', sidebarPath: './sidebars.js', showLastUpdateTime: false, breadcrumbs: false},
      blog: false,
      theme: {customCss: './src/css/custom.css'},
    })],
  ],
  themeConfig: /** @type {import('@docusaurus/preset-classic').ThemeConfig} */ ({
    colorMode: {defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false},
    image: 'img/social-card.png',
    metadata: [{name: 'description', content: 'How Twilight mining works, in plain language.'}],
    navbar: {
      title: 'Twilight docs',
      logo: {alt: 'Twilight', src: 'img/mark.svg', width: 16, height: 17},
      items: [
        {href: 'https://twilight.org', label: 'twilight.org', position: 'right'},
        {href: 'https://jevlin.ai', label: 'Jevlin', position: 'right'},
        {href: 'https://github.com/jevlinai/jevlin-go', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'light',
      links: [],
      copyright: `© Twilight ${new Date().getFullYear()}. Devnet preview: rewards are devnet TWLT.`,
    },
    prism: {theme: prismThemes.github, additionalLanguages: ['bash', 'powershell']},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 2},
  }),
};
export default config;
