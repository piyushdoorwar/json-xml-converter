// DOM Elements
const leftEditor = document.getElementById('left-editor');
const rightEditor = document.getElementById('right-editor');
const leftLineNumbers = document.getElementById('left-line-numbers');
const rightLineNumbers = document.getElementById('right-line-numbers');
const leftTitle = document.getElementById('left-title');
const rightTitle = document.getElementById('right-title');
const leftStatus = document.getElementById('left-status');
const rightStatus = document.getElementById('right-status');
const convertBtn = document.getElementById('convert-btn');
const convertBtnText = document.getElementById('convert-btn-text');
const modeBtns = document.querySelectorAll('.mode-btn');
const appContainer = document.querySelector('.app-container');

// Current mode
let currentMode = 'json-xml';

// Initialize
function init() {
    // Check URL hash for mode
    const hash = window.location.hash.substring(1);
    if (hash === 'xml-json' || hash === 'json-xml') {
        currentMode = hash;
    }
    
    updateMode();
    setupEventListeners();
    updateCharCounts();
}

// Setup Event Listeners
function setupEventListeners() {
    // Mode switcher
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;
            window.location.hash = currentMode;
            updateMode();
        });
    });
    
    // Hash change
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash === 'xml-json' || hash === 'json-xml') {
            currentMode = hash;
            updateMode();
        }
    });
    
    // Convert button
    convertBtn.addEventListener('click', handleConvert);
    
    // Action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            if (action) handleAction(action);
        });
    });
    
    // Dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const caseType = e.currentTarget.dataset.case;
            if (caseType) changeCasing(caseType);
        });
    });
    
    // Dropdown toggle
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const menu = toggle.nextElementSibling;
            menu.classList.toggle('show');
        });
    });
    
    // Close dropdowns
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    });
    
    // Character count and line numbers
    leftEditor.addEventListener('input', () => {
        updateCharCount('left');
        updateLineNumbers('left');
    });
    rightEditor.addEventListener('input', () => {
        updateCharCount('right');
        updateLineNumbers('right');
    });
    
    // Sync scroll for line numbers
    leftEditor.addEventListener('scroll', () => syncScroll('left'));
    rightEditor.addEventListener('scroll', () => syncScroll('right'));
    
    // Initialize line numbers
    updateLineNumbers('left');
    updateLineNumbers('right');
}

// Update Mode
function updateMode() {
    // Update mode buttons
    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === currentMode);
    });
    
    // Update container class
    appContainer.className = 'app-container mode-' + currentMode;
    
    if (currentMode === 'json-xml') {
        leftTitle.textContent = 'JSON Input';
        rightTitle.textContent = 'XML Output';
        convertBtnText.textContent = 'Convert JSON to XML';
        leftEditor.placeholder = 'Enter your JSON here...';
        rightEditor.placeholder = 'XML output will appear here...';
    } else {
        leftTitle.textContent = 'XML Input';
        rightTitle.textContent = 'JSON Output';
        convertBtnText.textContent = 'Convert XML to JSON';
        leftEditor.placeholder = 'Enter your XML here...';
        rightEditor.placeholder = 'JSON output will appear here...';
    }
    
    // Clear editors when switching
    leftEditor.value = '';
    rightEditor.value = '';
    updateStatus('left', 'Ready', false);
    updateStatus('right', 'Ready', false);
    updateCharCounts();
    updateLineNumbers('left');
    updateLineNumbers('right');
}

// Handle Actions
function handleAction(action) {
    switch(action) {
        case 'validate-left':
            validateEditor('left');
            break;
        case 'validate-right':
            validateEditor('right');
            break;
        case 'beautify-left':
            beautifyEditor('left');
            break;
        case 'beautify-right':
            beautifyEditor('right');
            break;
        case 'sort-keys':
            sortJsonKeys();
            break;
        case 'clear-left':
            leftEditor.value = '';
            updateStatus('left', 'Cleared', false);
            updateCharCount('left');
            updateLineNumbers('left');
            break;
        case 'clear-right':
            rightEditor.value = '';
            updateStatus('right', 'Cleared', false);
            updateCharCount('right');
            updateLineNumbers('right');
            break;
        case 'copy-right':
            copyToClipboard(rightEditor.value);
            break;
    }
}

