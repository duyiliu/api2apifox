// 已安装 VSIX 的 Extension Host 断言,由 scripts/test-vsix-install.mjs 通过
// --extensionTestsPath 注入执行;run() 抛错即测试失败。
// 该模块运行在隔离 profile 中:extensionDevelopmentPath 指向 vsix 在
// --extensions-dir 里解出的安装目录,因此加载的就是安装产物本身;
// extensionUri 断言进一步确认它不是仓库源码或其他位置的同名扩展。
"use strict";

const assert = require("node:assert/strict");

exports.run = async function run() {
  const vscode = require("vscode");

  const expectedId = process.env.API2APIFOX_EXPECT_ID || "duyiliu.api2apifox";
  const expectedVersion = process.env.API2APIFOX_EXPECT_VERSION || "";
  const extensionsDir = (process.env.API2APIFOX_EXTENSIONS_DIR || "").toLowerCase();

  const extension = vscode.extensions.getExtension(expectedId);
  assert.ok(extension, `扩展 ${expectedId} 未在已安装列表中`);
  assert.ok(
    extensionsDir && extension.extensionUri.fsPath.toLowerCase().startsWith(extensionsDir),
    `扩展未从隔离 extensions-dir 加载:${extension.extensionUri.fsPath}`
  );

  const manifest = extension.packageJSON;
  if (expectedVersion) {
    assert.equal(manifest.version, expectedVersion, `已安装版本不一致:${manifest.version}`);
  }

  await extension.activate();
  assert.ok(extension.isActive, "activate() 后 isActive 仍为 false");
  console.log(`ACTIVATION_OK id=${expectedId} version=${manifest.version}`);

  const contributed = (manifest.contributes?.commands ?? []).map((item) => item.command);
  assert.ok(contributed.length > 0, "manifest 未声明任何命令");
  const registered = await vscode.commands.getCommands(true);
  const missing = contributed.filter((command) => !registered.includes(command));
  assert.deepEqual(missing, [], `命令未注册:${missing.join(", ")}`);
  console.log(`COMMANDS_OK total=${contributed.length}`);

  console.log("VSIX_ACTIVATION_TEST_OK");
};
