/**
 * B4：Maven 本地仓库发现链（src/java/jarIndex.ts discoverMavenRepos）。
 *
 * 此前该函数只靠“本机真实 ~/.m2 / JetBrains 配置”触发，测试环境里几乎不可达，
 * 是 jarIndex 变异测试 no-coverage 的主要来源。这里用**临时假仓库**完整覆盖：
 *   1. 用户配置的仓库路径（存在/不存在/重复）
 *   2. JetBrains options 下的 path.macros.xml（MAVEN_REPOSITORY 宏）
 *   3. JetBrains mavenIndicesState.xml（本地 entry 保留、http 远程 entry 跳过）
 *   4. ~/.m2/settings.xml 的 <localRepository>
 *   5. 默认 ~/.m2/repository
 *
 * 隔离方式：把 USERPROFILE/HOME/APPDATA 指向临时目录，全程不读取、不修改真实 .m2。
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { discoverMavenRepos } from "../java/jarIndex";

interface FakeHome {
  root: string;
  home: string;
  appData: string;
  cleanup: () => void;
}

/** 建临时 home + APPDATA，并临时改写进程环境变量（测试结束恢复原值） */
function fakeHome(): FakeHome {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "api2apifox-jar-discovery-"));
  const home = path.join(root, "home");
  const appData = path.join(root, "appdata");
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(appData, { recursive: true });
  const saved = { USERPROFILE: process.env.USERPROFILE, HOME: process.env.HOME, APPDATA: process.env.APPDATA };
  process.env.USERPROFILE = home;
  process.env.HOME = home;
  process.env.APPDATA = appData;
  return {
    root,
    home,
    appData,
    cleanup: () => {
      for (const [key, value] of Object.entries(saved)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

function mkdir(dir: string): string {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeFile(file: string, content: string): string {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

test("discoverMavenRepos:空环境不抛错，真实 ~/.m2 不存在时返回空列表", async () => {
  const fh = fakeHome();
  try {
    // 假 home 下没有任何 .m2 / JetBrains 配置
    assert.deepEqual(await discoverMavenRepos([]), []);
  } finally {
    fh.cleanup();
  }
});

test("discoverMavenRepos:用户配置仓库保留存在的目录，跳过不存在的路径并去重", async () => {
  const fh = fakeHome();
  try {
    const repo = mkdir(path.join(fh.root, "custom-repo"));
    const missing = path.join(fh.root, "does-not-exist");
    const found = await discoverMavenRepos([repo, missing, repo, ""]);
    assert.deepEqual(found, [repo]);
  } finally {
    fh.cleanup();
  }
});

test("discoverMavenRepos:JetBrains path.macros.xml 的 MAVEN_REPOSITORY 宏被识别", async () => {
  const fh = fakeHome();
  try {
    const repo = mkdir(path.join(fh.root, "idea-macro-repo"));
    const options = path.join(fh.appData, "JetBrains", "IntelliJIdea2024.1", "options");
    writeFile(
      path.join(options, "path.macros.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>
<application>
  <component name="PathMacrosImpl">
    <macro name="MAVEN_REPOSITORY" value="${repo}" />
  </component>
</application>`
    );
    assert.deepEqual(await discoverMavenRepos([]), [repo]);
  } finally {
    fh.cleanup();
  }
});

test("discoverMavenRepos:JetBrains mavenIndicesState.xml 只收本地 entry，跳过 http 远程仓库", async () => {
  const fh = fakeHome();
  try {
    const local = mkdir(path.join(fh.root, "idea-index-repo"));
    const options = path.join(fh.appData, "JetBrains", "IntelliJIdea2024.1", "options");
    writeFile(
      path.join(options, "mavenIndicesState.xml"),
      `<application>
  <component name="MavenIndicesState">
    <option name="index">
      <map>
        <entry key="${local}">
          <value><option name="lastUpdated" value="1" /></value>
        </entry>
        <entry key="https://repo.maven.apache.org/maven2">
          <value><option name="lastUpdated" value="1" /></value>
        </entry>
      </map>
    </option>
  </component>
</application>`
    );
    assert.deepEqual(await discoverMavenRepos([]), [local]);
  } finally {
    fh.cleanup();
  }
});

test("discoverMavenRepos:settings.xml 的 <localRepository> 优先于默认 ~/.m2/repository", async () => {
  const fh = fakeHome();
  try {
    const custom = mkdir(path.join(fh.root, "settings-repo"));
    const defaultRepo = mkdir(path.join(fh.home, ".m2", "repository"));
    writeFile(
      path.join(fh.home, ".m2", "settings.xml"),
      `<settings>
  <localRepository>${custom}</localRepository>
</settings>`
    );
    const found = await discoverMavenRepos([]);
    assert.deepEqual(found, [custom, defaultRepo], "settings.xml 声明在前，默认仓库补在后，两者都保留");
  } finally {
    fh.cleanup();
  }
});

test("discoverMavenRepos:无 settings.xml 时回落到默认 ~/.m2/repository", async () => {
  const fh = fakeHome();
  try {
    const defaultRepo = mkdir(path.join(fh.home, ".m2", "repository"));
    assert.deepEqual(await discoverMavenRepos([]), [defaultRepo]);
  } finally {
    fh.cleanup();
  }
});

test("discoverMavenRepos:settings.xml 里 localRepository 与配置项重复时只保留一份", async () => {
  const fh = fakeHome();
  try {
    const custom = mkdir(path.join(fh.root, "same-repo"));
    writeFile(
      path.join(fh.home, ".m2", "settings.xml"),
      `<settings><localRepository>${custom}</localRepository></settings>`
    );
    assert.deepEqual(await discoverMavenRepos([custom]), [custom]);
  } finally {
    fh.cleanup();
  }
});

test("discoverMavenRepos:配置项是文件而非目录时被跳过（只接受目录）", async () => {
  const fh = fakeHome();
  try {
    const file = writeFile(path.join(fh.root, "not-a-dir.txt"), "x");
    assert.deepEqual(await discoverMavenRepos([file]), []);
  } finally {
    fh.cleanup();
  }
});