// Validate Editor
function validateEditor(side) {
    const editor = side === 'left' ? leftEditor : rightEditor;
    const content = editor.value.trim();
    
    if (!content) {
        updateStatus(side, 'No content to validate', false);
        return;
    }
    
    try {
        if (currentMode === 'json-xml') {
            if (side === 'left') {
                JSON.parse(content);
                updateStatus(side, '✓ Valid JSON', true);
            } else {
                validateXML(content);
                updateStatus(side, '✓ Valid XML', true);
            }
        } else {
            if (side === 'left') {
                validateXML(content);
                updateStatus(side, '✓ Valid XML', true);
            } else {
                JSON.parse(content);
                updateStatus(side, '✓ Valid JSON', true);
            }
        }
    } catch (error) {
        updateStatus(side, '✗ ' + error.message, false, true);
    }
}

// Beautify Editor
function beautifyEditor(side) {
    const editor = side === 'left' ? leftEditor : rightEditor;
    const content = editor.value.trim();
    
    if (!content) {
        updateStatus(side, 'No content to beautify', false);
        return;
    }
    
    try {
        if (currentMode === 'json-xml') {
            if (side === 'left') {
                const obj = JSON.parse(content);
                editor.value = JSON.stringify(obj, null, 2);
                updateStatus(side, 'Beautified', true);
            } else {
                editor.value = formatXML(content);
                updateStatus(side, 'Beautified', true);
            }
        } else {
            if (side === 'left') {
                editor.value = formatXML(content);
                updateStatus(side, 'Beautified', true);
            } else {
                const obj = JSON.parse(content);
                editor.value = JSON.stringify(obj, null, 2);
                updateStatus(side, 'Beautified', true);
            }
        }
        updateCharCount(side);
        updateLineNumbers(side);
    } catch (error) {
        updateStatus(side, '✗ ' + error.message, false, true);
    }
}

// Sort JSON Keys
function sortJsonKeys() {
    if (currentMode !== 'json-xml') return;
    
    const content = leftEditor.value.trim();
    if (!content) {
        updateStatus('left', 'No JSON to sort', false);
        return;
    }
    
    try {
        const obj = JSON.parse(content);
        const sorted = sortObjectKeys(obj);
        leftEditor.value = JSON.stringify(sorted, null, 2);
        updateStatus('left', 'Keys sorted', true);
        updateCharCount('left');
        updateLineNumbers('left');
    } catch (error) {
        updateStatus('left', '✗ ' + error.message, false, true);
    }
}

// Sort Object Keys Recursively
function sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(sortObjectKeys);
    
    return Object.keys(obj).sort().reduce((result, key) => {
        result[key] = sortObjectKeys(obj[key]);
        return result;
    }, {});
}

// Change Casing
function changeCasing(caseType) {
    if (currentMode !== 'json-xml') return;
    
    const content = leftEditor.value.trim();
    if (!content) {
        updateStatus('left', 'No JSON to convert', false);
        return;
    }
    
    try {
        const obj = JSON.parse(content);
        const converted = convertObjectCasing(obj, caseType);
        leftEditor.value = JSON.stringify(converted, null, 2);
        updateStatus('left', `Converted to ${caseType}`, true);
        updateCharCount('left');
        updateLineNumbers('left');
    } catch (error) {
        updateStatus('left', '✗ ' + error.message, false, true);
    }
}

// Convert Object Casing
function convertObjectCasing(obj, caseType) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(item => convertObjectCasing(item, caseType));
    
    return Object.keys(obj).reduce((result, key) => {
        const newKey = convertCase(key, caseType);
        result[newKey] = convertObjectCasing(obj[key], caseType);
        return result;
    }, {});
}

// Convert Case
function convertCase(str, caseType) {
    // Split by various delimiters
    const words = str.split(/[\s_-]|(?=[A-Z])/).filter(Boolean).map(w => w.toLowerCase());
    
    switch(caseType) {
        case 'camel':
            return words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
        case 'pascal':
            return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        case 'snake':
            return words.join('_');
        case 'kebab':
            return words.join('-');
        default:
            return str;
    }
}

// Handle Convert
function handleConvert() {
    const input = leftEditor.value.trim();
    
    if (!input) {
        updateStatus('left', 'No input to convert', false);
        return;
    }
    
    try {
        if (currentMode === 'json-xml') {
            const obj = JSON.parse(input);
            const xml = jsonToXML(obj);
            rightEditor.value = xml;
            updateStatus('left', '✓ Valid JSON', true);
            updateStatus('right', '✓ Converted to XML', true);
        } else {
            const obj = xmlToJSON(input);
            rightEditor.value = JSON.stringify(obj, null, 2);
            updateStatus('left', '✓ Valid XML', true);
            updateStatus('right', '✓ Converted to JSON', true);
        }
        updateCharCount('right');
        updateLineNumbers('right');
    } catch (error) {
        updateStatus('left', '✗ ' + error.message, false, true);
    }
}

