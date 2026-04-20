/**
 * Gemini programming隊 3D生成ユニット
 * ミッション：3D迷路の自動生成とOBJ出力
 */
const fs = require('fs');

let vCount = 0;

// --- 1. 迷路アルゴリズム（穴掘り法） ---
function generateMazeData(width, height) {
    let maze = Array.from({ length: height }, () => Array(width).fill(1)); // 1は壁、0は道
    
    function dig(x, y) {
        maze[y][x] = 0;
        const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
        for (let [dx, dy] of dirs) {
            let nx = x + dx, ny = y + dy;
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
                maze[y + dy / 2][x + dx / 2] = 0;
                dig(nx, ny);
            }
        }
    }
    dig(1, 1);
    return maze;
}

// --- 2. 立方体（壁）を生成する関数 ---
function drawWall(x, y, z, size) {
    let lines = [];
    const s = size / 2;
    const base = vCount;
    
    // 8つの頂点
    const vertices = [
        [x-s, y, z-s], [x+s, y, z-s], [x+s, y+size, z-s], [x-s, y+size, z-s],
        [x-s, y, z+s], [x+s, y, z+s], [x+s, y+size, z+s], [x-s, y+size, z+s]
    ];
    vertices.forEach(v => lines.push(`v ${v[0].toFixed(4)} ${v[1].toFixed(4)} ${v[2].toFixed(4)}`));

    // 6つの面
    lines.push(`f ${base+1} ${base+2} ${base+3} ${base+4}`); // 前
    lines.push(`f ${base+5} ${base+6} ${base+7} ${base+8}`); // 後
    lines.push(`f ${base+1} ${base+2} ${base+6} ${base+5}`); // 底
    lines.push(`f ${base+3} ${base+4} ${base+8} ${base+7}`); // 天
    lines.push(`f ${base+1} ${base+5} ${base+8} ${base+4}`); // 左
    lines.push(`f ${base+2} ${base+6} ${base+7} ${base+3}`); // 右

    vCount += 8;
    return lines.join("\n");
}

// --- 3. メイン組み立て ---
function createMazeModel(size) {
    const maze = generateMazeData(size, size);
    let mazeLines = [`o Maze_Walls`];
    const wallSize = 2.0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (maze[y][x] === 1) {
                // 壁がある場所に立方体を置く
                mazeLines.push(drawWall(x * wallSize, 0, y * wallSize, wallSize));
            }
        }
    }
    return mazeLines.join("\n");
}

// バージョニング保存
function saveWithVersion(baseName, content) {
    let version = 1;
    let fileName = `${baseName}-v${version}.obj`;
    while (fs.existsSync(fileName)) { version++; fileName = `${baseName}-v${version}.obj`; }
    fs.writeFileSync(fileName, content);
    console.log(`✅ 迷路生成完了： ${fileName}`);
}

const mazeContent = createMazeModel(15); // 15x15の迷路
saveWithVersion('maze_system', mazeContent);
