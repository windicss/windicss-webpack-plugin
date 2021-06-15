"use strict";


const constants = require('../dist/constants')

describe("Virtual module regex tests", function() {

  it('should match on windows path', () => {
    expect(
      constants.MODULE_ID_VIRTUAL_TEST.test('D:\\a\\windicss-webpack-plugin\\windicss-webpack-plugin\\test\\virtual:windi.css')
    ).toBeTruthy()
  });
});
