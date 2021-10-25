"use strict";


describe("Virtual module regex tests", function() {

  it('should match on windows path', () => {
    expect(
      /virtual:windi-?(.*?)\.css/.test('D:\\a\\windicss-webpack-plugin\\windicss-webpack-plugin\\test\\virtual:windi.css')
    ).toBeTruthy()
  });
});

describe("CSS parsing skip", function() {

  it('should detect when to skip css parsing', () => {
    expect(/@(apply|variants|screen|layer)\s/gm.test('import \'virtual:windi.css\';\n' +
      '    export default function Layout({\n' +
      '      title,\n' +
      '      children\n' +
      '    }) {\n' +
      '      return /*#__PURE__*/React.createElement(\\"div\\", {\n' +
      '        id: \\"layout-wrapper\\",\n' +
      '        className: \'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100\'\n' +
      '      }, /*#__PURE__*/React.createElement(Head, null, /*#__PURE__*/React.createElement(\\"title\\", null, title)), children, /*#__PURE__*/React.createElement(\\"style\\", {\n' +
      '        jsx: true,\n' +
      '        global: true\n' +
      '      }, `\n' +
      '            body {\n' +
      '              @apply m-0 p-0 w-100vw h-100vh overflow-hidden hover:bg-blue-500 hover:text-xs;\n' +
      '              font-family: \'-apple-system\', \'BlinkMacSystemFont\', \'Segoe UI\',\n' +
      '                \'Roboto\', \'Oxygen\', \'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\',\n' +
      '                \'Helvetica Neue\', \'sans-serif\';\n' +
      '              -webkit-font-smoothing: antialiased;\n' +
      '              -moz-osx-font-smoothing: grayscale;\n' +
      '            }\n' +
      '          `));\n' +
      '    }')).toBeTruthy()
  });
  it('sass-global', () => {
    expect(/@(apply|variants|screen|layer)\s/gm.test('.sass-global\n' +
      '@apply bg-orange-400 text-white p-4 w-1/4 transition hover:(bg-orange-900 text-orange-100)\n' +
      '  h2\n' +
      '@apply font-bold text-sm')).toBeTruthy()
    expect(/@(apply|variants|screen|layer)\s/gm.test('.sass-global\n' +
      '@apply bg-orange-400 text-white p-4 w-1/4 transition hover:(bg-orange-900 text-orange-100)\n' +
      '  h2\n' +
      '@apply font-bold text-sm')).toBeTruthy()
  });

});