// JSON to XML Converter
function jsonToXML(obj, rootName = 'root') {
    function escapeXML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    
    function convert(obj, name, level = 0) {
        const indent = '  '.repeat(level);
        
        if (obj === null || obj === undefined) {
            return `${indent}<${name} />\n`;
        }
        
        if (typeof obj === 'object' && !Array.isArray(obj)) {
            let result = `${indent}<${name}>\n`;
            for (let key in obj) {
                result += convert(obj[key], key, level + 1);
            }
            result += `${indent}</${name}>\n`;
            return result;
        } else if (Array.isArray(obj)) {
            let result = '';
            obj.forEach(item => {
                result += convert(item, name, level);
            });
            return result;
        } else {
            return `${indent}<${name}>${escapeXML(obj)}</${name}>\n`;
        }
    }
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += convert(obj, rootName, 0);
    return xml.trim();
}

// XML to JSON Converter
function xmlToJSON(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid XML: ' + parserError.textContent);
    }
    
    function parseNode(node) {
        if (node.nodeType === 3) { // Text node
            const text = node.textContent.trim();
            return text || null;
        }
        
        if (node.nodeType !== 1) return null; // Element node
        
        const obj = {};
        
        // Handle attributes
        if (node.attributes.length > 0) {
            obj['@attributes'] = {};
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                obj['@attributes'][attr.name] = attr.value;
            }
        }
        
        // Handle child nodes
        if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
            // Only text content
            const text = node.childNodes[0].textContent.trim();
            if (node.attributes.length > 0) {
                obj['#text'] = text;
                return obj;
            }
            return text;
        }
        
        const children = {};
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType !== 1) continue;
            
            const childData = parseNode(child);
            const childName = child.nodeName;
            
            if (children[childName]) {
                if (!Array.isArray(children[childName])) {
                    children[childName] = [children[childName]];
                }
                children[childName].push(childData);
            } else {
                children[childName] = childData;
            }
        }
        
        return Object.keys(children).length > 0 ? { ...obj, ...children } : obj;
    }
    
    const root = xmlDoc.documentElement;
    return { [root.nodeName]: parseNode(root) };
}

// Validate XML
function validateXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error(parserError.textContent);
    }
    return true;
}

// Format XML
function formatXML(xml) {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;
    
    xml = xml.replace(reg, '$1\n$2$3');
    xml.split('\n').forEach(node => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }
        
        formatted += PADDING.repeat(pad) + node + '\n';
        pad += indent;
    });
    
    return formatted.trim();
}

// Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        updateStatus('right', '✓ Copied to clipboard', true);
        setTimeout(() => updateStatus('right', 'Ready', false), 2000);
    } catch (error) {
        updateStatus('right', '✗ Failed to copy', false, true);
    }
}

// Update Status
function updateStatus(side, message, isSuccess = false, isError = false) {
    const statusBar = side === 'left' ? leftStatus : rightStatus;
    const statusText = statusBar.querySelector('.status-text');
    statusText.textContent = message;
    statusText.classList.remove('success', 'error');
    if (isSuccess) statusText.classList.add('success');
    if (isError) statusText.classList.add('error');
}

// Update Line Numbers
function updateLineNumbers(side) {
    const editor = side === 'left' ? leftEditor : rightEditor;
    const lineNumbersEl = side === 'left' ? leftLineNumbers : rightLineNumbers;
    
    const content = editor.value;
    const lines = content.split('\n');
    const lineCount = lines.length;
    
    // Generate line numbers
    let lineNumbersHTML = '';
    for (let i = 1; i <= lineCount; i++) {
        lineNumbersHTML += `<span class="line-number">${i}</span>`;
    }
    
    lineNumbersEl.innerHTML = lineNumbersHTML;
}

// Sync Scroll
function syncScroll(side) {
    const editor = side === 'left' ? leftEditor : rightEditor;
    const lineNumbersEl = side === 'left' ? leftLineNumbers : rightLineNumbers;
    
    lineNumbersEl.scrollTop = editor.scrollTop;
}

// Update Character Count
function updateCharCount(side) {
    const editor = side === 'left' ? leftEditor : rightEditor;
    const statusBar = side === 'left' ? leftStatus : rightStatus;
    const charCount = statusBar.querySelector('.char-count');
    charCount.textContent = `${editor.value.length} characters`;
}

function updateCharCounts() {
    updateCharCount('left');
    updateCharCount('right');
}

// Initialize on load
init();
