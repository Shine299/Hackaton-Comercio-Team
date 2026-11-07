/**
 * Diagnóstico: muestra cómo compila react-native-css (nativo) las clases de Tailwind indicadas.
 * Uso: node scripts/debug-native-css.cjs min-h-12 gap-1.5 flex-1
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const req = (m) => require(require.resolve(m, { paths: [root] }));
const postcss = req('postcss');
const tailwind = req('@tailwindcss/postcss');
const { compile } = req('react-native-css/compiler');

const wanted = process.argv.slice(2);

(async () => {
  const from = path.join(root, 'src/global.css');
  const css = fs.readFileSync(from, 'utf8');
  const out = await postcss([tailwind({ base: root })]).process(css, { from });
  const sheet = compile(out.css, { filename: from, projectRoot: root }).stylesheet();
  for (const [name, ruleSet] of sheet.s || []) {
    if (wanted.length === 0 || wanted.includes(name)) {
      console.log(name, JSON.stringify(ruleSet));
    }
  }
  console.log('rem:', sheet.r);
})();
