import CssScoped from './CssScoped.vue';

export default {
  title: 'Example/CSS Variants',
};

export const ScopedCSS = () => ({
  components: { CssScoped },
  template: '<CssScoped />',
});

export const ScopedPostCSS = () => ({
  template: '<button\n' +
    '    bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"\n' +
    '    text="sm white"\n' +
    '    font="mono light"\n' +
    '    p="y-2 x-4"\n' +
    '    border="2 rounded blue-200"\n' +
    '  >\n' +
    '    Attributify Mode\n' +
    '  </button>',
});
