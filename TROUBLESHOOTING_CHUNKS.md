# 🔧 Troubleshooting Guide: Chunk Loading Errors

## ⚡ **Quick Fix for ChunkLoadError**

If you encounter the error:
```
ChunkLoadError: Loading chunk app/layout failed.
(timeout: http://localhost:3000/_next/static/chunks/app/layout.js)
```

### 🚀 **Immediate Solution**

Run this command to clean caches and restart:
```bash
npm run clean-dev
```

Or manually:
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

---

## 🔍 **Root Causes**

### 1. **Corrupted Build Cache**
- **Cause**: Next.js build cache gets corrupted during development
- **Solution**: Clear `.next` directory
- **Prevention**: Regular cache cleaning

### 2. **Webpack Bundle Issues**
- **Cause**: Development bundle splitting issues
- **Solution**: Updated `next.config.js` with better webpack config
- **Prevention**: Proper chunk splitting configuration

### 3. **Node Modules Cache**
- **Cause**: Cached modules become stale
- **Solution**: Clear `node_modules/.cache`
- **Prevention**: Regular dependency updates

### 4. **TypeScript Build Info**
- **Cause**: Stale TypeScript compilation info
- **Solution**: Remove `tsconfig.tsbuildinfo`
- **Prevention**: Clean builds

---

## 🛠️ **Available Commands**

### **Quick Clean & Start**
```bash
npm run clean-dev
```

### **Just Clean Cache**
```bash
npm run clean
```

### **Full Reset** (if above doesn't work)
```bash
rm -rf node_modules
rm -rf .next
npm install
npm run dev
```

---

## 🎯 **Next.js Configuration Improvements**

Added to `next.config.js`:
```javascript
experimental: {
  forceSwcTransforms: true,
},
webpack: (config, { dev, isServer }) => {
  if (dev && !isServer) {
    // Improve chunk loading reliability
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        react: {
          name: 'react',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        },
      },
    };
  }
  return config;
},
```

---

## 🚨 **When to Use Each Solution**

| Error Type | Solution | Time Required |
|------------|----------|---------------|
| Chunk loading timeout | `npm run clean` | 30 seconds |
| Build cache issues | `rm -rf .next` | 1 minute |
| Dependency conflicts | Full reset | 2-3 minutes |
| Persistent errors | Update Next.js | 5+ minutes |

---

## 📊 **Prevention Tips**

### **Development Best Practices**
1. **Regular cache clearing**: Run `npm run clean` weekly
2. **Proper shutdown**: Use `Ctrl+C` to stop dev server cleanly
3. **Dependency management**: Keep packages updated
4. **Hot reload limits**: Restart server after major changes

### **Environment Setup**
1. **Node.js version**: Use stable LTS version
2. **Disk space**: Ensure adequate free space
3. **Antivirus**: Exclude project folder from real-time scanning
4. **File watchers**: Configure proper file watching limits

---

## 🔄 **Automated Solutions**

### **Pre-commit Hook** (optional)
```bash
# Add to .husky/pre-commit
npm run clean
```

### **Development Workflow**
```bash
# Daily development start
npm run clean-dev

# After pulling changes
npm run clean && npm install && npm run dev

# Before important work
npm run clean && npm run build && npm run dev
```

---

## 🆘 **Emergency Reset**

If nothing else works:
```bash
# Nuclear option - complete reset
rm -rf node_modules
rm -rf .next
rm -rf .env.local.backup
npm cache clean --force
npm install
npm run dev
```

⚠️ **Note**: This will require re-entering environment variables

---

## ✅ **Success Indicators**

After fixing:
- ✅ Server starts without errors
- ✅ Pages load instantly
- ✅ Hot reload works smoothly
- ✅ No chunk loading errors in console
- ✅ All routes accessible

---

## 🎉 **Fixed!**

Your SmartAgri application should now be running smoothly at `http://localhost:3000` without any chunk loading errors!

For future issues, always try `npm run clean-dev` first - it solves 90% of development cache problems.
