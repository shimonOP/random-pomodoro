#!/usr/bin/env node
/**
 * CRA → Vite 自動変換スクリプト
 * フォルダ構成を維持したまま react-scripts 依存を削除し
 * Vite + React + TS の設定を自動生成する
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 CRA → Vite 変換を開始します…");

// 1. react-scripts 削除
console.log("🧹 react-scripts を削除します…");
const pkgPath = path.join(process.cwd(), "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

if (pkg.scripts) {
  delete pkg.scripts.start;
  delete pkg.scripts.build;
  delete pkg.scripts.test;
}

pkg.scripts = {
  dev: "vite",
  build: "vite build",
  preview: "vite preview"
};

// react-scripts 削除
if (pkg.dependencies && pkg.dependencies["react-scripts"]) {
  delete pkg.dependencies["react-scripts"];
}
if (pkg.devDependencies && pkg.devDependencies["react-scripts"]) {
  delete pkg.devDependencies["react-scripts"];
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("✔ package.json を更新しました");

// 2. Vite 必要パッケージを追加
console.log("📦 Vite をインストールします…");
const { execSync } = require("child_process");
execSync("npm install vite @vitejs/plugin-react --save-dev", {
  stdio: "inherit",
});

// 3. tsconfig の修正
console.log("🛠 tsconfig.json を変換します…");

const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
let tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));

tsconfig.compilerOptions.jsx = "react-jsx";
tsconfig.compilerOptions.module = "ESNext";
tsconfig.compilerOptions.moduleResolution = "bundler";

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

console.log("✔ tsconfig.json を更新しました");

// 4. index.html がパブリックルートへ必要
console.log("📄 index.html を public → ルートへコピー");
if (fs.existsSync("public/index.html")) {
  fs.copyFileSync("public/index.html", "index.html");
}

console.log("✔ index.html を配置しました");

// 5. Vite 設定ファイル生成
console.log("📝 vite.config.ts を生成します…");

fs.writeFileSync(
  "vite.config.ts",
  `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`.trim()
);

console.log("✔ vite.config.ts を作成しました");

console.log("\n✨ 完了！\n");
console.log("次のコマンドを実行してください：");
console.log("  npm install");
console.log("  npm run dev");
