/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：土台・芯・ネジ山の一体化ボルト生成
 */
const fs = require('fs');

let vCount = 0;

function drawCompleteBolt(baseR, baseH, coreR, coreH, pitch) {
    let lines = [`o Integrated_Bolt`];
    
    // --- 1. 土台（大きい円柱）の頂点と面 ---
    const baseBottomY = 0;
    const baseTopY = baseH;
    const segments = 32;
    const baseStartV = vCount;

    for (let i = 0; i < segments; i++) {
        const rad = (i / segments) * Math.PI * 2;
        const cx = Math.cos(rad) * baseR;
        const cz = Math.sin(rad) * baseR;
        lines.push(`v ${cx.toFixed(4)} ${baseBottomY.toFixed(4)} ${cz.toFixed(4)}`);
        lines.push(`v ${cx.toFixed(4)} ${baseTopY.toFixed(4)} ${cz.toFixed(4)}`);
    }
    for (let i = 0; i < segments; i++) {
        const n = (i + 1) % segments;
        const v1 = baseStartV + i * 2 + 1; const v2 = baseStartV + i * 2 + 2;
        const v3 = baseStartV + n * 2 + 2; const v4 = baseStartV + n * 2 + 1;
        lines.push(`f ${v1} ${v2} ${v3} ${v4}`); // 側面
    }
    vCount += segments * 2;

    // --- 2. 芯（小さく高い円柱）＋ ネジ山（ぐるぐる） ---
    const threadStartV = vCount;
    const turns = coreH / pitch;
    const totalSteps = Math.floor(segments * turns);

    for (let i = 0; i <= totalSteps; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const currY = baseTopY + (i / totalSteps) * coreH; // 土台の上から開始
        
        // 芯の頂点
        const coreX = Math.cos(angle) * coreR;
        const coreZ = Math.sin(angle) * coreR;
        lines.push(`v ${coreX.toFixed(4)} ${currY.toFixed(4)} ${coreZ.toFixed(4)}`);
        
        // ネジ山の頂点（外側に突き出す）
        const threadR = coreR + ((i % 2 === 0) ? 1.5 : 0.2); // ギザギザの幅
        const tx = Math.cos(angle) * threadR;
        const tz = Math.sin(angle) * threadR;
        lines.push(`v ${tx.toFixed(4)} ${currY.toFixed(4)} ${tz.toFixed(4)}`);
    }

    for (let i = 0; i < totalSteps; i++) {
        const v_core = threadStartV + i * 2 + 1;
        const v_thread = threadStartV + i * 2 + 2;
        const v_core_next = threadStartV + (i + 1) * 2 + 1;
        const v_thread_next = threadStartV + (i + 1) * 2 + 2;

        // ネジ山の面（芯から外側へ）
        lines.push(`f ${v_core} ${v_thread} ${v_thread_next} ${v_core_next}`);
        
        // 芯の表面（縦の壁）
        lines.push(`f ${v_core} ${v_core_next} ${threadStartV + (i+1)*2 + 1} ${v_core}`); 
        // ※簡易的に芯の面を繋いで棒にする
    }

    vCount += (totalSteps + 1) * 2;
    return lines.join("\n");
}

// --- 組み立て工程 ---
// 土台半径10, 高さ5 / 芯半径4, 高さ40 / ネジピッチ5
const boltModel = drawCompleteBolt(10, 5, 4, 40, 5);

const output = "# Gemini programming Unit\n" + boltModel;
fs.writeFileSync('integrated_bolt.obj', output);

console.log("✅ ミッション完了！土台・芯・ネジ山が一つになった 'integrated_bolt.obj' を生成したぞ！");
