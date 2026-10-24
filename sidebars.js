// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {type: 'category', label: 'Getting started', collapsed: false, items: ['index', 'register-a-slot']},
    {type: 'category', label: 'How Twilight works', collapsed: false, items: ['architecture', 'slots', 'how-it-works', 'minis', 'agent-auth', 'rewards']},
    {type: 'category', label: 'Take part', collapsed: false, items: ['get-started', 'mining-with-a-coding-agent', 'wallet', 'questions']},
    {type: 'category', label: 'Reference', collapsed: false, items: ['developers']},
  ],
};
export default sidebars;
