/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：OBJファイル内での完全なパーツ分離（物理造形用）
 */
const fs = require('fs');

let vCount = 0; // 頂点の通し番号（これはOBJ全体で共有する必要がある）

// --- 1. 各パーツを生成して文字列として返す関数 ---

function drawBottom(radius, height) {
    return generateComponent(0, 0, 0, radius, height, 32, "Bottom_Disc");
}

function drawMiddle(radius, height, bottomH) {
    const yPos = (bottomH / 2) + (height / 2);
    return generateComponent(0, yPos, 0, radius, height, 32, "Middle_Shaft");
}

function drawTop(radius, height, bottomH, middleH) {
    const yPos = (bottomH / 2) + middleH + (height / 2);
    return generateComponent(0, yPos, 0, radius, height, 32, "Top_Disc");
}

// --- 2. 頂点と面を「セット」で生成するコアロジック ---
function generateComponent(x, y, z, r, h, segments, name) {
    let lines = [];
    lines.push(`o ${name}`); // オブジェクト宣言
    
    const h2 = h / 2;
    const base = vCount;

    // このパーツ専用の頂点を出力
    for (let i = 0; i < segments; i++) {
        const rad = (i / segments) * Math.PI * 2;
        const cx = Math.cos(rad) * r;
        const cz = Math.sin(rad) * r;
        lines.push(`v ${(x + cx).toFixed(4)} ${(y - h2).toFixed(4)} ${(z + cz).toFixed(4)}`);
        lines.push(`v ${(x + cx).toFixed(4)} ${(y + h2).toFixed(4)} ${(z + cz).toFixed(4)}`);
    }

    // このパーツ専用の面をすぐ下に出力
    for (let i = 0; i < segments; i++) {
        const n = (i + 1) % segments;
        const v1 = base + i * 2 + 1; const v2 = base + i * 2 + 2;
        const v3 = base + n * 2 + 2; const v4 = base + n * 2 + 1;
        lines.push(`f ${v1} ${v2} ${v4}`);
        lines.push(`f ${v2} ${v3} ${v4}`);
        
        // 上下の蓋
        if (i > 0 && i < segments - 1) {
            lines.push(`f ${base+1} ${base + i*2 + 1} ${base + (n*2) + 1}`);
            lines.push(`f ${base+2} ${base + (n*2) + 2} ${base + i*2 + 2}`);
        }
    }

    vCount += segments * 2; // 次のパーツのためにカウントを更新
    return lines.join("\n");
}

// --- 3. メイン組み立て ---

const bH = 1.0; // 下段高さ
const mH = 5.0; // 中段高さ
const tH = 1.0; // 上段高さ

const bottomStr = drawBottom(10, bH);
const middleStr = drawMiddle(7.5, mH, bH);
const topStr = drawTop(10, tH, bH, mH);

// 順番に連結（o -> v -> f のセットが3つ並ぶ）
const finalOBJ = [
    "# Gemini programming Unit",
    "# Made for A1 mini Physical Printing",
    bottomStr,
    middleStr,
    topStr
].join("\n");

fs.writeFileSync('separated_cylinders.obj', finalOBJ);

console.log("ミッション完了！ 構造が完全に分離された 'separated_cylinders.obj' を生成したぞ。");
