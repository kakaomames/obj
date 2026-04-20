/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：上下分離・開閉対応型宝箱の生成
 */
const fs = require('fs');

let vertices = [];
let faces = [];
let vCount = 0;

// パーツ生成関数
function addPart(x, y, z, sizeX, sizeY, sizeZ, name) {
    const dX = sizeX / 2; const dY = sizeY / 2; const dZ = sizeZ / 2;
    let vList = [
        {x:-dX,y:-dY,z:-dZ}, {x:dX,y:-dY,z:-dZ}, {x:dX,y:dY,z:-dZ}, {x:-dX,y:dY,z:-dZ},
        {x:-dX,y:-dY,z:dZ}, {x:dX,y:-dY,z:dZ}, {x:dX,y:dY,z:dZ}, {x:-dX,y:dY,z:dZ}
    ];
    
    // パーツの区切りとしてOBJにコメントを入れる
    vertices.push(`o ${name}`); 
    
    vList.forEach(v => {
        vertices.push(`v ${(v.x + x).toFixed(4)} ${(v.y + y).toFixed(4)} ${(v.z + z).toFixed(4)}`);
    });
    const b = vCount;
    faces.push(`f ${b+1} ${b+2} ${b+3} ${b+4}`, `f ${b+5} ${b+6} ${b+7} ${b+8}`,
               `f ${b+1} ${b+2} ${b+6} ${b+5}`, `f ${b+2} ${b+3} ${b+7} ${b+6}`,
               `f ${b+3} ${b+4} ${b+8} ${b+7}`, `f ${b+4} ${b+1} ${b+5} ${b+8}`);
    vCount += 8;
}

// --- 1. 下側ユニット (The Bottom) ---
// メインの入れ物
addPart(0, -0.4, 0, 2.0, 0.8, 1.2, "Bottom_Main");
// 底の補強フレーム（左右）
addPart(-1.0, -0.4, 0, 0.2, 0.9, 1.3, "Bottom_Frame_L");
addPart(1.0, -0.4, 0, 0.2, 0.9, 1.3, "Bottom_Frame_R");

// --- 2. 上側ユニット (The Lid / 蓋) ---
// 蓋は Y=0.0 より上に配置して、完全に分離させる
const lidY = 0.3; 
// 蓋のメイン
addPart(0, lidY + 0.2, 0, 2.0, 0.4, 1.2, "Lid_Main");
// 蓋の盛り上がり（宝箱っぽさ）
addPart(0, lidY + 0.45, 0, 1.6, 0.2, 1.0, "Lid_Top");
// 蓋の補強フレーム（左右）
addPart(-1.0, lidY + 0.25, 0, 0.2, 0.6, 1.3, "Lid_Frame_L");
addPart(1.0, lidY + 0.25, 0, 0.2, 0.6, 1.3, "Lid_Frame_R");

// --- 3. 装飾パーツ ---
// 正面のロック（下側に固定）
addPart(0, 0.0, -0.65, 0.4, 0.3, 0.1, "Lock_Base");

const output = "# Gemini programming Unit\n# 宝箱：上下分離モデル\n" + vertices.join("\n") + "\n" + faces.join("\n");
fs.writeFileSync('openable_chest.obj', output);

console.log("ミッション完了！ 'openable_chest.obj' を生成したぞ。");
