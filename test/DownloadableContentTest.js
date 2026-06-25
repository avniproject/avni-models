import DownloadableContent from "../src/DownloadableContent";

describe("DownloadableContent.fromResource — needsKey coercion", () => {
  it("absent needsKey -> false", () => {
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c"});
    expect(dc.needsKey).toBe(false);
  });

  it("null needsKey -> false", () => {
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c", needsKey: null});
    expect(dc.needsKey).toBe(false);
  });

  it("false needsKey -> false", () => {
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c", needsKey: false});
    expect(dc.needsKey).toBe(false);
  });

  it('non-boolean truthy needsKey ("true") -> false', () => {
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c", needsKey: "true"});
    expect(dc.needsKey).toBe(false);
  });

  it("non-boolean truthy needsKey (1) -> false", () => {
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c", needsKey: 1});
    expect(dc.needsKey).toBe(false);
  });

  it("literal true needsKey -> true", () => {
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c", needsKey: true});
    expect(dc.needsKey).toBe(true);
  });

  it("needsKey is never undefined (non-optional Realm bool)", () => {
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c"});
    expect(dc.needsKey).not.toBeUndefined();
    expect(typeof dc.needsKey).toBe("boolean");
  });
});

describe("DownloadableContent.fromResource — payload", () => {
  it("object payload -> stored as JSON string and getPayload() returns the object", () => {
    const payload = {engine: "tflite", inputShape: [1, 224, 224, 3], labelMap: {0: "a", 1: "b"}};
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c", payload});
    expect(typeof dc.payload).toBe("string");
    expect(dc.payload).toBe(JSON.stringify(payload));
    expect(dc.getPayload()).toEqual(payload);
  });

  it("already-a-JSON-string payload -> preserved and getPayload() parses it", () => {
    const jsonString = JSON.stringify({engine: "onnx"});
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c", payload: jsonString});
    expect(dc.payload).toBe(jsonString);
    expect(dc.getPayload()).toEqual({engine: "onnx"});
  });

  it("absent payload -> stored null and getPayload() returns {}", () => {
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c"});
    expect(dc.payload).toBeNull();
    expect(dc.getPayload()).toEqual({});
  });

  it("empty-string payload -> stored null and getPayload() returns {}", () => {
    const dc = DownloadableContent.fromResource({uuid: "dc-1", name: "n", category: "c", payload: ""});
    expect(dc.payload).toBeNull();
    expect(dc.getPayload()).toEqual({});
  });
});

describe("DownloadableContent.getPayload — safety", () => {
  it("null payload -> {}", () => {
    const dc = new DownloadableContent();
    dc.payload = null;
    expect(dc.getPayload()).toEqual({});
  });

  it("invalid JSON payload -> {}", () => {
    const dc = new DownloadableContent();
    dc.payload = "{not valid json";
    expect(dc.getPayload()).toEqual({});
  });

  it("non-object JSON (array) payload -> {}", () => {
    const dc = new DownloadableContent();
    dc.payload = JSON.stringify([1, 2, 3]);
    expect(dc.getPayload()).toEqual({});
  });

  it("non-object JSON (number) payload -> {}", () => {
    const dc = new DownloadableContent();
    dc.payload = "42";
    expect(dc.getPayload()).toEqual({});
  });
});

describe("DownloadableContent.fromResource — field mapping", () => {
  it("copies uuid/name/category/contentKey/sha256 through", () => {
    const resource = {
      uuid: "dc-uuid-1",
      name: "Edge model v1",
      category: "edge-model",
      contentKey: "blobs/edge-model-v1.bin",
      sha256: "abc123def456",
      voided: false,
    };
    const dc = DownloadableContent.fromResource(resource);
    expect(dc.uuid).toBe("dc-uuid-1");
    expect(dc.name).toBe("Edge model v1");
    expect(dc.category).toBe("edge-model");
    expect(dc.contentKey).toBe("blobs/edge-model-v1.bin");
    expect(dc.sha256).toBe("abc123def456");
    expect(dc.voided).toBe(false);
  });
});
