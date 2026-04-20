/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：扇型（252度）パーツの生成と断面の封鎖
 */
const fs = require('fs');

let vCount = 0;

// --- 1. 各パーツの関数 ---

function drawBottom(radius, height) {
    // 角度を 252/360 に制限
    return generateArcComponent(0, 0, 0, radius, height, 32, (252/360), "Bottom_Fan");
}

function drawMiddle(radius, height, bottomH) {
    // 真ん中は完全な円柱
    return generateArcComponent(0, (bottomH/2 + height/2), 0, radius, height, 32, 1.0, "Middle_Shaft");
}

function drawTop(radius, height, bottomH, middleH) {
    const yPos = (bottomH / 2) + middleH + (height / 2);
    // 上も扇形
    return generateArcComponent(0, yPos, 0, radius, height, 32, (252/360), "Top_Fan");
}

// --- 2. 扇型・円柱生成コアロジック ---
function generateArcComponent(x, y, z, r, h, segments, ratio, name) {
    let lines = [];
    lines.push(`o ${name}`);
    
    const h2 = h / 2;
    const base = vCount;
    const actualSegments = Math.floor(segments * ratio); // 描画する分割数

    // 頂点生成（円周部分）
    for (let i = 0; i <= actualSegments; i++) {
        const rad = (i / segments) * Math.PI * 2; // 全体360度に対する割合で計算
        const cx = Math.cos(rad) * r;
        const cz = Math.sin(rad) * r;
        lines.push(`v ${(x + cx).toFixed(4)} ${(y - h2).toFixed(4)} ${(z + cz).toFixed(4)}`); // 底面
        lines.push(`v ${(x + cx).toFixed(4)} ${(y + h2).toFixed(4)} ${(z + cz).toFixed(4)}`); // 上面
    }
    
    // 中心点の頂点（断面を塞ぐためと、上下の蓋のために必要）
    const centerBase = base + (actualSegments + 1) * 2;
    lines.push(`v ${x.toFixed(4)} ${(y - h2).toFixed(4)} ${z.toFixed(4)}`); // 底面中心
    lines.push(`v ${x.toFixed(4)} ${(y + h2).toFixed(4)} ${z.toFixed(4)}`); // 上面中心

    // 面生成（側面）
    for (let i = 0; i < actualSegments; i++) {
        const v1 = base + i * 2 + 1; const v2 = base + i * 2 + 2;
        const v3 = base + (i + 1) * 2 + 2; const v4 = base + (i + 1) * 2 + 1;
        lines.push(`f ${v1} ${v2} ${v3} ${v4}`);
        
        // 上下の蓋（扇の面）
        lines.push(`f ${centerBase + 1} ${v4} ${v1}`); // 底面
        lines.push(`f ${centerBase + 2} ${v2} ${v3}`); // 上面
    }

    // 断面を塞ぐ面（扇の切り口）
    const firstV1 = base + 1; const firstV2 = base + 2;
    const lastV1 = base + actualSegments * 2 + 1; const lastV2 = base + actualSegments * 2 + 2;
    
    lines.push(`f ${centerBase + 1} ${centerBase + 2} ${firstV2} ${firstV1}`); // 開始位置の断面
    lines.push(`f ${centerBase + 1} ${lastV1} ${lastV2} ${centerBase + 2}`); // 終了位置の断面

    vCount += (actualSegments + 1) * 2 + 2;
    return lines.join("\n");
}

// --- 3. 組み立て ---
const bH = 1.0; const mH = 5.0; const tH = 1.0;
const finalOBJ = [
    "# Gemini programming Unit",
    "# 扇型造形ミッション (252度)",
    drawBottom(10, bH),
    drawMiddle(7.5, mH, bH),
    drawTop(10, tH, bH, mH)
].join("\n");

fs.writeFileSync('fan_cylinders.obj', finalOBJ);
console.log("ミッション完了！ 252度の扇型パーツを含む 'fan_cylinders.obj' を生成したぞ。");
