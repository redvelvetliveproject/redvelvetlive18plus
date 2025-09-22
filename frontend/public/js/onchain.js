// /public/js/onchain.js
// Helper para lecturas/escrituras on-chain con ethers v6
// ✅ Incluye cache de ABI, decimals y symbol
// ✅ Soporta MetaMask (BrowserProvider) y fallback JsonRpcProvider (BSC)

export const Onchain = (() => {
  let ethersLib = null;
  const cache = { abi: null, decimals: new Map(), symbol: new Map() };

  async function _ethers() {
    if (ethersLib) return ethersLib;
    try {
      const mod = await import("https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.min.js");
      ethersLib = mod.ethers || mod;
    } catch {
      ethersLib = window.ethers;
    }
    if (!ethersLib) throw new Error("ethers no disponible");
    return ethersLib;
  }

  async function loadAbi() {
    if (cache.abi) return cache.abi;
    const res = await fetch("/js/abi/onecoptoken.json", { cache: "force-cache" });
    if (!res.ok) throw new Error("No se pudo cargar el ABI");
    cache.abi = await res.json();
    return cache.abi;
  }

  async function getProvider() {
    const { BrowserProvider, JsonRpcProvider } = await _ethers();
    if (window.ethereum) return new BrowserProvider(window.ethereum);
    return new JsonRpcProvider("https://bsc-testnet.public.blastapi.io"); // fallback
  }

  async function getSigner() {
    const provider = await getProvider();
    if (!provider.getSigner) throw new Error("No signer disponible (no hay wallet)");
    return provider.getSigner();
  }

  async function getContract(address, withSigner = false) {
    const { Contract } = await _ethers();
    const abi = await loadAbi();
    if (withSigner) {
      const signer = await getSigner();
      return new Contract(address, abi, signer);
    } else {
      const provider = await getProvider();
      return new Contract(address, abi, provider);
    }
  }

  // === Métodos comunes ===
  async function symbol(address) {
    const key = address.toLowerCase();
    if (cache.symbol.has(key)) return cache.symbol.get(key);
    const c = await getContract(address);
    const s = await c.symbol().catch(() => "TOKEN");
    cache.symbol.set(key, s);
    return s;
  }

  async function decimals(address) {
    const key = address.toLowerCase();
    if (cache.decimals.has(key)) return cache.decimals.get(key);
    const c = await getContract(address);
    const d = Number(await c.decimals());
    cache.decimals.set(key, d);
    return d;
  }

  async function balanceOf(address, holder) {
    const c = await getContract(address);
    return c.balanceOf(holder);
  }

  async function allowance(address, owner, spender) {
    const c = await getContract(address);
    return c.allowance(owner, spender);
  }

  async function approve(address, spender, amountWei) {
    const c = await getContract(address, true);
    const tx = await c.approve(spender, amountWei);
    return tx.wait();
  }

  async function transfer(address, to, amountWei) {
    const c = await getContract(address, true);
    const tx = await c.transfer(to, amountWei);
    return tx.wait();
  }

  async function toWei(address, amountHuman) {
    const { parseUnits } = await _ethers();
    const d = await decimals(address);
    return parseUnits(String(amountHuman), d);
  }

  async function fromWei(address, amountWei) {
    const { formatUnits } = await _ethers();
    const d = await decimals(address);
    return formatUnits(amountWei, d);
  }

  return {
    getProvider, getSigner, getContract,
    symbol, decimals, balanceOf, allowance,
    approve, transfer, toWei, fromWei
  };
})();

