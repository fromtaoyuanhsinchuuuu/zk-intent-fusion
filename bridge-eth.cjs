const { NexusSDK } = require('@avail-project/nexus');
const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.bridge' });

// ========== 配置 ==========
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AMOUNT = '0.0001'; // 要桥接的 ETH 数量

// Arbitrum Sepolia 配置
const ARB_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';
const ARB_SEPOLIA_CHAIN_ID = 421614;

// OP Sepolia Chain ID
const OP_SEPOLIA_CHAIN_ID = 11155420;

// ========== 主函数 ==========
async function bridgeETH() {
  try {
    console.log('🌉 开始桥接 ETH from Arbitrum Sepolia → OP Sepolia\n');

    if (!PRIVATE_KEY) {
      console.error('❌ 错误：未找到 PRIVATE_KEY 环境变量');
      console.log('请确保 .env.bridge 文件存在并包含 PRIVATE_KEY');
      return;
    }

    // 1. 创建 Provider 和 Signer
    console.log('⚙️  连接到 Arbitrum Sepolia...');
    const provider = new ethers.JsonRpcProvider(ARB_SEPOLIA_RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
    console.log(`📍 钱包地址: ${signer.address}`);
  
    // 2. 检查余额
    console.log('💰 检查余额...');
    const balance = await provider.getBalance(signer.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`💰 Arbitrum Sepolia 余额: ${balanceInEth} ETH`);
  
    if (parseFloat(balanceInEth) < parseFloat(AMOUNT)) {
      console.log(`❌ 余额不足！需要至少 ${AMOUNT} ETH（加上 gas 费）`);
      console.log(`💡 当前余额: ${balanceInEth} ETH`);
      return;
    }
    
    // 估算需要的总金额（包括 gas）
    const estimatedGas = 0.001; // 预估 gas 费
    const totalNeeded = parseFloat(AMOUNT) + estimatedGas;
    if (parseFloat(balanceInEth) < totalNeeded) {
      console.log(`⚠️  警告：余额可能不足以支付 gas 费`);
      console.log(`   需要: ~${totalNeeded} ETH (${AMOUNT} + ~${estimatedGas} gas)`);
      console.log(`   当前: ${balanceInEth} ETH`);
    }
    console.log('');

    // 3. 初始化 Nexus SDK
    console.log('⚙️  初始化 Nexus SDK...');
    const sdk = new NexusSDK({ 
      network: 'testnet',
      debug: true 
    });
  
    console.log('   正在初始化连接...');
    await sdk.initialize(signer);
    console.log('✅ SDK 初始化完成\n');

    // 4. 查询统一余额（可选）
    console.log('💰 查询统一余额...');
    try {
      const balances = await sdk.getUnifiedBalances();
      console.log('统一余额:', JSON.stringify(balances, null, 2));
    } catch (e) {
      console.log('   跳过统一余额查询（可能不支持）:', e.message);
    }
    console.log('');

    // 5. 模拟桥接（可选）
    console.log('🔍 模拟桥接交易...');
    try {
      const simulation = await sdk.simulateBridge({
        token: 'ETH',
        amount: parseFloat(AMOUNT),
        chainId: OP_SEPOLIA_CHAIN_ID,
      });
      console.log('模拟结果:', JSON.stringify(simulation, null, 2));
    } catch (e) {
      console.log('   跳过模拟（可能不支持）:', e.message);
    }
    console.log('');

    // 6. 执行桥接
    console.log('🚀 开始桥接交易...');
    console.log(`   从: Arbitrum Sepolia (Chain ID: ${ARB_SEPOLIA_CHAIN_ID})`);
    console.log(`   到: OP Sepolia (Chain ID: ${OP_SEPOLIA_CHAIN_ID})`);
    console.log(`   代币: ETH`);
    console.log(`   数量: ${AMOUNT} ETH\n`);

    console.log('⏳ 发送交易中...');
    const result = await sdk.bridge({
      token: 'ETH',
      amount: parseFloat(AMOUNT),
      chainId: OP_SEPOLIA_CHAIN_ID,
    });

    // 7. 显示结果
    console.log('\n========== 桥接结果 ==========');
    console.log('完整结果:', JSON.stringify(result, null, 2));
  
    if (result.success) {
      console.log('\n✅ 桥接交易已成功发送！');
      if (result.txHash) {
        console.log(`📝 交易哈希: ${result.txHash}`);
        console.log(`🔗 Arbitrum Sepolia 浏览器: https://sepolia.arbiscan.io/tx/${result.txHash}`);
      }
      if (result.explorerUrl) {
        console.log(`🔗 浏览器链接: ${result.explorerUrl}`);
      }
      console.log('\n⏳ 跨链交易通常需要几分钟到几十分钟完成');
      console.log('💡 你可以在 OP Sepolia 上检查余额来确认到账');
      console.log(`   地址: ${signer.address}`);
    } else {
      console.log('\n❌ 桥接失败');
      if (result.error) {
        console.log('错误信息:', result.error);
      }
    }

  } catch (error) {
    console.error('\n❌ 发生错误:');
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    if (error.reason) {
      console.error('错误原因:', error.reason);
    }
    if (error.stack && process.env.DEBUG) {
      console.error('\n堆栈跟踪:', error.stack);
    }
    
    // 提供故障排除建议
    console.log('\n💡 故障排除建议:');
    if (error.message.includes('insufficient funds')) {
      console.log('   - 余额不足，请确保有足够的 ETH 支付 gas 费');
    } else if (error.message.includes('network')) {
      console.log('   - 网络连接问题，请检查 RPC 节点是否可用');
    } else if (error.message.includes('nonce')) {
      console.log('   - Nonce 问题，请等待之前的交易确认');
    }
    console.log('   - 启用调试模式: export DEBUG=1');
  }
}

// 运行
console.log('🚀 Nexus SDK 桥接测试脚本');
console.log('=' .repeat(50));
bridgeETH().then(() => {
  console.log('\n✨ 脚本执行完成');
}).catch(err => {
  console.error('脚本执行失败:', err);
  process.exit(1);
});
