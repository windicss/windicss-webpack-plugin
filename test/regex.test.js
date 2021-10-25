"use strict";


describe("Virtual module regex tests", function() {

  it('should match on windows path', () => {
    expect(
      /virtual:windi-?(.*?)\.css/.test('D:\\a\\windicss-webpack-plugin\\windicss-webpack-plugin\\test\\virtual:windi.css')
    ).toBeTruthy()
  });
});
