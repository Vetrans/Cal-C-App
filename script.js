// Calculator State
let currentExpression = '';
let currentResult = '0';
let memory = 0;
let history = [];
let currentBase = 'dec';
let isDegreeMode = true;

// DOM Elements
const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const memoryIndicator = document.getElementById('memory-indicator');
const historyList = document.getElementById('history-list');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  updateDisplay();
  setupKeyboard();
});

// Display Functions
function updateDisplay() {
  expressionDisplay.textContent = currentExpression || '0';
  resultDisplay.textContent = currentResult;
  updateMemoryIndicator();
}

function updateMemoryIndicator() {
  if (memory !== 0) {
    memoryIndicator.textContent = `M: ${memory}`;
  } else {
    memoryIndicator.textContent = '';
  }
}

// Input Functions
function inputNumber(num) {
  if (currentResult !== '0' && currentExpression === '') {
    currentExpression = '';
  }
  
  if (currentBase === 'bin' && !/[01]/.test(num)) return;
  if (currentBase === 'oct' && !/[0-7]/.test(num)) return;
  if (currentBase === 'dec' && !/[0-9.]/.test(num)) return;
  
  currentExpression += num;
  updateDisplay();
  animateButton();
}

function inputOperator(op) {
  if (currentExpression === '' && currentResult !== '0') {
    currentExpression = currentResult;
  }
  
  const lastChar = currentExpression.slice(-1);
  if (['+', '-', '*', '/', '^', '%'].includes(lastChar)) {
    currentExpression = currentExpression.slice(0, -1);
  }
  
  currentExpression += op;
  updateDisplay();
  animateButton();
}

function inputFunction(func) {
  currentExpression += func;
  updateDisplay();
  animateButton();
}

function inputConstant(constant) {
  if (constant === 'PI') {
    currentExpression += Math.PI;
  } else if (constant === 'E') {
    currentExpression += Math.E;
  }
  updateDisplay();
}

// Calculation Functions
function calculate() {
  if (currentExpression === '') return;
  
  try {
    let expr = currentExpression;
    
    if (currentBase !== 'dec') {
      expr = convertFromBase(expr, currentBase);
    }
    
    expr = preprocessExpression(expr);
    let result = evaluateExpression(expr);
    
    if (currentBase !== 'dec') {
      result = convertToBase(result, currentBase);
    }
    
    addToHistory(`${currentExpression} = ${result}`);
    currentResult = result.toString();
    currentExpression = '';
    updateDisplay();
    animateResult();
  } catch (error) {
    currentResult = 'Error';
    updateDisplay();
    setTimeout(() => {
      currentResult = '0';
      updateDisplay();
    }, 2000);
  }
}

