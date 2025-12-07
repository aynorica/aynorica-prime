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
exports.StatusBarManager = void 0;
const vscode = __importStar(require("vscode"));
class StatusBarManager {
    constructor(registryReader) {
        this.registryReader = registryReader;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = "aynorica.quickActions";
    }
    update() {
        const registry = this.registryReader.read();
        const currentNode = this.registryReader.getCurrentNode();
        if (!registry || !currentNode) {
            this.statusBarItem.text = "🧠 Aynorica (not initialized)";
            this.statusBarItem.tooltip = "Click to initialize or check setup";
            this.statusBarItem.show();
            return;
        }
        const nodeCount = Object.keys(registry.nodes).length;
        const node = registry.nodes[currentNode];
        const lastSync = this.formatTimeSince(node.lastSync);
        this.statusBarItem.text = `🧠 ${currentNode} | ${nodeCount} nodes | ↑ ${lastSync}`;
        this.statusBarItem.tooltip = `Current: ${currentNode}\nChildren: ${node.children.length}\nClick for quick actions`;
        this.statusBarItem.show();
    }
    formatTimeSince(isoDate) {
        try {
            const now = new Date();
            const then = new Date(isoDate);
            const diffMs = now.getTime() - then.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) {
                return "just now";
            }
            if (diffMins < 60) {
                return `${diffMins}m ago`;
            }
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) {
                return `${diffHours}h ago`;
            }
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays}d ago`;
        }
        catch (error) {
            return "unknown";
        }
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=statusBar.js.map