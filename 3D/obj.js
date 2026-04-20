/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：滑らかなネジ山・完全閉鎖・自動連番出力
 */
const fs = require('fs');
const path = require('path');

let vCount = 0;

function drawUltimateBolt(baseR, baseH, coreR, coreH, threadR, pitch) {
    let lines = [`o Integrated_Bolt_v2`];
    const segments = 32;

    // 1. 土台 (Base)
    lines.push(generateCylinder(0, baseH / 2, 0, baseR, baseH, segments, "Base_Handle"));

    // 2. 軸 (Core) - 土台の上から配置
    lines.push(generateCylinder(0, baseH + (coreH / 2), 0, coreR, coreH, segments, "Core_Shaft"));

    // 3. 滑らかなネジ山 (Thread)
    lines.push(`o Screw_Thread_Smooth`);
    const turns = coreH / pitch;
    const totalSteps = Math.floor(segments * turns);
    const threadBase = vCount;

    for (let i = 0; i <= totalSteps; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const yBase = baseH + (i / totalSteps) * coreH;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const thickness = 0.6; // ネジ山の厚み

        // 断面の4頂点（芯側2つ、外側2つ）
        lines.push(`v ${(cos * coreR).toFixed(4)} ${yBase.toFixed(4)} ${(sin * coreR).toFixed(4)}`); // 内下
        lines.push(`v ${(cos * coreR).toFixed(4)} ${(yBase + thickness).toFixed(4)} ${(sin * coreR).toFixed(4)}`); // 内上
        lines.push(`v ${(cos * threadR).toFixed(4)} ${yBase.toFixed(4)} ${(sin * threadR).toFixed(4)}`); // 外下
        lines.push(`v ${(cos * threadR).toFixed(4)} ${(yBase + thickness).toFixed(4)} ${(sin * threadR).toFixed(4)}`); // 外上
    }

    for (let i = 0; i < totalSteps; i++) {
        const b = threadBase + i * 4;
        const n = b + 4; // 次のステップの頂点へ繋ぐ

        // 面の構築（法線を外側に向ける順番）
        lines.push(`f ${b+1} ${n+1} ${n+2} ${b+2}`); // 内壁
        lines.push(`f ${b+3} ${b+4} ${n+4} ${n+3}`); // 外壁
        lines.push(`f ${b+2} ${n+2} ${n+4} ${b+4}`); // 上スロープ
        lines.push(`f ${b+1} ${b+3} ${n+3} ${n+1}`); // 底スロープ
    }
    vCount += (totalSteps + 1) * 4;

    return lines.join("\n");
}

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
        cLines.push(`f ${v1} ${v2} ${v3} ${v4}`);
    }
    vCount += segments * 2;
    return cLines.join("\n");
}

function saveWithVersion(baseName, content) {
    let version = 1;
    let fileName = `${baseName}-v${version}.obj`;
    while (fs.existsSync(fileName)) { version++; fileName = `${baseName}-v${version}.obj`; }
    fs.writeFileSync(fileName, content);
    console.log(`✅ ${fileName} を生成！`);
}

// 実行
const boltData = drawUltimateBolt(10, 5, 4, 40, 7, 5);
saveWithVersion('perfect_bolt', boltData);
