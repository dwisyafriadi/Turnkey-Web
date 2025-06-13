const { ethers } = require("ethers");

class PharosBot {
  constructor({ rpcUrl, chainId, privateKeys }) {
    this.rpcUrl = rpcUrl;
    this.chainId = chainId;
    this.privateKeys = privateKeys;
    this.wallets = [];
  }

  async initialize() {
    if (!this.privateKeys || this.privateKeys.length === 0) {
      throw new Error("Tidak ada private key yang diberikan.");
    }

    const provider = new ethers.JsonRpcProvider(this.rpcUrl, {
      chainId: this.chainId,
      name: "pharos",
    });

    this.wallets = this.privateKeys.map(
      (pk) => new ethers.Wallet(pk, provider)
    );
    console.log(`[INIT] ${this.wallets.length} wallet berhasil dimuat.`);
    this.wallets.forEach((w, i) =>
      console.log(`[WALLET ${i + 1}] ${w.address}`)
    );
  }

  async supplyPHRS({ amount, txCount, delay }) {
    console.log("[DEBUG] Raw amount:", amount);
    console.log("[DEBUG] txCount:", txCount, "| delay:", delay);

    // Validasi input
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      throw new Error(`❌ Invalid amount: ${amount}`);
    }
    if (!txCount || isNaN(txCount) || txCount <= 0) {
      throw new Error(`❌ Invalid txCount: ${txCount}`);
    }
    if (delay === undefined || isNaN(delay) || delay < 0) {
      throw new Error(`❌ Invalid delay: ${delay}`);
    }

    const amountWei = ethers.parseEther(amount);

    for (let wallet of this.wallets) {
      console.log(`[INFO] Wallet: ${wallet.address}`);

      for (let i = 0; i < txCount; i++) {
        // Di sini kamu bisa panggil contract.depositETH seperti biasa
        console.log(
          `[TX] Would supply ${amount} PHRS (in wei: ${amountWei}) - TX ${
            i + 1
          }/${txCount}`
        );

        // Simulasi delay
        if (i < txCount - 1) {
          console.log(`[WAIT] Menunggu ${delay} detik...`);
          await new Promise((resolve) => setTimeout(resolve, delay * 1000));
        }
      }
    }

    console.log("✅ PHRS Supply Completed.");
  }

  // Tambahkan fungsi lain di bawah ini jika kamu ingin aktifkan mint, borrow, dsb
}

module.exports = PharosBot;

const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "config.json");
const CONFIG = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const NETWORK_CONFIG = CONFIG.network;
const CONTRACTS = CONFIG.contracts;
const ERC20_ABI = CONFIG.abi.ERC20;
const FAUCET_ABI = CONFIG.abi.FAUCET;
const LENDING_POOL_ABI = CONFIG.abi.LENDING_POOL;
