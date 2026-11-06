import assert from "node:assert/strict";
import { test } from "node:test";
import Module from "node:module";
const back = {};
let actions: string[] = [];
let messages: string[] = [];
const updates: Record<string, unknown> = {};
const windowMock: any = {
 showWarningMessage: (s: string) => { messages.push(s); },
 showErrorMessage: (s: string) => { messages.push(s); },
 showInformationMessage: (s: string) => { messages.push(s); },
 withProgress: async (_: unknown, cb: any) => cb({report() {}}),
 createQuickPick: () => {
   const action = actions.shift();
   const qp: any = { items: [], selectedItems: [], activeItems: [], buttons: [],
     onDidTriggerButton(cb: any) { this.button = cb; }, onDidAccept(cb: any) { this.accept = cb; },
     onDidHide(cb: any) { this.hide = cb; }, dispose() {},
     show() { setTimeout(() => {
       if (action === "cancel") this.hide();
       if (action === "accept") { this.selectedItems = [this.items[0]]; this.accept(); }
       if (action === "back") this.button(back);
       if (action === "refresh") this.button(this.buttons[this.buttons.length - 1]);
     }, 10); }
   }; return qp;
 }
};
const vscodeMock: any = {window: windowMock, ThemeIcon: class {}, QuickInputButtons: {Back: back}, ProgressLocation: {Notification: 1}, extensions: {getExtension: () => ({packageJSON: {version: "test"}})}, workspace: {workspaceFolders: [{}], getConfiguration: () => ({get: (k: string, fallback: unknown) => updates[k] ?? fallback, update: async (k: string, v: unknown) => {updates[k] = v;}})}, ConfigurationTarget: {Workspace: 2, Global: 1}};
const loader = Module as unknown as {_load: (...args: any[]) => any}; const old = loader._load;
loader._load = function(request: string, ...rest: any[]) { return request === "vscode" ? vscodeMock : old.call(this, request, ...rest); };
vscodeMock.EventEmitter = class { event() {} fire() {} };
vscodeMock.TreeItem = class { constructor(public label: string, public collapsibleState: number) {} };
vscodeMock.TreeItemCollapsibleState = {None: 0, Collapsed: 1, Expanded: 2};
vscodeMock.ThemeColor = class {};
vscodeMock.TreeItemCheckboxState = {Unchecked: 0, Checked: 1};
const {selectProject, syncToApifox} = require("../apifox/uploader");
const {ApiTreeProvider} = require("../providers/ApiTreeProvider");
const {getToken, setToken} = require("../config/secret");
loader._load = old;
const team = {id: 1, name: "Team"}; const project = {id: 10, name: "Project"};
test("selectProject handles empty teams and cancellation", async () => {
 actions = []; messages = []; assert.equal(await selectProject({listTeams: async () => []}), false); assert.ok(messages.some(s => s.includes("团队")));
 actions = ["cancel"]; assert.equal(await selectProject({listTeams: async () => [team]}), false);
});
test("empty projects can return to team selection and save", async () => {
 let calls = 0; actions = ["accept", "accept", "accept", "accept"];
 const result = await selectProject({listTeams: async () => [team], listTeamProjects: async () => ++calls === 1 ? [] : [project]});
 assert.equal(result, true); assert.equal(calls, 2); assert.equal(updates.projectId, 10);
});
test("back button and project cancel are handled", async () => {
 actions = ["accept", "back", "accept", "cancel"];
 assert.equal(await selectProject({listTeams: async () => [team], listTeamProjects: async () => [project]}), false);
});
test("refresh failure ends team selection with an error", async () => {
 let calls = 0; messages = []; actions = ["refresh"];
 assert.equal(await selectProject({listTeams: async () => { if (++calls > 1) throw new Error("refresh failed"); return [team]; }}), false);
 assert.ok(messages.some(s => s.includes("refresh failed")));
});
test("extension forwards invalid conflict values and omits deleteUnmatchedResources", async () => {
 let options: any; const client = {importOpenapi: async (_id: unknown, _spec: unknown, opts: unknown) => {options = opts; return {counters: {}, errors: []};}};
 const settings = {projectId: 10, schemaFolderId: 0, schemaFolderName: "", endpointConflictBehavior: "INVALID", schemaConflictBehavior: "INVALID", updateFolderOfChangedEndpoint: true};
 await syncToApifox(client, settings, {spec: {}, endpoints: [{}], warnings: []});
 assert.equal(options.endpointOverwriteBehavior, "INVALID"); assert.equal(options.schemaOverwriteBehavior, "INVALID");
 assert.equal(Object.hasOwn(options, "deleteUnmatchedResources"), false);
});

test("clearing a token deletes it and getToken returns undefined", async () => {
 const store = new Map<string,string>(); const secrets = {get: async (k: string) => store.get(k), store: async (k: string, v: string) => {store.set(k,v);}, delete: async (k: string) => {store.delete(k);}};
 await setToken(secrets, " token "); assert.equal(await getToken(secrets), "token"); await setToken(secrets, undefined); assert.equal(await getToken(secrets), undefined);
});
test("tree refresh retains user expansion state", async () => {
 const ep = {method: "GET", path: "/x", controller: "C", operationId: "x"}; let count = 0;
 const state = {get: (_k: string, fallback: unknown) => fallback, update: async () => {}};
 const tree = new ApiTreeProvider(async () => {count++; return {endpoints: [ep]};}, () => "group", state);
 await tree.refresh(); let folder = tree.getChildren().find((n: any) => n.kind === "folder");
 assert.equal(tree.getTreeItem(folder).collapsibleState, 1); tree.setFolderUserExpanded("group", true);
 await tree.refresh(); folder = tree.getChildren().find((n: any) => n.kind === "folder");
 assert.equal(tree.getTreeItem(folder).collapsibleState, 2); assert.equal(count, 2);
});

test("project refresh failure returns to teams and allows cancellation", async () => {
 let calls = 0; messages = []; actions = ["accept", "refresh", "cancel"];
 const result = await selectProject({listTeams: async () => [team], listTeamProjects: async () => { if (++calls === 2) throw new Error("project refresh failed"); return [project]; }});
 assert.equal(result, false); assert.equal(calls, 2); assert.ok(messages.some(s => s.includes("project refresh failed")));
});
