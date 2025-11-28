#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const JSON5 = require("json5");

console.log("🚀 CRA → Vite 変換を開始します…");

//
// 1. package.json 操作
//
console.log("🧹 react-scripts を削除します…");

const pkgPath = path.join(process.cwd(), "package.json");
const pkg = JSON5.parse(fs.readFileSync(pkgPath, "utf-8"));

// scripts を Vite 用へ変換
pkg.scripts = {
  dev: "vite",
  build: "vite build",
  preview: "vite preview",
};

// react-scripts 削除
delete pkg.dependencies?.["react-scripts"];
delete pkg.devDependencies?.["react-scripts"];

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("✔ package.json を更新しました");

//
// 2. Vite インストール
//
console.log("📦 Vite をインストールします…");
const { execSync } = require("child_process");
execSync("npm install vite @vitejs/plugin-react --save-dev", { stdio: "inherit" });

//
// 3. tsconfig.json 操作（JSON5 対応版）
//
console.log("🛠 tsconfig.json を変換します…");

const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
const tsconfigRaw = fs.readFileSync(tsconfigPath, "utf-8");
let tsconfig;

try {
  tsconfig = JSON5.parse(tsconfigRaw);
} catch (e) {
  console.error("❌ tsconfig.json のパースに失敗しました");
  console.error(e.message);
  process.exit(1);
}

// 追加または上書き
tsconfig.compilerOptions = {
  ...tsconfig.compilerOptions,
  jsx: "react-jsx",
  module: "ESNext",
  moduleResolution: "bundler",
};

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
console.log("✔ tsconfig.json を更新しました");

//
// 4. index.html を public → ルート
//
console.log("📄 public/index.html をプロジェクト直下にコピー…");

if (fs.existsSync("public/index.html")) {
  fs.copyFileSync("public/index.html", "index.html");
  console.log("✔ index.html を配置しました");
} else {
  console.log("⚠ public/index.html が見つからなかったためスキップ");
}

//
// 5. vite.config.ts 生成
//
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

console.log("\n🎉 変換完了！");
console.log("次のコマンドを実行してください:");
console.log("  npm install");
console.log("  npm run dev");
