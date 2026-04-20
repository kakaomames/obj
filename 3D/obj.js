/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：極薄シェル（殻）構造のネジ・面のみ生成
 */
const fs = require('fs');

let vCount = 0;

// --- 1. 極薄ボルト（面のみ、中空） ---
function drawThinBolt(radius, height, pitch) {
    // 縦（height）を小さく、横（radius）を大きく設定
    return generateHollowScrew(0, 0, 0, radius, height, pitch, "Thin_Screw_Surface");
}

// --- 2. 極薄ナット（面のみ、外枠なし） ---
function drawThinNut(radius, height, pitch) {
    const clearance = 0.3;
    return generateHollowScrew(radius * 2.5, 0, 0, radius + clearance, height, pitch, "Thin_Nut_Surface");
}

// --- 3. 中空・表面特化ネジロジック ---
function generateHollowScrew(x, y, z, r, h, pitch, name) {
    let lines = [`o ${name}`];
    const segments = 32; // 面を滑らかにするために分割数をアップ
    const turns = h / pitch;
    const totalSteps = Math.floor(segments * turns);
    const base = vCount;

    // 頂点の生成：表面の「線」だけを定義
    for (let i = 0; i <= totalSteps; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const currY = (i / totalSteps) * h;
        
        // ギザギザの面を作るための2つの頂点（外側と内側）
        // 縦（高さ）がない場合、ここを極限まで近づける
        const radialOffset = (i % 2 === 0) ? 0.5 : 0; 
        
        const cx = Math.cos(angle) * (r + radialOffset);
        const cz = Math.sin(angle) * (r + radialOffset);
        
        // 表面の皮を作るための頂点
        lines.push(`v ${(x + cx).toFixed(4)} ${(y + currY).toFixed(4)} ${(z + cz).toFixed(4)}`);
        lines.push(`v ${(x + Math.cos(angle) * r).toFixed(4)} ${(y + currY).toFixed(4)} ${(z + Math.sin(angle) * r).toFixed(4)}`);
    }

    // 面の生成：中心点へ繋がず、表面の「帯」だけを作る
    for (let i = 0; i < totalSteps; i++) {
        const v1 = base + i * 2 + 1;
        const v2 = base + i * 2 + 2;
        const v3 = base + (i + 1) * 2 + 2;
        const v4 = base + (i + 1) * 2 + 1;
        
        // 表面のポリゴンを張る
        lines.push(`f ${v1} ${v2} ${v3} ${v4}`);
    }

    vCount += (totalSteps + 1) * 2;
    return lines.join("\n");
}

// --- 実行：縦がない（薄い）設定 ---
const radius = 15.0; // 横は大きく（15mm）
const height = 2.0;  // 縦は極薄（2mm）
const pitch = 1.0;   // ピッチも細かく

const thinBolt = drawThinBolt(radius, height, pitch);
const thinNut = drawThinNut(radius, height, pitch);

const finalOBJ = [
    "# Gemini programming Unit",
    "# 極薄・表面のみネジモデル",
    thinBolt,
    thinNut
].join("\n");

fs.writeFileSync('thin_surface_screw.obj', finalOBJ);

console.log("✅ ミッション完了！ 'thin_surface_screw.obj' を書き出したぞ。");
