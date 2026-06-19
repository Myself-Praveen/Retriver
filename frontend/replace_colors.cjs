const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We only want to replace classes, so we can just do string replacements safely
      // as there are no random occurrences of these strings in standard text usually.
      content = content.replace(/\bborder-black\b/g, 'border-[var(--color-border)]');
      content = content.replace(/\btext-black\b/g, 'text-[var(--color-text)]');
      content = content.replace(/\bbg-white\b/g, 'bg-[var(--color-surface)]');
      
      // Fix shadows
      content = content.replace(/shadow-\[([^\]]+)_#000\]/g, 'shadow-[$1_var(--color-shadow)]');
      content = content.replace(/shadow-\[([^\]]+)_#fff\]/g, 'shadow-[$1_var(--color-shadow)]');
      
      // Fix some other text-black variants
      content = content.replace(/\btext-black\/80\b/g, 'text-[var(--color-text-muted)]');
      content = content.replace(/\btext-black\/70\b/g, 'text-[var(--color-text-muted)]');
      content = content.replace(/\bborder-black\/10\b/g, 'border-[var(--color-border)]');
      content = content.replace(/\bborder-black\/30\b/g, 'border-[var(--color-border)]');
      content = content.replace(/\bborder-black\/20\b/g, 'border-[var(--color-border)]');

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(srcDir);
console.log('Colors replaced with CSS variables for dark mode support!');
