require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const PharosBot = require("./pharos-bot");
const config = require("./config.json");

const DEFAULT_RPC_URL = config.network.rpc;
const DEFAULT_CHAIN_ID = config.network.chainId;

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// ------------------------------
// Halaman input Private Key
// ------------------------------
app.get("/", (req, res) => {
  res.render("index");
});

// ------------------------------
// Inisialisasi Bot
// ------------------------------
app.post("/init", async (req, res) => {
  const { privateKey1 } = req.body;

  const bot = new PharosBot({
    rpcUrl: process.env.RPC_URL || DEFAULT_RPC_URL,
    chainId: parseInt(process.env.CHAIN_ID || DEFAULT_CHAIN_ID),
    privateKeys: [privateKey1],
  });

  try {
    await bot.initialize();
    req.app.locals.bot = bot;
    res.render("menu", { wallets: bot.wallets }); // Menu utamanya
  } catch (err) {
    res.send(`❌ Error: ${err.message}`);
  }
});

// ------------------------------
// Menu Utama
// ------------------------------
app.get("/menu", (req, res) => {
  const bot = req.app.locals.bot;
  if (!bot) return res.redirect("/");
  res.render("menu", { wallets: bot.wallets });
});

// ------------------------------
// Form Supply PHRS
// ------------------------------
app.get("/supply-form", (req, res) => {
  res.render("supply-form");
});

app.post("/supply", async (req, res) => {
  const bot = req.app.locals.bot;
  const { amount, txCount, delay } = req.body;
  try {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.send("❌ Error: Amount harus angka dan lebih dari 0");
    }
    if (!txCount || isNaN(txCount) || Number(txCount) <= 0) {
      return res.send("❌ Error: txCount harus angka dan lebih dari 0");
    }
    if (!delay || isNaN(delay) || Number(delay) < 0) {
      return res.send("❌ Error: delay harus angka dan >= 0");
    }

    await bot.supplyPHRS({
      amount,
      txCount: parseInt(txCount),
      delay: parseFloat(delay),
    });

    res.send("✅ Supply PHRS berhasil diproses.");
  } catch (err) {
    res.send(`❌ Error: ${err.message}`);
  }
});

// ------------------------------
// Form Mint Token
// ------------------------------
app.get("/mint-form", (req, res) => {
  const tokens = Object.keys(require("./pharos-bot").CONTRACTS.TOKENS || {});
  res.render("mint-form", { tokens });
});

app.post("/mint", async (req, res) => {
  const bot = req.app.locals.bot;
  const { token, amount, txCount, delay } = req.body;
  try {
    await bot.mintFaucetTokensWeb({ token, amount, txCount, delay });
    res.send("✅ Mint Faucet berhasil diproses.");
  } catch (err) {
    res.send(`❌ Error: ${err.message}`);
  }
});

// ------------------------------
// Form Borrow
// ------------------------------
app.get("/borrow-form", (req, res) => {
  const tokens = Object.keys(require("./pharos-bot").CONTRACTS.TOKENS || {});
  res.render("borrow-form", { tokens });
});

app.post("/borrow", async (req, res) => {
  const bot = req.app.locals.bot;
  const { token, amount, txCount, delay } = req.body;
  try {
    await bot.borrowTokensWeb({ token, amount, txCount, delay });
    res.send("✅ Borrow berhasil diproses.");
  } catch (err) {
    res.send(`❌ Error: ${err.message}`);
  }
});

// ------------------------------
// Form Withdraw
// ------------------------------
app.get("/withdraw-form", (req, res) => {
  const tokens = Object.keys(require("./pharos-bot").CONTRACTS.TOKENS || {});
  res.render("withdraw-form", { tokens });
});

app.post("/withdraw", async (req, res) => {
  const bot = req.app.locals.bot;
  const { token, amount, txCount, delay } = req.body;
  try {
    await bot.withdrawTokensWeb({ token, amount, txCount, delay });
    res.send("✅ Withdraw berhasil diproses.");
  } catch (err) {
    res.send(`❌ Error: ${err.message}`);
  }
});

// ------------------------------
app.listen(3000, () =>
  console.log("🚀 Server berjalan di http://localhost:3000")
);
