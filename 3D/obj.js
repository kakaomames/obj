/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：芯（軸）のある完全なネジ構造の生成
 */
const fs = require('fs');

let vCount = 0;

// --- 1. ボルト（芯のあるネジ棒） ---
function drawSolidBolt(radius, height, pitch) {
    return generateSolidScrew(0, 0, 0, radius, height, pitch, "Solid_Bolt");
}

// --- 2. 芯と螺旋を同時に作るコアロジック ---
function generateSolidScrew(x, y, z, r, h, pitch, name) {
    let lines = [`o ${name}`];
    const segments = 32;
    const turns = h / pitch;
    const totalSteps = Math.floor(segments * turns);
    const base = vCount;

    // 頂点生成
    for (let i = 0; i <= totalSteps; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const currY = (i / totalSteps) * h;
        
        // A: ネジの山（外側）の頂点
        const radialOffset = (i % 2 === 0) ? 1.0 : 0.2; // 山の高さ
        const ax = Math.cos(angle) * (r + radialOffset);
        const az = Math.sin(angle) * (r + radialOffset);
        lines.push(`v ${(x + ax).toFixed(4)} ${(y + currY).toFixed(4)} ${(z + az).toFixed(4)}`);
        
        // B: ネジの芯（内側）の頂点
        const bx = Math.cos(angle) * r;
        const bz = Math.sin(angle) * r;
        lines.push(`v ${(x + bx).toFixed(4)} ${(y + currY).toFixed(4)} ${(z + bz).toFixed(4)}`);
    }

    // 面生成
    for (let i = 0; i < totalSteps; i++) {
        const v1 = base + i * 2 + 1; // 今回の外
        const v2 = base + i * 2 + 2; // 今回の内
        const v3 = base + (i + 1) * 2 + 2; // 次の内
        const v4 = base + (i + 1) * 2 + 1; // 次の外

        // 1. ネジの山（螺旋の表面）
        lines.push(`f ${v1} ${v2} ${v3} ${v4}`);

        // 2. 芯の壁（内側の円柱の表面）
        // 前のステップの内側頂点と、今のステップの内側頂点を繋いで「棒」にする
        if (i > 0) {
            const prevV2 = base + (i - 1) * 2 + 2;
            lines.push(`f ${prevV2} ${v2} ${v3} ${base + i * 2 + 2}`); // 簡易的な芯の面
        }
    }

    // 芯をさらに確実にするため、上下の蓋を追加
    // (中心点を通る面を追加して、棒の中身を定義する)
    const centerBottom = vCount + (totalSteps + 1) * 2 + 1;
    const centerTop = vCount + (totalSteps + 1) * 2 + 2;
    lines.push(`v ${x} ${y} ${z}`); // 底の中心
    lines.push(`v ${x} ${(y + h).toFixed(4)} ${z}`); // 天の中心
    
    for (let i = 0; i < totalSteps; i++) {
        const v_inner = base + i * 2 + 2;
        const v_inner_next = base + (i + 1) * 2 + 2;
        lines.push(`f ${centerBottom} ${v_inner_next} ${v_inner}`); // 底蓋
        lines.push(`f ${centerTop} ${v_inner} ${v_inner_next}`); // 天蓋
    }

    vCount += (totalSteps + 1) * 2 + 2;
    return lines.join("\n");
}

// --- 組み立て実行 ---
const bolt = drawSolidBolt(5.0, 30.0, 4.0); // 半径5mm、高さ30mm、ピッチ4mm

const finalOBJ = [
    "# Gemini programming Unit",
    "# 芯（中心軸）のある完全なネジモデル",
    bolt
].join("\n");

fs.writeFileSync('solid_bolt.obj', finalOBJ);
console.log("✅ ミッション成功！芯がしっかり通った 'solid_bolt.obj' を書き出したぞ！");
