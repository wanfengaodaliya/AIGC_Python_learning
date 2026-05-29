// Python沙箱校验系统前端
const API_URL = '/run';
const codeInput = document.getElementById('codeInput');
const runBtn = document.getElementById('runBtn');
const submitBtn = document.getElementById('submitBtn');
const outputArea = document.getElementById('outputArea');
const otterIcon = document.getElementById('otterIcon');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');

let animationId = null;
let particles = [];
let cannon = null;
let lastRunResult = null;

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ================== 后端通信 ==================
async function runCodeOnServer(code) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code, timeout: 10 }),
        });
        
        return await response.json();
    } catch (error) {
        return {
            success: false,
            output: '',
            errors: [{
                type: '连接错误',
                line: null,
                column: null,
                message: '无法连接到服务器，请确保后端服务已启动',
                suggestion: '运行 python server.py 启动后端服务'
            }],
            execution_time: 0
        };
    }
}

function formatOutput(result) {
    let output = '';
    
    if (result.output) {
        output += '📤 程序输出:\n';
        output += result.output + '\n\n';
    }
    
    if (result.errors && result.errors.length > 0) {
        for (const error of result.errors) {
            output += '========================================\n';
            output += `⚠️ ${error.type}\n`;
            if (error.line) {
                output += `📍 第 ${error.line} 行`;
                if (error.column) {
                    output += ` 第 ${error.column} 列`;
                }
                output += '\n';
            }
            output += `❌ ${error.message}\n`;
            if (error.suggestion) {
                output += '\n💡 建议修改:\n';
                const suggestions = error.suggestion.split('\n');
                for (let i = 0; i < suggestions.length; i++) {
                    if (suggestions[i]) {
                        output += `  ${i + 1}. ${suggestions[i]}\n`;
                    }
                }
            }
            output += '========================================\n\n';
        }
    }
    
    if (result.execution_time !== undefined) {
        output += `⏱️ 执行时间: ${result.execution_time} 秒`;
    }
    
    return output.trim();
}

function formatErrorsForDisplay(errors) {
    let output = '';
    
    for (const error of errors) {
        output += '========================================\n';
        output += `⚠️ ${error.type}\n`;
        if (error.line) {
            output += `📍 第 ${error.line} 行`;
            if (error.column) {
                output += ` 第 ${error.column} 列`;
            }
            output += '\n';
        }
        output += `❌ ${error.message}\n`;
        if (error.suggestion) {
            output += '\n💡 建议修改:\n';
            const suggestions = error.suggestion.split('\n');
            for (let i = 0; i < suggestions.length; i++) {
                if (suggestions[i]) {
                    output += `  ${i + 1}. ${suggestions[i]}\n`;
                }
            }
        }
        output += '========================================\n\n';
    }
    
    return output.trim();
}

// ================== 按钮事件 ==================
runBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    
    if (!code) {
        showOutput('error', '错误：请输入代码');
        return;
    }
    
    runBtn.disabled = true;
    runBtn.textContent = '⏳ 运行中...';
    showOutput('info', '代码正在执行，请稍候...');
    
    try {
        const result = await runCodeOnServer(code);
        lastRunResult = result;
        
        if (result.success) {
            const output = formatOutput(result);
            showOutput('success', output);
        } else {
            const output = formatOutput(result);
            showOutput('error', output);
        }
    } catch (error) {
        showOutput('error', `运行出错: ${error.message}`);
    } finally {
        runBtn.disabled = false;
        runBtn.textContent = '运行';
    }
});

