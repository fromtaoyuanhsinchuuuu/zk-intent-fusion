# 🔧 多标签页实时同步功能

## 已实现的功能

✅ **跨标签页状态同步**
- 使用 Zustand persist 中间件 + localStorage
- 自定义 `useCrossTabSync` hook 监听 storage 事件
- 所有页面自动实时更新

## 如何测试

### 1. 确保服务正在运行

```bash
# Terminal 1: Backend
cd packages/solver
python -m uvicorn src.api.server:app --host 0.0.0.0 --port 8787 --reload

# Terminal 2: Frontend  
cd packages/nextjs
npm run dev
```

### 2. 打开所有演示标签页

```bash
./open-demo-tabs.sh
```

或手动打开：
- Tab 1: http://localhost:3000/zk-intent (User Alice)
- Tab 2: http://localhost:3000/zk-intent/parsing (Parsing Agent)
- Tab 3: http://localhost:3000/zk-intent/solvers/bob (Solver Bob)
- Tab 4: http://localhost:3000/zk-intent/solvers/charlie (Solver Charlie)
- Tab 5: http://localhost:3000/zk-intent/solvers/eve (Solver Eve)
- Tab 6: http://localhost:3000/zk-intent/auction (Auction)
- Tab 7: http://localhost:3000/zk-intent/execution (Execution)

### 3. 运行 Demo

**在 Tab 1 (User):**
1. 连接钱包（如果还没连接）
2. 输入 intent: "Use all my stablecoins for 3 months, highest APY, tolerate 3% gas"
3. 点击 "Parse Intent"

**期望结果：**
- ✅ Tab 2 (Parsing) 立即显示解析进度和结果
- ✅ Tab 3, 4, 5 (Solvers) 立即显示 intent 信息
  - Bob 和 Charlie 能看到明文
  - Eve 只能看到密文 🔐
- ✅ 点击 "Run Auction" 后，Tab 6 立即显示竞拍结果
- ✅ 点击 "Authorize" 后，Tab 7 显示执行进度

## 技术实现

### 1. Zustand Store with Persist (/lib/intentStore.ts)

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

export const useIntentStore = create<IntentState>()(
  persist(
    (set) => ({ ...actions }),
    {
      name: 'intent-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 2. Cross-Tab Sync Hook (/hooks/useCrossTabSync.ts)

```typescript
export function useCrossTabSync() {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'intent-storage' && e.newValue) {
        const newState = JSON.parse(e.newValue);
        useIntentStore.setState(newState.state);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
}
```

### 3. 在每个页面使用

```typescript
export default function SomePage() {
  useCrossTabSync(); // 启用跨标签页同步
  const { someData } = useIntentStore();
  // ...
}
```

## 工作原理

1. **写入数据 (Tab 1 - User):**
   - 用户提交 intent
   - `setIntent()` 更新 Zustand store
   - Persist 中间件自动写入 localStorage
   - `storage` 事件被触发

2. **读取数据 (Tab 2-7 - 其他页面):**
   - `useCrossTabSync` hook 监听 `storage` 事件
   - 检测到 `intent-storage` key 变化
   - 解析新的状态并更新 Zustand store
   - React 组件自动重新渲染

3. **实时性:**
   - localStorage 更改是浏览器级别的事件
   - 跨标签页传播速度 < 100ms
   - 用户体验流畅

## 故障排除

### 问题：其他标签页没有更新

**检查 1: 确认 localStorage 是否写入**
```javascript
// 在浏览器控制台运行
console.log(localStorage.getItem('intent-storage'));
```

**检查 2: 确认 storage 事件是否触发**
```javascript
// 在任意标签页控制台运行
window.addEventListener('storage', (e) => {
  console.log('Storage event:', e.key, e.newValue);
});
```

**检查 3: 清除 localStorage 并重试**
```javascript
localStorage.removeItem('intent-storage');
location.reload();
```

### 问题：编译错误

**解决方案:**
```bash
cd packages/nextjs
rm -rf .next
npm run dev
```

### 问题：Hook 未生效

确认每个页面都添加了 `useCrossTabSync()`：
```typescript
export default function MyPage() {
  useCrossTabSync(); // ← 必须在最顶部调用
  const data = useIntentStore();
  // ...
}
```

## 性能优化

当前实现已经很高效：
- ✅ 只监听特定的 localStorage key
- ✅ 只在数据变化时更新
- ✅ React 只重新渲染受影响的组件
- ✅ 无需轮询或 WebSocket

## 下一步

如果需要更高级的功能：
- [ ] 添加冲突解决机制（多个用户同时操作）
- [ ] 使用 WebSocket 替代 localStorage（支持多设备同步）
- [ ] 添加版本控制（防止状态回滚）
- [ ] 压缩 localStorage 数据（减少存储空间）

---

**🎉 现在你的多角色演示应该可以完美工作了！**

打开所有标签页，提交 intent，然后看着魔法发生！✨
