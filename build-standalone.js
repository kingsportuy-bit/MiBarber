const fs = require('fs');
const path = require('path');

// Crear directorio standalone si no existe
const standaloneDir = path.join(__dirname, '.next', 'standalone');
if (!fs.existsSync(standaloneDir)) {
  fs.mkdirSync(standaloneDir, { recursive: true });
  console.log('Directorio standalone creado');
} else {
  console.log('Directorio standalone ya existe');
}

// Copiar archivos necesarios al directorio standalone
const sourceDir = __dirname;
const targetDir = path.join(standaloneDir, 'web');

// Crear directorio de destino si no existe
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copiar directorio al directorio standalone, excluyendo el directorio standalone
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    // Excluir el directorio standalone para evitar bucles infinitos
    if (entry.name === '.next' && fs.statSync(path.join(src, entry.name)).isDirectory()) {
      const nextDir = path.join(src, entry.name);
      const nextEntries = fs.readdirSync(nextDir, { withFileTypes: true });
      const targetNextDir = path.join(dest, entry.name);
      
      if (!fs.existsSync(targetNextDir)) {
        fs.mkdirSync(targetNextDir, { recursive: true });
      }
      
      for (let nextEntry of nextEntries) {
        if (nextEntry.name !== 'standalone') {
          const srcPath = path.join(nextDir, nextEntry.name);
          const destPath = path.join(targetNextDir, nextEntry.name);
          
          if (nextEntry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
    } else if (entry.name !== 'build-standalone.js' && entry.name !== 'node_modules') {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

console.log('Copiando archivos al directorio standalone...');
copyDir(sourceDir, targetDir);
console.log('Archivos copiados exitosamente');

// Crear package.json básico en el directorio standalone
const packageJson = {
  name: 'my-app-standalone',
  version: '0.0.1',
  main: 'server.js',
  dependencies: {
    'next': '15.5.3',
    'react': '19.0.0',
    'react-dom': '19.0.0'
  }
};

const packageJsonPath = path.join(standaloneDir, 'package.json');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('package.json creado en el directorio standalone');

console.log('¡Directorio standalone generado exitosamente!');