submitBtn.addEventListener('click', async () => {
    const code = codeInput.value.trim();
    
    if (!code) {
        showOutput('error', '错误：请先输入代码并运行');
        return;
    }
    
    if (!lastRunResult || !lastRunResult.success) {
        showOutput('info', '提示：请先点击"运行"按钮验证代码');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ 提交中...';
    
    try {
        const result = await runCodeOnServer(code);
        
        if (result.success) {
            const output = result.output || '';
            const expected = 'Hello, World!';
            
            if (output.trim() === expected) {
                showModal('success', '结果正确', '恭喜！您的代码运行结果正确！');
                startCelebration();
                setTimeout(() => {
                    window.location.href = '/level2.html';
                }, 3000);
            } else {
                showModal('error', '结果失败', `预期输出: "${expected}"\n实际输出: "${output.trim()}"`);
            }
        } else {
            const errorsStr = formatErrorsForDisplay(result.errors || []);
            showModal('error', '结果失败', `代码执行有错误：\n\n${errorsStr}`);
        }
    } catch (error) {
        showModal('error', '结果失败', `提交出错: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '提交';
    }
});

otterIcon.addEventListener('click', () => {
    showModal('info', 'AI辅助', '海獭助手正在准备中...\n\n即将跳转到AI辅助界面，请稍候。');
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// ================== UI工具函数 ==================
function showOutput(type, message) {
    outputArea.style.display = 'block';
    outputArea.className = `output-area ${type}`;
    outputArea.textContent = message;
}

function showModal(type, title, message) {
    modalIcon.className = `modal-icon ${type}`;
    
    if (type === 'success') {
        modalIcon.innerHTML = '✓';
    } else if (type === 'error') {
        modalIcon.innerHTML = '✕';
    } else {
        modalIcon.innerHTML = 'ℹ';
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.add('show');
}

// ================== 代码编辑器 ==================
codeInput.addEventListener('input', () => {
    updateLineNumbers();
});

codeInput.addEventListener('scroll', () => {
    const lineNumbers = document.querySelector('.line-numbers');
    lineNumbers.scrollTop = codeInput.scrollTop;
});

function updateLineNumbers() {
    const lines = codeInput.value.split('\n').length;
    const lineNumbers = document.querySelector('.line-numbers');
    lineNumbers.innerHTML = '';
    
    for (let i = 1; i <= lines; i++) {
        const lineDiv = document.createElement('div');
        lineDiv.textContent = i;
        lineNumbers.appendChild(lineDiv);
    }
}

updateLineNumbers();

codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;
        const value = codeInput.value;
        codeInput.value = value.substring(0, start) + '    ' + value.substring(end);
        codeInput.selectionStart = codeInput.selectionEnd = start + 4;
    }
});

// ================== 礼花特效 ==================
function startCelebration() {
    particles = [];
    confettiCanvas.style.display = 'block';

    const submitBtnRect = submitBtn.getBoundingClientRect();
    const modalRect = modal.querySelector('.modal-content').getBoundingClientRect();

    const startX = submitBtnRect.left + submitBtnRect.width / 2;
    const startY = submitBtnRect.top;
    const targetX = modalRect.left + modalRect.width / 2;
    const targetY = modalRect.top - 60;

    cannon = {
        x: startX,
        y: startY,
        targetX: targetX,
        targetY: targetY,
        rotation: 0,
        smoke: [],
        phase: 'launching',
        startTime: performance.now(),
        flash: 0
    };

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    animate();
}

function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    const now = performance.now();
    const elapsed = now - cannon.startTime;
    const totalDuration = 2500;

    if (elapsed < 500) {
        updateCannonLaunch(elapsed);
    } else if (elapsed < 1000) {
        updateExplosion(elapsed);
    } else if (elapsed < totalDuration) {
        updateFadeOut(elapsed);
    } else {
        confettiCanvas.style.display = 'none';
        return;
    }

    drawCannon();
    drawParticles();
    drawSmoke();

    animationId = requestAnimationFrame(animate);
}

function updateCannonLaunch(elapsed) {
    const progress = elapsed / 500;
    const easeOut = 1 - Math.pow(1 - progress, 3);

    cannon.x = cannon.x + (cannon.targetX - cannon.x) * easeOut * 0.1;
    cannon.y = cannon.y + (cannon.targetY - cannon.y) * easeOut * 0.15;
    cannon.rotation = Math.sin(elapsed * 0.02) * 0.3;

    if (Math.random() < 0.3) {
        cannon.smoke.push({
            x: cannon.x + (Math.random() - 0.5) * 20,
            y: cannon.y + 30,
            size: Math.random() * 15 + 10,
            alpha: 0.8,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2 + 1
        });
    }

    cannon.smoke.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.02;
        s.size *= 0.98;
    });
    cannon.smoke = cannon.smoke.filter(s => s.alpha > 0);
}

function updateExplosion(elapsed) {
    if (cannon.phase === 'launching') {
        cannon.phase = 'explosion';
        cannon.x = cannon.targetX;
        cannon.y = cannon.targetY;
        cannon.flash = 1;

        const colors = ['#FF4757', '#FFD700', '#4A90E2', '#2ECC71', '#9B59B6', '#FF69B4'];
        const shapes = ['circle', 'star', 'heart'];

        for (let i = 0; i < 180; i++) {
            const angle = (Math.PI * 2 * i) / 180 + Math.random() * 0.5;
            const speed = Math.random() * 8 + 4;
            const size = Math.random() * 8 + 4;

            particles.push({
                x: cannon.x,
                y: cannon.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - Math.random() * 3,
                size: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                alpha: 1,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                gravity: 0.15,
                trail: []
            });
        }
    }

    cannon.flash *= 0.85;
}

function updateFadeOut(elapsed) {
    particles.forEach(p => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.alpha = Math.max(0, 1 - (elapsed - 1000) / 1500);

        if (Math.random() < 0.3) {
            p.trail.push({ x: p.x, y: p.y, alpha: p.alpha * 0.5 });
            if (p.trail.length > 5) {
                p.trail.shift();
            }
        }

        p.trail.forEach(t => {
            t.alpha *= 0.9;
        });
        p.trail = p.trail.filter(t => t.alpha > 0.1);
    });
}

function drawCannon() {
    if (cannon.phase === 'explosion' && cannon.flash > 0.1) {
        const gradient = ctx.createRadialGradient(
            cannon.x, cannon.y, 0,
            cannon.x, cannon.y, 80
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${cannon.flash})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${cannon.flash * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cannon.x, cannon.y, 80, 0, Math.PI * 2);
        ctx.fill();
    }

    if (cannon.phase === 'launching') {
        ctx.save();
        ctx.translate(cannon.x, cannon.y);
        ctx.rotate(cannon.rotation);

        const cannonGradient = ctx.createLinearGradient(-15, 0, 15, 0);
        cannonGradient.addColorStop(0, '#B8860B');
        cannonGradient.addColorStop(0.5, '#FFD700');
        cannonGradient.addColorStop(1, '#B8860B');

        ctx.fillStyle = cannonGradient;
        ctx.beginPath();
        ctx.moveTo(-12, 30);
        ctx.lineTo(-15, -20);
        ctx.lineTo(15, -20);
        ctx.lineTo(12, 30);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(0, 35, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function drawSmoke() {
    cannon.smoke.forEach(s => {
        const smokeGradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        smokeGradient.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
        smokeGradient.addColorStop(1, 'rgba(200, 200, 200, 0)');

        ctx.fillStyle = smokeGradient;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawParticles() {
    particles.forEach(p => {
        p.trail.forEach(t => {
            ctx.fillStyle = hexToRgba(p.color, t.alpha * 0.3);
            drawShape(t.x, t.y, p.size * 0.6, p.shape, p.rotation);
        });

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;

        ctx.fillStyle = hexToRgba(p.color, p.alpha);
        drawShape(0, 0, p.size, p.shape, 0);

        ctx.restore();
    });
}

function drawShape(x, y, size, shape, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (shape === 'star') {
        drawStar(0, 0, 5, size / 2, size / 4);
    } else if (shape === 'heart') {
        drawHeart(0, 0, size);
    }

    ctx.restore();
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

function drawHeart(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.7, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.7, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.fill();
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
