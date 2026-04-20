/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：関数分割によるパーツ生成（上・中・下）
 */
const fs = require('fs');

let vCount = 0; // 全体の頂点カウント管理

// --- パーツ生成関数（部品工場） ---

// 下の段を作る関数
function drawBottom(radius, height) {
    return generateCylinderData(0, 0, 0, radius, height, 32, "Large_Bottom");
}

// 真ん中の軸を作る関数
function drawMiddle(radius, height, bottomHeight) {
    const yPos = (bottomHeight / 2) + (height / 2);
    return generateCylinderData(0, yPos, 0, radius, height, 32, "Small_Middle");
}

// 上の段を作る関数
function drawTop(radius, height, bottomHeight, middleHeight) {
    const yPos = (bottomHeight / 2) + middleHeight + (height / 2);
    return generateCylinderData(0, yPos, 0, radius, height, 32, "Large_Top");
}

// --- 共通の円柱計算ロジック（工作機械） ---
function generateCylinderData(x, y, z, r, h, segments, name) {
    let vData = [`o ${name}`, `g ${name}`];
    let fData = [];
    const h2 = h / 2;
    const base = vCount;

    // 頂点生成
    for (let i = 0; i < segments; i++) {
        const rad = (i / segments) * Math.PI * 2;
        const cx = Math.cos(rad) * r;
        const cz = Math.sin(rad) * r;
        vData.push(`v ${(x + cx).toFixed(4)} ${(y - h2).toFixed(4)} ${(z + cz).toFixed(4)}`);
        vData.push(`v ${(x + cx).toFixed(4)} ${(y + h2).toFixed(4)} ${(z + cz).toFixed(4)}`);
    }

    // 面生成
    for (let i = 0; i < segments; i++) {
        const n = (i + 1) % segments;
        const v1 = base + i * 2 + 1; const v2 = base + i * 2 + 2;
        const v3 = base + n * 2 + 2; const v4 = base + n * 2 + 1;
        fData.push(`f ${v1} ${v2} ${v4}`, `f ${v2} ${v3} ${v4}`);
        
        if (i > 0 && i < segments - 1) {
            fData.push(`f ${base+1} ${base + i*2 + 1} ${base + (n*2) + 1}`);
            fData.push(`f ${base+2} ${base + (n*2) + 2} ${base + i*2 + 2}`);
        }
    }

    vCount += segments * 2;
    return { v: vData.join("\n"), f: fData.join("\n") };
}

// --- メイン組み立て工程 ---

const bHeight = 1;
const mHeight = 5;
const tHeight = 1;

const bottom = drawBottom(10, bHeight);
const middle = drawMiddle(7.5, mHeight, bHeight);
const top = drawTop(10, tHeight, bHeight, mHeight);

// 全てを統合
const finalOBJ = [
    "# Gemini programming Unit",
    bottom.v, middle.v, top.v,
    bottom.f, middle.f, top.f
].join("\n");

fs.writeFileSync('modular_cylinders.obj', finalOBJ);

console.log("ミッション完了！関数ごとに分かれた美しいコードでOBJを生成したぞ！");
