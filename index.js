import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

// 在 index.html 中使用 <script type="module"></script> 来引入 js 模块时，
// connect() 和 fund() 函数对于 index.html 来说是不可见的，所以这里需要为两个
// 按钮对象添加事件监听器
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() 
{
  if (typeof window.ethereum !== undefined) {
    // 连接 metamask
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log(ethers);
    } catch (e) {
      console.log(e);
    }
    connectButton.innerHTML = "Connected!";
  } else {
    fundButton.innerHTML = "Please install metamask!";
  }
}

async function fund()
{
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}`);
  if (typeof window.ethereum !== undefined) {
    // provider / connection to the blockchain
    // signer / wallet / someone with some gas
    // contract that we are interacting with
    // ^ ABI & Address
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // 获取连接了 provider 的 wallet
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    // 以防调用者拒绝 transaction
    try {
      const transactionResponse = await contract.fund({ 
        value: ethers.utils.parseEther(ethAmount)
      });
      // wait for this tx to be mined
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (e) {
      console.log(e);
    }
  }
}

async function withdraw()
{
  if (typeof window.ethereum !== undefined) {
    console.log("Withdrawing ...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const fundMe = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await fundMe.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (e) {
      console.log(e);
    }
  }
}

async function getBalance()
{
  if (typeof window.ethereum !== undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(`Balance: ${ethers.utils.formatEther(balance)}`);
  }
}

function listenForTransactionMine(transactionResponse, provider)
{
  console.log(`Mining ${transactionResponse.hash} ...`);
  return new Promise((resolve, reject) => {
    // once transaction.hash is available, call the callback function
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
      resolve();
    });
  });
}
