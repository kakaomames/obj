/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：持ち手付き物理ネジセットの生成
 */
const fs = require('fs');

let vCount = 0;

// --- 1. ボルト全体（頭 + ネジ部）を作る関数 ---
function drawHandBolt(radius, height, pitch) {
    let boltParts = [];
    // 持ち手（六角形の頭）
    boltParts.push(generateCylinder(0, -2, 0, radius * 2, 2, 6, "Bolt_Head"));
    // ネジ本体
    boltParts.push(generateScrew(0, 0, 0, radius, height, pitch, "Bolt_Thread"));
    return boltParts.join("\n");
}

// --- 2. ナット全体（ネジ穴 + 外枠）を作る関数 ---
function drawHandNut(radius, height, pitch) {
    const clearance = 0.3; // A1 mini用の隙間
    let nutParts = [];
    // ナットの外枠（六角形）
    nutParts.push(generateCylinder(20, 0, 0, radius * 2.5, height, 6, "Nut_Outer"));
    // 中のネジ穴（これまでのネジロジックを流用）
    nutParts.push(generateScrew(20, 0, 0, radius + clearance, height, pitch, "Nut_Internal_Thread"));
    return nutParts.join("\n");
}

// --- 3. 汎用円柱生成（頭の部分に使用） ---
function generateCylinder(x, y, z, r, h, segments, name) {
    let lines = [`o ${name}`];
    const h2 = h / 2;
    const base = vCount;
    for (let i = 0; i < segments; i++) {
        const rad = (i / segments) * Math.PI * 2;
        const cx = Math.cos(rad) * r;
        const cz = Math.sin(rad) * r;
        lines.push(`v ${(x + cx).toFixed(4)} ${(y - h2).toFixed(4)} ${(z + cz).toFixed(4)}`);
        lines.push(`v ${(x + cx).toFixed(4)} ${(y + h2).toFixed(4)} ${(z + cz).toFixed(4)}`);
    }
    for (let i = 0; i < segments; i++) {
        const n = (i + 1) % segments;
        const v1 = base + i * 2 + 1; const v2 = base + i * 2 + 2;
        const v3 = base + n * 2 + 2; const v4 = base + n * 2 + 1;
        lines.push(`f ${v1} ${v2} ${v4}`, `f ${v2} ${v3} ${v4}`);
    }
    vCount += segments * 2;
    return lines.join("\n");
}

// --- 4. ネジ螺旋生成コアロジック ---
function generateScrew(x, y, z, r, h, pitch, name) {
    let lines = [`o ${name}`];
    const segments = 24;
    const turns = h / pitch;
    const totalSteps = Math.floor(segments * turns);
    const base = vCount;

    for (let i = 0; i <= totalSteps; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const currY = (i / totalSteps) * h;
        // ネジ山を三角形にするためのオフセット
        const radialOffset = (i % 2 === 0) ? 0.8 : 0; 
        
        lines.push(`v ${(x + Math.cos(angle) * (r + radialOffset)).toFixed(4)} ${(y + currY).toFixed(4)} ${(z + Math.sin(angle) * (r + radialOffset)).toFixed(4)}`);
        lines.push(`v ${(x + Math.cos(angle) * r).toFixed(4)} ${(y + currY).toFixed(4)} ${(z + Math.sin(angle) * r).toFixed(4)}`);
    }

    for (let i = 0; i < totalSteps; i++) {
        const v1 = base + i * 2 + 1; const v2 = base + i * 2 + 2;
        const v3 = base + (i + 1) * 2 + 2; const v4 = base + (i + 1) * 2 + 1;
        lines.push(`f ${v1} ${v2} ${v4}`, `f ${v2} ${v3} ${v4}`);
    }

    vCount += (totalSteps + 1) * 2;
    return lines.join("\n");
}

// --- 実行 ---
const boltData = drawHandBolt(5, 20, 3);
const nutData = drawHandNut(5, 10, 3);

const finalOBJ = ["# Gemini programming Unit", boltData, nutData].join("\n");
fs.writeFileSync('functional_screw.obj', finalOBJ);

console.log("✅ ミッション完了！持ち手付きの 'functional_screw.obj' を書き出したぞ！");
