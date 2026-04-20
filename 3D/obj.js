/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：精密ネジボルト (v番号付き出力)
 */
const fs = require('fs');
const path = require('path');

let vCount = 0;

// --- 1. パーツ組み立て関数 ---
function drawPerfectBolt(baseR, baseH, coreR, coreH, threadR, pitch) {
    let lines = [`o Integrated_Bolt_System`];
    const segments = 32;

    // A. 土台（持ち手）
    lines.push(generateCylinder(0, 0, 0, baseR, baseH, segments, "Base_Handle"));

    // B. 軸（芯）
    // 土台の上にピッタリ載るように配置
    lines.push(generateCylinder(0, baseH + (coreH / 2), 0, coreR, coreH, segments, "Core_Shaft"));

    // C. ネジ山（四角い断面の螺旋）
    lines.push(`o Screw_Thread_Spiral`);
    const turns = coreH / pitch;
    const totalSteps = Math.floor(segments * turns);
    const threadBase = vCount;

    for (let i = 0; i <= totalSteps; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const yBase = baseH + (i / totalSteps) * coreH;
        
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // ネジ山の断面を「四角形」にするために4つの頂点を作る
        const thickness = 0.8; // ネジ山の厚み（縦）
        // 芯に接する内側の上下
        lines.push(`v ${(cos * coreR).toFixed(4)} ${yBase.toFixed(4)} ${(sin * coreR).toFixed(4)}`);
        lines.push(`v ${(cos * coreR).toFixed(4)} ${(yBase + thickness).toFixed(4)} ${(sin * coreR).toFixed(4)}`);
        // 外側に突き出す上下
        lines.push(`v ${(cos * threadR).toFixed(4)} ${yBase.toFixed(4)} ${(sin * threadR).toFixed(4)}`);
        lines.push(`v ${(cos * threadR).toFixed(4)} ${(yBase + thickness).toFixed(4)} ${(sin * threadR).toFixed(4)}`);
    }

    for (let i = 0; i < totalSteps; i++) {
        const b = threadBase + i * 4;
        const n = b + 4; // 次のステップの頂点

        // 4枚の面で四角い螺旋の「帯」を作る
        lines.push(`f ${b+1} ${n+1} ${n+2} ${b+2}`); // 内側面
        lines.push(`f ${b+3} ${b+4} ${n+4} ${n+3}`); // 外側面
        lines.push(`f ${b+2} ${n+2} ${n+4} ${b+4}`); // 上面
        lines.push(`f ${b+1} ${b+3} ${n+3} ${n+1}`); // 底面
    }
    vCount += (totalSteps + 1) * 4;

    return lines.join("\n");
}

// 汎用円柱生成（上下の蓋も閉じる）
function generateCylinder(x, y, z, r, h, segments, name) {
    let cLines = [`o ${name}`];
    const h2 = h / 2;
    const base = vCount;

    for (let i = 0; i < segments; i++) {
        const rad = (i / segments) * Math.PI * 2;
        const cx = Math.cos(rad) * r;
        const cz = Math.sin(rad) * r;
        cLines.push(`v ${(x + cx).toFixed(4)} ${(y - h2).toFixed(4)} ${(z + cz).toFixed(4)}`);
        cLines.push(`v ${(x + cx).toFixed(4)} ${(y + h2).toFixed(4)} ${(z + cz).toFixed(4)}`);
    }

    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        const v1 = base + i * 2 + 1; const v2 = base + i * 2 + 2;
        const v3 = base + next * 2 + 2; const v4 = base + next * 2 + 1;
        cLines.push(`f ${v1} ${v2} ${v3} ${v4}`); // 側面
    }
    vCount += segments * 2;
    return cLines.join("\n");
}

// --- 2. ファイル書き出し（バージョニング対応） ---
function saveWithVersion(baseName, content) {
    let version = 1;
    let fileName = `${baseName}-v${version}.obj`;
    
    while (fs.existsSync(fileName)) {
        version++;
        fileName = `${baseName}-v${version}.obj`;
    }

    fs.writeFileSync(fileName, content);
    console.log(`✅ ミッション完了！ファイル保存： ${fileName}`);
}

// 実行（土台R10 H5 / 芯R4 H40 / ネジ山R7 ピッチ5）
const boltData = drawPerfectBolt(10, 5, 4, 40, 7, 5);
saveWithVersion('perfect_bolt', boltData);
