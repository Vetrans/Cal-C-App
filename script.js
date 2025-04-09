const display = document.querySelector('.display');
const historyList = document.getElementById('history-list');

function append(value) {
  if (display.value === '0' || display.value === 'Error') {
    display.value = '';
  }
  display.value += value;
}

function clearDisplay() {
  display.value = '';
}

function deleteLast() {
  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    const result = mathEval(display.value);
    addToHistory(display.value + ' = ' + result);
    display.value = result;
  } catch (e) {
    display.value = 'Error';
  }
}

function mathEval(expr) {
  expr = expr.replace(/sin\(/g, 'Math.sin(degToRad(')
             .replace(/cos\(/g, 'Math.cos(degToRad(')
             .replace(/tan\(/g, 'Math.tan(degToRad(')
             .replace(/sqrt\(/g, 'Math.sqrt(')
             .replace(/log\(/g, 'Math.log10(')
             .replace(/ln\(/g, 'Math.log(');
  return eval(expr);
}

function degToRad(deg) {
  return deg * Math.PI / 180;
}

function addToHistory(entry) {
  const li = document.createElement('li');
  li.textContent = entry;
  li.style.opacity = 0;
  historyList.prepend(li);
  setTimeout(() => li.style.opacity = 1, 50);
}

function togglePanel(panelId) {
  const panels = document.querySelectorAll('.panel');
  panels.forEach(p => {
    if (p.id === `${panelId}-panel`) {
      p.style.display = p.style.display === 'block' ? 'none' : 'block';
    } else {
      p.style.display = 'none';
    }
  });
}

// ----------- Geometry Functions -----------

function calcCircleArea() {
  const r = parseFloat(document.getElementById('circle-radius').value);
  if (isNaN(r)) return showGeometryResult("Enter a valid radius.");
  showGeometryResult(`Area of Circle: ${(Math.PI * r * r).toFixed(2)}`);
}

function calcRectangleArea() {
  const l = parseFloat(document.getElementById('rect-length').value);
  const w = parseFloat(document.getElementById('rect-width').value);
  if (isNaN(l) || isNaN(w)) return showGeometryResult("Enter valid length and width.");
  showGeometryResult(`Area of Rectangle: ${(l * w).toFixed(2)}`);
}

function calcHypotenuse() {
  const a = parseFloat(document.getElementById('pyth-a').value);
  const b = parseFloat(document.getElementById('pyth-b').value);
  if (isNaN(a) || isNaN(b)) return showGeometryResult("Enter valid sides.");
  showGeometryResult(`Hypotenuse: ${Math.sqrt(a * a + b * b).toFixed(2)}`);
}

function calcCylinderVolume() {
  const r = parseFloat(document.getElementById('cylinder-radius').value);
  const h = parseFloat(document.getElementById('cylinder-height').value);
  if (isNaN(r) || isNaN(h)) return showGeometryResult("Enter valid radius and height.");
  showGeometryResult(`Volume of Cylinder: ${(Math.PI * r * r * h).toFixed(2)}`);
}

function calcSphereSurfaceArea() {
  const r = parseFloat(document.getElementById('sphere-radius').value);
  if (isNaN(r)) return showGeometryResult("Enter a valid radius.");
  showGeometryResult(`Surface Area of Sphere: ${(4 * Math.PI * r * r).toFixed(2)}`);
}

function showGeometryResult(msg) {
  document.getElementById('geometry-result').innerText = msg;
}

// ----------- Algebra Functions -----------

function solveQuadratic() {
  const a = parseFloat(document.getElementById('quad-a').value);
  const b = parseFloat(document.getElementById('quad-b').value);
  const c = parseFloat(document.getElementById('quad-c').value);
  if (isNaN(a) || isNaN(b) || isNaN(c)) return showAlgebraResult("Enter valid coefficients.");
  const d = b * b - 4 * a * c;
  if (d < 0) return showAlgebraResult("No real roots.");
  const root1 = (-b + Math.sqrt(d)) / (2 * a);
  const root2 = (-b - Math.sqrt(d)) / (2 * a);
  showAlgebraResult(`Roots: ${root1.toFixed(2)} and ${root2.toFixed(2)}`);
}

function solveLinear() {
  const input = document.getElementById('linear-equation').value;
  try {
    const [lhs, rhs] = input.split('=');
    const xMatch = lhs.match(/(-?\d*)x([+-]?\d+)?/);
    if (!xMatch) return showAlgebraResult("Invalid format.");
    const a = parseFloat(xMatch[1] || 1);
    const b = parseFloat(xMatch[2] || 0);
    const c = parseFloat(rhs);
    if (isNaN(a) || isNaN(b) || isNaN(c)) return showAlgebraResult("Invalid equation.");
    const x = (c - b) / a;
    showAlgebraResult(`x = ${x.toFixed(2)}`);
  } catch {
    showAlgebraResult("Error solving equation.");
  }
}

function simplifyExpression() {
  const expr = document.getElementById('algebra-expression').value;
  try {
    const result = eval(expr);
    showAlgebraResult(`Result: ${result}`);
  } catch {
    showAlgebraResult("Invalid expression.");
  }
}

function showAlgebraResult(msg) {
  document.getElementById('algebra-result').innerText = msg;
}

function showAlgebraSection(tool) {
  document.querySelectorAll('.algebra-tool').forEach(section => {
    section.classList.add('hidden');
  });

  if (tool) {
    const selected = document.getElementById(tool);
    if (selected) {
      selected.classList.remove('hidden');
    }
  }
}

function showGeometrySection(tool) {
    document.querySelectorAll('.geometry-tool').forEach(section => {
      section.classList.add('hidden');
    });
  
    if (tool) {
      const selected = document.getElementById(tool);
      if (selected) {
        selected.classList.remove('hidden');
      }
    }
  }

  
// ----------- Keyboard Support -----------
document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
  
    // 🔒 Prevent calculator key events if the user is typing in a form input
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
  
    const key = e.key;
  
    // ✅ Handle calculator keyboard input
    if (!isNaN(key) || "+-*/.%()".includes(key)) {
      append(key);
    } else if (key === 'Enter') {
      calculate();
    } else if (key === 'Backspace') {
      deleteLast();
    } else if (key === 'Escape') {
      clearDisplay();
    }
  });
  
