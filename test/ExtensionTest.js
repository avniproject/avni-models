import Extension from "../src/Extension";
import moment from "moment";

describe('Extension', function () {
  it('should create comment object from json', () => {
    const extension = Extension.fromResource({
      "url": "social_security_demo/extensions/x/asd.html",
      "lastModifiedDateTime": "2021-07-29T00:27:22.000Z"
    });
    expect(extension.url).toBe('social_security_demo/extensions/x/asd.html');
    expect(moment('2021-07-29T00:27:22.000Z').isSame(extension.lastModifiedDateTime)).toBeTruthy();
  })
});
