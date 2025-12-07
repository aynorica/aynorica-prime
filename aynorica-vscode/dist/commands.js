"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
class CommandManager {
    constructor(context, registryReader, workspaceRoot) {
        this.context = context;
        this.registryReader = registryReader;
        this.workspaceRoot = workspaceRoot;
    }
    register() {
        this.context.subscriptions.push(vscode.commands.registerCommand("aynorica.showNetwork", this.showNetwork.bind(this)), vscode.commands.registerCommand("aynorica.syncBrainState", this.syncBrainState.bind(this)), vscode.commands.registerCommand("aynorica.deployNode", this.deployNode.bind(this)), vscode.commands.registerCommand("aynorica.loadNode", this.loadNode.bind(this)), vscode.commands.registerCommand("aynorica.quickActions", this.quickActions.bind(this)), vscode.commands.registerCommand("aynorica.refreshRegistry", this.refreshRegistry.bind(this)));
    }
    async showNetwork() {
        const registry = this.registryReader.read();
        if (!registry) {
            vscode.window.showErrorMessage("Registry not found. Run ay:sync to initialize.");
            return;
        }
        const tree = this.buildNetworkTree(registry);
        const doc = await vscode.workspace.openTextDocument({
            content: tree,
            language: "markdown",
        });
        await vscode.window.showTextDocument(doc);
    }
    buildNetworkTree(registry) {
        const currentNode = this.registryReader.getCurrentNode();
        let output = "# Aynorica Network\n\n";
        output += `**Total Nodes:** ${Object.keys(registry.nodes).length}\n`;
        output += `**Prime Node:** ${registry.primeNode}\n\n`;
        output += "---\n\n";
        for (const [nodeId, node] of Object.entries(registry.nodes)) {
            const isCurrent = currentNode === nodeId;
            const marker = isCurrent
                ? "📍"
                : node.children.length > 0
                    ? "📦"
                    : "📄";
            output += `${marker} **${nodeId}**${isCurrent ? " ← YOU ARE HERE" : ""}\n`;
            output += `  - **Branch:** ${node.branch}\n`;
            output += `  - **Parent:** ${node.parent || "None (root)"}\n`;
            output += `  - **Children:** ${node.children.length > 0 ? node.children.join(", ") : "None"}\n`;
            output += `  - **Status:** ${node.status}\n`;
            output += `  - **Description:** ${node.description}\n`;
            output += `  - **Last Sync:** ${node.lastSync}\n\n`;
        }
        return output;
    }
    async syncBrainState() {
        const answer = await vscode.window.showInformationMessage("Sync brain state to GitHub?", "Yes", "No");
        if (answer !== "Yes") {
            return;
        }
        try {
            const gitDir = path.join(this.workspaceRoot, ".github");
            // Check if there are changes
            try {
                (0, child_process_1.execSync)("git diff --quiet .github/", {
                    cwd: this.workspaceRoot,
                });
                vscode.window.showInformationMessage("No changes to sync.");
                return;
            }
            catch {
                // Changes exist, continue
            }
            (0, child_process_1.execSync)("git add .github/", { cwd: this.workspaceRoot });
            (0, child_process_1.execSync)('git commit -m "chore: sync brain state"', {
                cwd: this.workspaceRoot,
            });
            (0, child_process_1.execSync)("git push", { cwd: this.workspaceRoot });
            vscode.window.showInformationMessage("✅ Brain state synced to GitHub");
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Sync failed: ${errorMsg}`);
        }
    }
    async deployNode() {
        const specialty = await vscode.window.showInputBox({
            prompt: "Node specialty (e.g., nestjs, security, frontend)",
            placeHolder: "nestjs",
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return "Specialty cannot be empty";
                }
                if (!/^[a-z0-9-]+$/.test(value)) {
                    return "Use lowercase letters, numbers, and hyphens only";
                }
                return null;
            },
        });
        if (!specialty) {
            return;
        }
        // Open chat with command pre-filled
        vscode.commands.executeCommand("workbench.action.chat.open", {
            query: `ay:deploy ${specialty}`,
        });
    }
    async loadNode() {
        const registry = this.registryReader.read();
        if (!registry) {
            vscode.window.showErrorMessage("Registry not found");
            return;
        }
        const currentNode = this.registryReader.getCurrentNode();
        const nodeIds = Object.keys(registry.nodes).filter((id) => id !== currentNode);
        if (nodeIds.length === 0) {
            vscode.window.showInformationMessage("No other nodes to load");
            return;
        }
        const items = nodeIds.map((id) => ({
            label: id,
            description: registry.nodes[id].description,
            detail: `Branch: ${registry.nodes[id].branch}`,
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: "Select node to load into context",
        });
        if (!selected) {
            return;
        }
        // Open chat with command pre-filled
        vscode.commands.executeCommand("workbench.action.chat.open", {
            query: `ay:load ${selected.label}`,
        });
    }
    async refreshRegistry() {
        const answer = await vscode.window.showInformationMessage("Sync with parent to update network registry?", "Yes", "No");
        if (answer !== "Yes") {
            return;
        }
        try {
            // Read aynorica-config.json to get parent branch
            const configPath = path.join(this.workspaceRoot, ".github", "aynorica-config.json");
            if (!fs.existsSync(configPath)) {
                vscode.window.showErrorMessage("aynorica-config.json not found");
                return;
            }
            const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
            const parentBranch = config.parentBranch || "main";
            const remoteName = config.remote?.name || "aynorica-brain";
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Refreshing registry...",
                cancellable: false,
            }, async (progress) => {
                progress.report({ message: "Fetching from parent..." });
                (0, child_process_1.execSync)(`git fetch ${remoteName} ${parentBranch}`, {
                    cwd: this.workspaceRoot,
                });
                progress.report({ message: "Rebasing..." });
                (0, child_process_1.execSync)(`git rebase ${remoteName}/${parentBranch}`, {
                    cwd: this.workspaceRoot,
                });
            });
            vscode.window.showInformationMessage("✅ Registry updated");
            // Trigger status bar refresh
            vscode.commands.executeCommand("aynorica.refreshStatus");
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Refresh failed: ${errorMsg}`);
        }
    }
    async quickActions() {
        const actions = [
            { label: "🌐 Show Network", command: "aynorica.showNetwork" },
            {
                label: "⬆️ Sync Brain State",
                command: "aynorica.syncBrainState",
            },
            { label: "🚀 Deploy New Node", command: "aynorica.deployNode" },
            { label: "📥 Load Node Context", command: "aynorica.loadNode" },
            {
                label: "🔄 Refresh Registry",
                command: "aynorica.refreshRegistry",
            },
        ];
        const selected = await vscode.window.showQuickPick(actions, {
            placeHolder: "Aynorica Quick Actions",
        });
        if (selected) {
            vscode.commands.executeCommand(selected.command);
        }
    }
}
exports.CommandManager = CommandManager;
//# sourceMappingURL=commands.js.map