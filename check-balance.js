import { ethers } from 'ethers';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.bridge' });

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// RPC 配置
const ARB_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';
const OP_SEPOLIA_RPC = 'https://sepolia.optimism.io';

async function checkBalances() {
  try {
    console.log('💰 检查账户余额\n');
    
    if (!PRIVATE_KEY) {
      console.error('❌ 错误：未找到 PRIVATE_KEY 环境变量');
      return;
    }

    // 从私钥获取地址
    const wallet = new ethers.Wallet(PRIVATE_KEY);
    const address = wallet.address;
    
    console.log(`📍 钱包地址: ${address}\n`);
    console.log('=' .repeat(60));

    // 检查 Arbitrum Sepolia 余额
    console.log('\n🔵 Arbitrum Sepolia:');
    try {
      const arbProvider = new ethers.JsonRpcProvider(ARB_SEPOLIA_RPC);
      const arbBalance = await arbProvider.getBalance(address);
      const arbBalanceEth = ethers.formatEther(arbBalance);
      console.log(`   余额: ${arbBalanceEth} ETH`);
      console.log(`   浏览器: https://sepolia.arbiscan.io/address/${address}`);
    } catch (error) {
      console.error(`   ❌ 查询失败: ${error.message}`);
    }

    // 检查 OP Sepolia 余额
    console.log('\n🔴 OP Sepolia:');
    try {
      const opProvider = new ethers.JsonRpcProvider(OP_SEPOLIA_RPC);
      const opBalance = await opProvider.getBalance(address);
      const opBalanceEth = ethers.formatEther(opBalance);
      console.log(`   余额: ${opBalanceEth} ETH`);
      console.log(`   浏览器: https://sepolia-optimism.etherscan.io/address/${address}`);
    } catch (error) {
      console.error(`   ❌ 查询失败: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n💡 提示: 如果刚完成桥接，请等待几分钟后再次检查 OP Sepolia 余额');

  } catch (error) {
    console.error('❌ 发生错误:', error.message);
  }
}

checkBalances();