function preprocessExpression(expr) {
  expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  
  expr = expr.replace(/sin\(/g, isDegreeMode ? 'Math.sin(deg2rad(' : 'Math.sin(');
  expr = expr.replace(/cos\(/g, isDegreeMode ? 'Math.cos(deg2rad(' : 'Math.cos(');
  expr = expr.replace(/tan\(/g, isDegreeMode ? 'Math.tan(deg2rad(' : 'Math.tan(');
  expr = expr.replace(/asin\(/g, isDegreeMode ? 'rad2deg(Math.asin(' : 'Math.asin(');
  expr = expr.replace(/acos\(/g, isDegreeMode ? 'rad2deg(Math.acos(' : 'Math.acos(');
  expr = expr.replace(/atan\(/g, isDegreeMode ? 'rad2deg(Math.atan(' : 'Math.atan(');
  
  expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
  expr = expr.replace(/log\(/g, 'Math.log10(');
  expr = expr.replace(/ln\(/g, 'Math.log(');
  expr = expr.replace(/\^/g, '**');
  
  if (isDegreeMode) {
    let openCount = (expr.match(/deg2rad\(/g) || []).length;
    let closeCount = (expr.match(/\)/g) || []).length;
    for (let i = 0; i < openCount - closeCount; i++) {
      expr += ')';
    }
  }
  
  return expr;
}

function evaluateExpression(expr) {
  const deg2rad = (deg) => deg * Math.PI / 180;
  const rad2deg = (rad) => rad * 180 / Math.PI;
  
  return Function('"use strict"; return (' + expr + ')')();
}

function clearAll() {
  currentExpression = '';
  currentResult = '0';
  updateDisplay();
  animateButton();
}

function clearEntry() {
  currentExpression = '';
  updateDisplay();
  animateButton();
}

function backspace() {
  currentExpression = currentExpression.slice(0, -1);
  updateDisplay();
  animateButton();
}

function factorial() {
  try {
    let num = parseInt(currentResult);
    if (num < 0) throw new Error('Negative number');
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    currentResult = result.toString();
    currentExpression = '';
    updateDisplay();
  } catch {
    currentResult = 'Error';
    updateDisplay();
  }
}

// Memory Functions
function memoryClear() {
  memory = 0;
  updateDisplay();
  animateButton();
}

function memoryRecall() {
  currentExpression = memory.toString();
  updateDisplay();
  animateButton();
}

function memoryAdd() {
  memory += parseFloat(currentResult);
  updateDisplay();
  animateButton();
}

function memorySubtract() {
  memory -= parseFloat(currentResult);
  updateDisplay();
  animateButton();
}

function memoryStore() {
  memory = parseFloat(currentResult);
  updateDisplay();
  animateButton();
}

// Mode Switching
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    document.querySelectorAll('.mode-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    const mode = btn.dataset.mode;
    document.getElementById(`${mode}-panel`).classList.add('active');
  });
});

// Programmer Mode Functions
function changeBase(base) {
  document.querySelectorAll('.system-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  if (currentResult !== '0') {
    let decValue = currentBase !== 'dec' ? parseInt(currentResult, getBaseNumber(currentBase)) : parseInt(currentResult);
    currentBase = base;
    currentResult = convertToBase(decValue, base);
    updateDisplay();
  } else {
    currentBase = base;
  }
}

function getBaseNumber(base) {
  const bases = { bin: 2, oct: 8, dec: 10, hex: 16 };
  return bases[base];
}

function convertToBase(num, base) {
  const baseNum = getBaseNumber(base);
  return parseInt(num).toString(baseNum).toUpperCase();
}

function convertFromBase(str, base) {
  return parseInt(str, getBaseNumber(base)).toString();
}

function bitwiseOp(op) {
  try {
    let num = parseInt(currentResult);
    let result;
    
    if (op === 'NOT') {
      result = ~num;
    } else {
      currentExpression = `${num} ${op} `;
      updateDisplay();
      return;
    }
    
    currentResult = result.toString();
    updateDisplay();
  } catch {
    currentResult = 'Error';
    updateDisplay();
  }
}

function shiftLeft() {
  try {
    let num = parseInt(currentResult);
    currentResult = (num << 1).toString();
    updateDisplay();
  } catch {
    currentResult = 'Error';
    updateDisplay();
  }
}

function shiftRight() {
  try {
    let num = parseInt(currentResult);
    currentResult = (num >> 1).toString();
    updateDisplay();
  } catch {
    currentResult = 'Error';
    updateDisplay();
  }
}

// Tool Functions
function showTool(toolName) {
  document.querySelectorAll('.tool-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.closest('.tool-tab').classList.add('active');
  
  document.querySelectorAll('.tool-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${toolName}-tool`).classList.add('active');
}

// Geometry Functions
function showGeometryForm(shape) {
  const formsDiv = document.getElementById('geometry-forms');
  formsDiv.innerHTML = '';
  
  if (!shape) return;
  
  const forms = {
    circle: `
      <div class="input-group">
        <label>Radius:</label>
        <input type="number" id="geo-radius" placeholder="Enter radius">
        <button class="calc-btn" onclick="calcCircle()">Calculate Area & Circumference</button>
      </div>
    `,
    rectangle: `
      <div class="input-group">
        <label>Length:</label>
        <input type="number" id="geo-length" placeholder="Enter length">
        <label>Width:</label>
        <input type="number" id="geo-width" placeholder="Enter width">
        <button class="calc-btn" onclick="calcRectangle()">Calculate Area & Perimeter</button>
      </div>
    `,
    triangle: `
      <div class="input-group">
        <label>Base:</label>
        <input type="number" id="geo-base" placeholder="Enter base">
        <label>Height:</label>
        <input type="number" id="geo-height" placeholder="Enter height">
        <button class="calc-btn" onclick="calcTriangle()">Calculate Area</button>
      </div>
    `,
    sphere: `
      <div class="input-group">
        <label>Radius:</label>
        <input type="number" id="geo-radius" placeholder="Enter radius">
        <button class="calc-btn" onclick="calcSphere()">Calculate Volume & Surface Area</button>
      </div>
    `,
    cylinder: `
      <div class="input-group">
        <label>Radius:</label>
        <input type="number" id="geo-radius" placeholder="Enter radius">
        <label>Height:</label>
        <input type="number" id="geo-height" placeholder="Enter height">
        <button class="calc-btn" onclick="calcCylinder()">Calculate Volume & Surface Area</button>
      </div>
    `,
    cone: `
      <div class="input-group">
        <label>Radius:</label>
        <input type="number" id="geo-radius" placeholder="Enter radius">
        <label>Height:</label>
        <input type="number" id="geo-height" placeholder="Enter height">
        <button class="calc-btn" onclick="calcCone()">Calculate Volume & Surface Area</button>
      </div>
    `,
    cube: `
      <div class="input-group">
        <label>Side Length:</label>
        <input type="number" id="geo-side" placeholder="Enter side length">
        <button class="calc-btn" onclick="calcCube()">Calculate Volume & Surface Area</button>
      </div>
    `
  };
  
  formsDiv.innerHTML = forms[shape] || '';
}

function calcCircle() {
  const r = parseFloat(document.getElementById('geo-radius').value);
  if (isNaN(r)) return showGeometryResult('Please enter a valid radius');
  
  const area = Math.PI * r * r;
  const circumference = 2 * Math.PI * r;
  showGeometryResult(`Area: ${area.toFixed(2)}<br>Circumference: ${circumference.toFixed(2)}`);
}

function calcRectangle() {
  const l = parseFloat(document.getElementById('geo-length').value);
  const w = parseFloat(document.getElementById('geo-width').value);
  if (isNaN(l) || isNaN(w)) return showGeometryResult('Please enter valid dimensions');
  
  const area = l * w;
  const perimeter = 2 * (l + w);
  showGeometryResult(`Area: ${area.toFixed(2)}<br>Perimeter: ${perimeter.toFixed(2)}`);
}

function calcTriangle() {
  const b = parseFloat(document.getElementById('geo-base').value);
  const h = parseFloat(document.getElementById('geo-height').value);
  if (isNaN(b) || isNaN(h)) return showGeometryResult('Please enter valid dimensions');
  
  const area = 0.5 * b * h;
  showGeometryResult(`Area: ${area.toFixed(2)}`);
}

function calcSphere() {
  const r = parseFloat(document.getElementById('geo-radius').value);
  if (isNaN(r)) return showGeometryResult('Please enter a valid radius');
  
  const volume = (4/3) * Math.PI * r * r * r;
  const surfaceArea = 4 * Math.PI * r * r;
  showGeometryResult(`Volume: ${volume.toFixed(2)}<br>Surface Area: ${surfaceArea.toFixed(2)}`);
}

function calcCylinder() {
  const r = parseFloat(document.getElementById('geo-radius').value);
  const h = parseFloat(document.getElementById('geo-height').value);
  if (isNaN(r) || isNaN(h)) return showGeometryResult('Please enter valid dimensions');
  
  const volume = Math.PI * r * r * h;
  const surfaceArea = 2 * Math.PI * r * (r + h);
  showGeometryResult(`Volume: ${volume.toFixed(2)}<br>Surface Area: ${surfaceArea.toFixed(2)}`);
}

function calcCone() {
  const r = parseFloat(document.getElementById('geo-radius').value);
  const h = parseFloat(document.getElementById('geo-height').value);
  if (isNaN(r) || isNaN(h)) return showGeometryResult('Please enter valid dimensions');
  
  const volume = (1/3) * Math.PI * r * r * h;
  const slantHeight = Math.sqrt(r * r + h * h);
  const surfaceArea = Math.PI * r * (r + slantHeight);
  showGeometryResult(`Volume: ${volume.toFixed(2)}<br>Surface Area: ${surfaceArea.toFixed(2)}`);
}

function calcCube() {
  const s = parseFloat(document.getElementById('geo-side').value);
  if (isNaN(s)) return showGeometryResult('Please enter a valid side length');
  
  const volume = s * s * s;
  const surfaceArea = 6 * s * s;
  showGeometryResult(`Volume: ${volume.toFixed(2)}<br>Surface Area: ${surfaceArea.toFixed(2)}`);
}

function showGeometryResult(msg) {
  document.getElementById('geometry-result').innerHTML = msg;
}

// Algebra Functions
function showAlgebraForm(type) {
  const formsDiv = document.getElementById('algebra-forms');
  formsDiv.innerHTML = '';
  
  if (!type) return;
  
  const forms = {
    quadratic: `
      <div class="input-group">
        <label>Equation: ax² + bx + c = 0</label>
        <label>a:</label>
        <input type="number" id="alg-a" placeholder="Coefficient a">
        <label>b:</label>
        <input type="number" id="alg-b" placeholder="Coefficient b">
        <label>c:</label>
        <input type="number" id="alg-c" placeholder="Coefficient c">
        <button class="calc-btn" onclick="solveQuadratic()">Solve</button>
      </div>
    `,
    linear: `
      <div class="input-group">
        <label>Equation: ax + b = 0</label>
        <label>a:</label>
        <input type="number" id="alg-a" placeholder="Coefficient a">
        <label>b:</label>
        <input type="number" id="alg-b" placeholder="Constant b">
        <button class="calc-btn" onclick="solveLinear()">Solve</button>
      </div>
    `,
    simultaneous: `
      <div class="input-group">
        <label>Equation 1: a₁x + b₁y = c₁</label>
        <input type="number" id="alg-a1" placeholder="a₁">
        <input type="number" id="alg-b1" placeholder="b₁">
        <input type="number" id="alg-c1" placeholder="c₁">
        <label>Equation 2: a₂x + b₂y = c₂</label>
        <input type="number" id="alg-a2" placeholder="a₂">
        <input type="number" id="alg-b2" placeholder="b₂">
        <input type="number" id="alg-c2" placeholder="c₂">
        <button class="calc-btn" onclick="solveSimultaneous()">Solve</button>
      </div>
    `,
    polynomial: `
      <div class="input-group">
        <label>Enter coefficients (comma-separated, highest degree first):</label>
        <input type="text" id="alg-poly" placeholder="e.g., 1,-3,2 for x²-3x+2">
        <button class="calc-btn" onclick="solvePolynomial()">Find Roots</button>
      </div>
    `
  };
  
  formsDiv.innerHTML = forms[type] || '';
}

function solveQuadratic() {
  const a = parseFloat(document.getElementById('alg-a').value);
  const b = parseFloat(document.getElementById('alg-b').value);
  const c = parseFloat(document.getElementById('alg-c').value);
  
  if (isNaN(a) || isNaN(b) || isNaN(c)) {
    return showAlgebraResult('Please enter valid coefficients');
  }
  
  const discriminant = b * b - 4 * a * c;
  
  if (discriminant < 0) {
    showAlgebraResult('No real roots (discriminant < 0)');
  } else if (discriminant === 0) {
    const root = -b / (2 * a);
    showAlgebraResult(`One root: x = ${root.toFixed(4)}`);
  } else {
    const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    showAlgebraResult(`Two roots:<br>x₁ = ${root1.toFixed(4)}<br>x₂ = ${root2.toFixed(4)}`);
  }
}

function solveLinear() {
  const a = parseFloat(document.getElementById('alg-a').value);
  const b = parseFloat(document.getElementById('alg-b').value);
  
  if (isNaN(a) || isNaN(b)) {
    return showAlgebraResult('Please enter valid coefficients');
  }
  
  if (a === 0) {
    showAlgebraResult('Invalid equation (a cannot be 0)');
  } else {
    const x = -b / a;
    showAlgebraResult(`Solution: x = ${x.toFixed(4)}`);
  }
}

function solveSimultaneous() {
  const a1 = parseFloat(document.getElementById('alg-a1').value);
  const b1 = parseFloat(document.getElementById('alg-b1').value);
  const c1 = parseFloat(document.getElementById('alg-c1').value);
  const a2 = parseFloat(document.getElementById('alg-a2').value);
  const b2 = parseFloat(document.getElementById('alg-b2').value);
  const c2 = parseFloat(document.getElementById('alg-c2').value);
  
  if ([a1, b1, c1, a2, b2, c2].some(isNaN)) {
    return showAlgebraResult('Please enter valid coefficients');
  }
  
  const det = a1 * b2 - a2 * b1;
  
  if (det === 0) {
    showAlgebraResult('No unique solution (parallel or coincident lines)');
  } else {
    const x = (c1 * b2 - c2 * b1) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    showAlgebraResult(`Solution:<br>x = ${x.toFixed(4)}<br>y = ${y.toFixed(4)}`);
  }
}

function solvePolynomial() {
  const input = document.getElementById('alg-poly').value;
  showAlgebraResult('Polynomial root finding requires advanced numerical methods. For quadratic equations, use the Quadratic solver.');
}

function showAlgebraResult(msg) {
  document.getElementById('algebra-result').innerHTML = msg;
}

// Statistics Functions
function calculateStatistics() {
  const input = document.getElementById('stats-data').value;
  const numbers = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
  
  if (numbers.length === 0) {
    return showStatisticsResult('Please enter valid numbers');
  }
  
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = sum / numbers.length;
  const sorted = [...numbers].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0 
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 
    : sorted[Math.floor(sorted.length / 2)];
  
  const variance = numbers.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / numbers.length;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  
  showStatisticsResult(`
    Count: ${numbers.length}<br>
    Sum: ${sum.toFixed(2)}<br>
    Mean: ${mean.toFixed(2)}<br>
    Median: ${median.toFixed(2)}<br>
    Std Dev: ${stdDev.toFixed(2)}<br>
    Variance: ${variance.toFixed(2)}<br>
    Min: ${min.toFixed(2)}<br>
    Max: ${max.toFixed(2)}
  `);
}

function showStatisticsResult(msg) {
  document.getElementById('statistics-result').innerHTML = msg;
}

// Finance Functions
function showFinanceForm(type) {
  const formsDiv = document.getElementById('finance-forms');
  formsDiv.innerHTML = '';
  
  if (!type) return;
  
  const forms = {
    loan: `
      <div class="input-group">
        <label>Loan Amount:</label>
        <input type="number" id="fin-principal" placeholder="Enter loan amount">
        <label>Annual Interest Rate (%):</label>
        <input type="number" id="fin-rate" placeholder="Enter interest rate">
        <label>Loan Term (years):</label>
        <input type="number" id="fin-years" placeholder="Enter years">
        <button class="calc-btn" onclick="calcLoanPayment()">Calculate Payment</button>
      </div>
    `,
    compound: `
      <div class="input-group">
        <label>Principal Amount:</label>
        <input type="number" id="fin-principal" placeholder="Initial investment">
        <label>Annual Interest Rate (%):</label>
        <input type="number" id="fin-rate" placeholder="Interest rate">
        <label>Time (years):</label>
        <input type="number" id="fin-years" placeholder="Number of years">
        <label>Compounds per year:</label>
        <input type="number" id="fin-compounds" placeholder="e.g., 12 for monthly" value="12">
        <button class="calc-btn" onclick="calcCompoundInterest()">Calculate</button>
      </div>
    `,
    roi: `
      <div class="input-group">
        <label>Initial Investment:</label>
        <input type="number" id="fin-initial" placeholder="Initial amount">
        <label>Final Value:</label>
        <input type="number" id="fin-final" placeholder="Final amount">
        <button class="calc-btn" onclick="calcROI()">Calculate ROI</button>
      </div>
    `
  };
  
  formsDiv.innerHTML = forms[type] || '';
}

function calcLoanPayment() {
  const principal = parseFloat(document.getElementById('fin-principal').value);
  const annualRate = parseFloat(document.getElementById('fin-rate').value);
  const years = parseFloat(document.getElementById('fin-years').value);
  
  if ([principal, annualRate, years].some(isNaN)) {
    return showFinanceResult('Please enter valid values');
  }
  
  const monthlyRate = (annualRate / 100) / 12;
  const numPayments = years * 12;
  
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                        (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const totalPaid = monthlyPayment * numPayments;
  const totalInterest = totalPaid - principal;
  
  showFinanceResult(`
    Monthly Payment: $${monthlyPayment.toFixed(2)}<br>
    Total Paid: $${totalPaid.toFixed(2)}<br>
    Total Interest: $${totalInterest.toFixed(2)}
  `);
}

function calcCompoundInterest() {
  const principal = parseFloat(document.getElementById('fin-principal').value);
  const rate = parseFloat(document.getElementById('fin-rate').value);
  const years = parseFloat(document.getElementById('fin-years').value);
  const compounds = parseFloat(document.getElementById('fin-compounds').value);
  
  if ([principal, rate, years, compounds].some(isNaN)) {
    return showFinanceResult('Please enter valid values');
  }
  
  const amount = principal * Math.pow(1 + (rate / 100) / compounds, compounds * years);
  const interest = amount - principal;
  
  showFinanceResult(`
    Final Amount: $${amount.toFixed(2)}<br>
    Interest Earned: $${interest.toFixed(2)}<br>
    Total Return: ${((interest / principal) * 100).toFixed(2)}%
  `);
}

function calcROI() {
  const initial = parseFloat(document.getElementById('fin-initial').value);
  const final = parseFloat(document.getElementById('fin-final').value);
  
  if ([initial, final].some(isNaN)) {
    return showFinanceResult('Please enter valid values');
  }
  
  const roi = ((final - initial) / initial) * 100;
  const profit = final - initial;
  
  showFinanceResult(`
    Return on Investment: ${roi.toFixed(2)}%<br>
    Profit/Loss: $${profit.toFixed(2)}
  `);
}

function showFinanceResult(msg) {
  document.getElementById('finance-result').innerHTML = msg;
}

// Unit Converter Functions
function showConverterForm(type) {
  const formsDiv = document.getElementById('converter-forms');
  formsDiv.innerHTML = '';
  
  if (!type) return;
  
  const converters = {
    length: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch'],
    weight: ['Kilogram', 'Gram', 'Milligram', 'Pound', 'Ounce', 'Ton'],
    temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
    area: ['Square Meter', 'Square Kilometer', 'Hectare', 'Square Mile', 'Acre', 'Square Foot'],
    volume: ['Liter', 'Milliliter', 'Cubic Meter', 'Gallon', 'Quart', 'Pint', 'Cup'],
    speed: ['Meters/sec', 'Kilometers/hr', 'Miles/hr', 'Feet/sec', 'Knots']
  };
  
  const units = converters[type];
  let options = '';
  units.forEach(unit => {
    options += `<option value="${unit}">${unit}</option>`;
  });
  
  formsDiv.innerHTML = `
    <div class="input-group">
      <label>From:</label>
      <select id="conv-from">${options}</select>
      <label>Value:</label>
      <input type="number" id="conv-value" placeholder="Enter value">
      <label>To:</label>
      <select id="conv-to">${options}</select>
      <button class="calc-btn" onclick="convert('${type}')">Convert</button>
    </div>
  `;
}

function convert(type) {
  const from = document.getElementById('conv-from').value;
  const to = document.getElementById('conv-to').value;
  const value = parseFloat(document.getElementById('conv-value').value);
  
  if (isNaN(value)) {
    return showConverterResult('Please enter a valid value');
  }
  
  let result;
  
  switch(type) {
    case 'length':
      result = convertLength(value, from, to);
      break;
    case 'weight':
      result = convertWeight(value, from, to);
      break;
    case 'temperature':
      result = convertTemperature(value, from, to);
      break;
    case 'area':
      result = convertArea(value, from, to);
      break;
    case 'volume':
      result = convertVolume(value, from, to);
      break;
    case 'speed':
      result = convertSpeed(value, from, to);
      break;
  }
  
  showConverterResult(`${value} ${from} = ${result.toFixed(4)} ${to}`);
}

function convertLength(value, from, to) {
  const toMeter = {
    'Meter': 1, 'Kilometer': 1000, 'Centimeter': 0.01, 'Millimeter': 0.001,
    'Mile': 1609.34, 'Yard': 0.9144, 'Foot': 0.3048, 'Inch': 0.0254
  };
  return (value * toMeter[from]) / toMeter[to];
}

function convertWeight(value, from, to) {
  const toKg = {
    'Kilogram': 1, 'Gram': 0.001, 'Milligram': 0.000001,
    'Pound': 0.453592, 'Ounce': 0.0283495, 'Ton': 1000
  };
  return (value * toKg[from]) / toKg[to];
}

function convertTemperature(value, from, to) {
  if (from === to) return value;
  
  let celsius;
  if (from === 'Celsius') celsius = value;
  else if (from === 'Fahrenheit') celsius = (value - 32) * 5/9;
  else celsius = value - 273.15;
  
  if (to === 'Celsius') return celsius;
  else if (to === 'Fahrenheit') return celsius * 9/5 + 32;
  else return celsius + 273.15;
}

function convertArea(value, from, to) {
  const toSqM = {
    'Square Meter': 1, 'Square Kilometer': 1000000, 'Hectare': 10000,
    'Square Mile': 2589988, 'Acre': 4046.86, 'Square Foot': 0.092903
  };
  return (value * toSqM[from]) / toSqM[to];
}

function convertVolume(value, from, to) {
  const toLiter = {
    'Liter': 1, 'Milliliter': 0.001, 'Cubic Meter': 1000,
    'Gallon': 3.78541, 'Quart': 0.946353, 'Pint': 0.473176, 'Cup': 0.236588
  };
  return (value * toLiter[from]) / toLiter[to];
}

function convertSpeed(value, from, to) {
  const toMPS = {
    'Meters/sec': 1, 'Kilometers/hr': 0.277778, 'Miles/hr': 0.44704,
    'Feet/sec': 0.3048, 'Knots': 0.514444
  };
  return (value * toMPS[from]) / toMPS[to];
}

function showConverterResult(msg) {
  document.getElementById('converter-result').innerHTML = msg;
}

// History Functions
function addToHistory(entry) {
  history.unshift(entry);
  if (history.length > 50) history.pop();
  saveHistory();
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  historyList.innerHTML = '';
  history.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = entry;
    li.onclick = () => {
      const parts = entry.split('=');
      if (parts.length === 2) {
        currentExpression = parts[0].trim();
        updateDisplay();
      }
    };
    historyList.appendChild(li);
  });
}

function clearHistory() {
  history = [];
  saveHistory();
  updateHistoryDisplay();
}

function saveHistory() {
  const historyData = { history };
  const dataStr = JSON.stringify(historyData);
  const storageKey = 'calc_history_' + Date.now();
  
  try {
    const existingKeys = Object.keys({});
    const calcKeys = existingKeys.filter(k => k.startsWith('calc_history_'));
    calcKeys.sort().reverse();
    
    if (calcKeys.length > 0) {
      historyData.history = history;
    }
  } catch (e) {
    console.log('History tracking in memory only');
  }
}

function loadHistory() {
  try {
    updateHistoryDisplay();
  } catch (e) {
    console.log('No history available');
  }
}

// Animation Functions
function animateButton() {
  const display = resultDisplay;
  display.style.transform = 'scale(1.02)';
  setTimeout(() => {
    display.style.transform = 'scale(1)';
  }, 100);
}

function animateResult() {
  resultDisplay.style.animation = 'none';
  setTimeout(() => {
    resultDisplay.style.animation = 'glow 2s ease-in-out infinite';
  }, 10);
}

// Keyboard Support
function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
      return;
    }
    
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
      inputNumber(e.key);
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
      inputOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      calculate();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      backspace();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
      clearAll();
    } else if (e.key === '(' || e.key === ')') {
      inputNumber(e.key);
    }
  });
}

// Touch Gestures
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
    if (deltaX > 0) {
      console.log('Swipe right detected');
    } else {
      console.log('Swipe left detected');
    }
  }
});

// Initialize on load
updateDisplay();
updateHistoryDisplay();