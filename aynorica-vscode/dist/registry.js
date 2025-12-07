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
exports.RegistryReader = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
class RegistryReader {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.registryPath = path.join(workspaceRoot, ".github", "aynorica-registry.json");
    }
    read() {
        try {
            if (!fs.existsSync(this.registryPath)) {
                return null;
            }
            const content = fs.readFileSync(this.registryPath, "utf8");
            return JSON.parse(content);
        }
        catch (error) {
            console.error("Failed to read registry:", error);
            return null;
        }
    }
    getCurrentNode() {
        try {
            const branch = (0, child_process_1.execSync)("git branch --show-current", {
                cwd: this.workspaceRoot,
                encoding: "utf8",
            }).trim();
            const registry = this.read();
            if (!registry) {
                return null;
            }
            // Map branch to node
            for (const [nodeId, node] of Object.entries(registry.nodes)) {
                if (node.branch === branch) {
                    return nodeId;
                }
            }
            return null;
        }
        catch (error) {
            console.error("Failed to get current node:", error);
            return null;
        }
    }
    watch(callback) {
        this.watcher = vscode.workspace.createFileSystemWatcher(this.registryPath);
        this.watcher.onDidChange(callback);
        this.watcher.onDidCreate(callback);
        return this.watcher;
    }
    getRegistryPath() {
        return this.registryPath;
    }
}
exports.RegistryReader = RegistryReader;
//# sourceMappingURL=registry.js.map