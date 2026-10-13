import { describe, it, expect } from "vitest";
import {
  abiFromAssetName,
  mapAssetsToApks,
  pickLatestRelease,
  versionFromTag,
} from "@/lib/release";

describe("abiFromAssetName", () => {
  it("maps known APK names to ABIs", () => {
    expect(abiFromAssetName("toolz-app-arm64-v8a.apk")).toBe("arm64-v8a");
    expect(abiFromAssetName("toolz-app-armeabi-v7a.apk")).toBe("armeabi-v7a");
    expect(abiFromAssetName("toolz-app-x86_64.apk")).toBe("x86_64");
    expect(abiFromAssetName("toolz-app-x86.apk")).toBe("x86");
  });

  it("checks x86_64 before x86", () => {
    expect(abiFromAssetName("app-x86_64.apk")).toBe("x86_64");
  });

  it("rejects non-APK assets", () => {
    expect(abiFromAssetName("sources.zip")).toBeNull();
    expect(abiFromAssetName("release-notes.txt")).toBeNull();
    expect(abiFromAssetName("app-arm64.apk.sig")).toBeNull();
  });
});

describe("mapAssetsToApks", () => {
  it("returns one entry per ABI in stable order", () => {
    const apks = mapAssetsToApks([
      { name: "toolz-app-x86.apk", browser_download_url: "https://x/x86" },
      { name: "toolz-app-arm64-v8a.apk", browser_download_url: "https://x/arm64" },
    ]);
    expect(apks.map((a) => a.abi)).toEqual(["arm64-v8a", "x86"]);
  });

  it("keeps the most-downloaded duplicate per ABI", () => {
    const apks = mapAssetsToApks([
      { name: "a-arm64-v8a.apk", browser_download_url: "https://x/old", download_count: 3 },
      { name: "b-arm64-v8a.apk", browser_download_url: "https://x/new", download_count: 30 },
    ]);
    expect(apks).toHaveLength(1);
    expect(apks[0].downloadUrl).toBe("https://x/new");
  });

  it("skips assets without a download URL", () => {
    expect(
      mapAssetsToApks([{ name: "toolz-app-arm64-v8a.apk", browser_download_url: "" }])
    ).toHaveLength(0);
  });
});

describe("pickLatestRelease", () => {
  it("skips drafts and prefers stable over prerelease", () => {
    const draft = { tag_name: "v9", draft: true };
    const beta = { tag_name: "v2", prerelease: true };
    const stable = { tag_name: "v1" };
    expect(pickLatestRelease([draft, beta, stable])).toBe(stable);
  });

  it("falls back to prerelease when no stable exists", () => {
    const beta = { tag_name: "v2", prerelease: true };
    expect(pickLatestRelease([beta])).toBe(beta);
  });

  it("returns null for empty input", () => {
    expect(pickLatestRelease([])).toBeNull();
  });
});

describe("versionFromTag", () => {
  it("strips prefixes and suffixes", () => {
    expect(versionFromTag("v1.1.6")).toBe("1.1.6");
    expect(versionFromTag("v1.1.6 (BETA)")).toBe("1.1.6");
    expect(versionFromTag("release-2.0")).toBe("2.0");
  });

  it("returns empty string for garbage", () => {
    expect(versionFromTag(undefined)).toBe("");
    expect(versionFromTag("latest")).toBe("");
  });
});
