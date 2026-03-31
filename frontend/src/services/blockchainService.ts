import { ethers } from 'ethers'

const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
      { "internalType": "string", "name": "cid", "type": "string" }
    ],
    "name": "registerArticle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" }
    ],
    "name": "verifyArticle",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "author", "type": "address" },
          { "internalType": "string", "name": "ipfsCID", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct NewsAuth.Article",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

export const getWeb3Provider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found')
  }
  return new ethers.BrowserProvider(window.ethereum)
}

export const getContract = async (contractAddress: string) => {
  const provider = getWeb3Provider()
  const signer = await provider.getSigner()
  return new ethers.Contract(contractAddress, CONTRACT_ABI, signer)
}

export const verifyArticle = async (contractAddress: string, ipfsHash: string) => {
  try {
    const contract = await getContract(contractAddress)
    const hashBytes = ethers.keccak256(ethers.toUtf8Bytes(ipfsHash))
    const article = await contract.verifyArticle(hashBytes)
    return article
  } catch (error) {
    console.error('Verification error:', error)
    throw error
  }
}
