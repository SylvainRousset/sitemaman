# Solutions pour le problème de mémoire (96%)

## 🚨 Problème identifié
Next.js 16 + Tailwind CSS v4 + Windows = FUITE MÉMOIRE MASSIVE

## ✅ Solutions appliquées

### 1. Configuration Next.js optimisée
- ✅ Fast Refresh désactivé (cause principale)
- ✅ File watchers convertis en polling
- ✅ Cache webpack désactivé
- ✅ Workers réduits à 1

### 2. Scripts de démarrage sécurisés
```bash
# Option 1: Mode normal (2GB RAM max)
npm run dev

# Option 2: Mode ultra-léger (1GB RAM max) - RECOMMANDÉ
npm run dev:safe

# Option 3: Script Windows batch
dev.bat
```

### 3. Nettoyage avant chaque démarrage
```bash
npm run clean
```

## 🔧 Si le problème persiste

### Solution A: Downgrade Tailwind CSS v4 → v3
Tailwind v4 est trop récent et a des bugs de mémoire.

```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install tailwindcss@^3.4.0 postcss@^8.4.32 autoprefixer@^10.4.16
```

Puis modifier `tailwind.config.js` (v3 utilise .js pas .mjs)

### Solution B: Désactiver Turbopack
Si `--turbo` cause des problèmes, utilisez:
```bash
set NODE_OPTIONS=--max-old-space-size=1024 && next dev
```

### Solution C: Augmenter la mémoire virtuelle Windows
1. Panneau de configuration → Système
2. Paramètres système avancés
3. Performances → Paramètres
4. Avancé → Mémoire virtuelle
5. Augmenter à 8000-16000 MB

### Solution D: Mode production local
En dernier recours, développez en mode production:
```bash
npm run build
npm run start
```

## 📊 Surveiller la mémoire
1. Ouvrir Gestionnaire des tâches (Ctrl+Shift+Esc)
2. Chercher "Node.js"
3. Si > 2GB → PROBLÈME
4. Si augmentation continue → FUITE MÉMOIRE

## 🆘 Désactiver hot-reload complètement
Si vous ne voulez PAS le rechargement automatique:

Modifiez `next.config.mjs`:
```javascript
webpack: (config, { dev }) => {
  if (dev) {
    config.watchOptions = false; // DÉSACTIVER complètement
  }
  return config;
}
```

Vous devrez redémarrer manuellement après chaque modification.

## 🎯 Ordre de priorité des solutions
1. ✅ Utilisez `dev.bat` ou `npm run dev:safe`
2. Si échec → Downgrade Tailwind v4 → v3
3. Si échec → Augmenter mémoire virtuelle Windows
4. Si échec → Mode production (`npm run build && npm start`)
5. Si échec → Désactiver hot-reload complètement
