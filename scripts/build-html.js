const fs = require('fs');
const path = require('path');

function generateHtml() {
  const rootDir = path.resolve(__dirname, '..');
  const templatePath = path.join(rootDir, 'assets', 'index.html.template');
  const manifestPath = path.join(rootDir, 'public', 'build', 'manifest.json');
  const outputPath = path.join(rootDir, 'public', 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found at ${templatePath}`);
    return;
  }

  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (e) {
      console.warn('Could not parse manifest.json, using fallback paths', e);
    }
  }

  let html = fs.readFileSync(templatePath, 'utf8');

  const cssPath = manifest['build/ioda.css'] || '/build/ioda.css';
  const runtimeJsPath = manifest['build/runtime.js'] || '/build/runtime.js';
  const iodaJsPath = manifest['build/ioda.js'] || '/build/ioda.js';

  html = html.replace('{{ CSS_PATH }}', cssPath);
  html = html.replace('{{ RUNTIME_JS_PATH }}', runtimeJsPath);
  html = html.replace('{{ IODA_JS_PATH }}', iodaJsPath);

  const isDev = process.env.APP_ENV === 'dev' || process.env.NODE_ENV !== 'production';
  const robotsMeta = isDev ? '<meta name="robots" content="noindex">\n        ' : '';
  html = html.replace('{{ ROBOTS_META }}', robotsMeta);

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Generated ${outputPath}`);
}

if (require.main === module) {
  generateHtml();
}

module.exports = generateHtml;
