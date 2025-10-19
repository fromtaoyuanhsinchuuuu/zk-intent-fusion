# Nexus Bridge 集成指南

## 🎯 概述

已成功将 Avail Nexus SDK 集成到 Next.js 项目中，提供跨链桥接功能。

## 📁 文件位置

- **页面**: `/packages/nextjs/app/nexus-bridge/page.tsx`
- **导航**: 已添加到 Header 组件中

## 🚀 使用步骤

### 1. 启动开发服务器

```bash
cd /home/higobear/Coding/zk-intent-fusion/packages/nextjs
yarn dev
```

### 2. 访问 Nexus Bridge 页面

打开浏览器访问: `http://localhost:3000/nexus-bridge`

### 3. 连接钱包

1. 点击页面右上角的 "Connect Wallet" 按钮
2. 选择你的钱包（MetaMask、WalletConnect 等）
3. 确保连接到正确的网络

### 4. 执行桥接

页面提供了三个桥接选项：

#### 选项 1: Bridge 0.0001 ETH
- 预设金额：0.0001 ETH
- 目标链：OP Sepolia (Chain ID: 11155420)
- 点击蓝色按钮即可开始

#### 选项 2: Bridge 0.001 ETH
- 预设金额：0.001 ETH（更大金额用于测试）
- 目标链：OP Sepolia
- 点击蓝色按钮即可开始

#### 选项 3: Custom Bridge
- 可自定义所有参数
- 打开 Nexus Widget 进行配置
- 点击紫色按钮打开

## 📊 测试账户信息

```
钱包地址: 0x947fF365B7099aC8b90e4f1024Fc8A2F6D2f3eD4
私钥: b0c3c92c1ee1c26cf6da10b77ffdb866359d0110550c6b8fa5a3e2d955c0321a

当前余额:
- Arbitrum Sepolia: 0.05 ETH
- OP Sepolia: 0.05 ETH
```

## 🔧 技术细节

### 依赖包

```json
{
  "@avail-project/nexus-widgets": "^1.3.12-beta.0"
}
```

### 配置

```typescript
<NexusProvider
  config={{
    network: "testnet",  // 使用测试网
    debug: true,         // 启用调试日志
  }}
>
```

### 支持的网络

**Testnet 支持:**
- Arbitrum Sepolia (Chain ID: 421614)
- OP Sepolia (Chain ID: 11155420)
- 其他 Sepolia 测试网

## 📝 工作流程

1. **用户连接钱包** → Wagmi 提供钱包连接
2. **初始化 Nexus Provider** → 使用 window.ethereum
3. **点击桥接按钮** → 打开 Nexus Modal
4. **选择参数** → Token, Amount, Destination Chain
5. **确认交易** → 在钱包中签名
6. **等待完成** → 通常需要几分钟
7. **检查余额** → 在目标链上确认到账

## 🎨 UI 特性

- ✅ 响应式设计（移动端友好）
- ✅ DaisyUI 主题集成
- ✅ Loading 状态指示
- ✅ 交易链接到区块浏览器
- ✅ 网络信息展示
- ✅ 使用说明

## ⚠️ 注意事项

1. **Gas 费用**: 确保源链上有足够的 ETH 支付 gas
2. **网络切换**: Nexus 会自动处理网络切换
3. **交易时间**: 跨链桥接通常需要 5-30 分钟
4. **测试网**: 当前配置仅支持测试网，生产环境需改为 `network: "mainnet"`

## 🐛 调试

如果遇到问题，检查浏览器控制台：

```javascript
// 调试模式已启用，会输出详细日志
config: {
  debug: true
}
```

常见问题：
- **Provider not found**: 确保已连接钱包
- **Network mismatch**: 切换到正确的网络
- **Insufficient balance**: 检查账户余额

## 📚 相关链接

- [Nexus SDK 文档](https://github.com/availproject/nexus-sdk)
- [Arbitrum Sepolia 浏览器](https://sepolia.arbiscan.io)
- [OP Sepolia 浏览器](https://sepolia-optimism.etherscan.io)

## 🎉 下一步

完成桥接后，可以：
1. 在区块浏览器查看交易
2. 检查目标链上的余额
3. 将桥接功能集成到你的 DApp 中
4. 添加更多代币支持
5. 自定义 UI 样式

## 💡 提示

- 第一次使用可能需要批准代币（如果是 ERC20）
- 桥接完成后会收到通知
- 可以在 Nexus Modal 中查看交易历史
- 支持多个钱包同时使用
