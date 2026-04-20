const fs = require('fs');
const path = require('path');

let vCount = 0;

function generateScrew(x, y, z, r, h, pitch, name) {
    let lines = [`o ${name}`];
    const segments = 24;
    const turns = h / pitch;
    const totalSteps = Math.floor(segments * turns);
    const base = vCount;

    for (let i = 0; i <= totalSteps; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const currY = (i / totalSteps) * h;
        // ネジの山を作るための計算
        const radialOffset = (i % 2 === 0) ? 0.5 : 0; 
        const cx = Math.cos(angle) * (r + radialOffset);
        const cz = Math.sin(angle) * (r + radialOffset);
        
        lines.push(`v ${(x + cx).toFixed(4)} ${(y + currY).toFixed(4)} ${(z + cz).toFixed(4)}`);
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

try {
    const filePath = path.join(__dirname, 'screw_test.obj'); // 絶対パスで指定
    const bolt = generateScrew(0, 0, 0, 5, 20, 3, "Bolt_Part");
    const nut = generateScrew(15, 0, 0, 5.3, 10, 3, "Nut_Part");

    const finalOBJ = ["# Gemini programming Unit", bolt, nut].join("\n");

    fs.writeFileSync(filePath, finalOBJ);
    
    // ログに保存先を表示する（これが大事！）
    console.log("✅ ミッション成功！");
    console.log("📂 保存場所: " + filePath);
} catch (err) {
    console.error("❌ 書き込みに失敗したぞ！: ", err.message);
}
