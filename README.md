
# Areen Zainab - Supply Chain Management DApp

Get your DApp running in 10 minutes!

---

## Prerequisites Checklist

- [ ] Node.js installed (v16+)
- [ ] MetaMask extension installed
- [ ] MetaMask wallet created
- [ ] Some test MATIC tokens

---

## Step 1: Project Setup (2 minutes)

```bash
# Create and navigate to project directory
mkdir areenzainab-supply-chain
cd areenzainab-supply-chain

# Initialize project
npm init -y

# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install dotenv ethers@6

# Initialize Hardhat
npx hardhat init
# Select: "Create a JavaScript project"

# Create directories
mkdir contracts scripts frontend
```

---

## Step 2: Add Files (1 minute)

Create these files in your project:

1. **`contracts/AreenZainab_supplychain.sol`** - Copy smart contract code
2. **`scripts/deploy.js`** - Copy deployment script
3. **`hardhat.config.js`** - Copy Hardhat configuration
4. **`.env`** - Create and add your private key

---

## Step 3: Configure Environment (1 minute)

Create `.env` file:

```env
PRIVATE_KEY=your_metamask_private_key_here
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
```

**Get Private Key from MetaMask:**
1. Open MetaMask → Click menu (⋮) → Account Details
2. Click "Show Private Key" → Enter password → Copy

⚠️ **NEVER share your private key!**

---

## Step 4: Setup Polygon Amoy in MetaMask (1 minute)

Add network manually:
- **Network Name**: Polygon Amoy Testnet
- **RPC URL**: https://rpc-amoy.polygon.technology
- **Chain ID**: 80002
- **Currency**: MATIC
- **Explorer**: https://amoy.polygonscan.com/

---

## Step 5: Get Test Tokens (2 minutes)

1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Connect MetaMask
4. Request tokens
5. Wait for confirmation

---

## Step 6: Compile Contract (30 seconds)

```bash
npm run compile
# or
npx hardhat compile
```

✅ Expected: "Compiled 1 Solidity file successfully"

---

## Step 7: Deploy Contract (1 minute)

```bash
npm run deploy:amoy
# or
npx hardhat run scripts/deploy.js --network amoy
```

📝 **SAVE THESE:**
- Contract Address: `0x...`
- Transaction Hash: `0x...`

---

## Step 8: Setup Frontend (2 minutes)

```bash
# Create React app
cd frontend
npx create-react-app .

# Install ethers
npm install ethers@6

# Copy contract ABI
cp ../artifacts/contracts/AreenZainab_supplychain.sol/AreenZainab_supplychain.json src/

# Add App.js and App.css
# (Copy provided React code)
```

**Update `src/App.js`:**
```javascript
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
```

---

## Step 9: Run Frontend (30 seconds)

```bash
npm start
```

App opens at: http://localhost:3000

---

## Step 10: Test the DApp (30 seconds)

1. Click "Connect Wallet"
2. Approve in MetaMask
3. Go to "Registration"
4. Request registration
5. Approve transaction

🎉 **You're done!**

---

## Common Commands

### Smart Contract
```bash
# Compile
npm run compile

# Deploy to Amoy
npm run deploy:amoy

# Run tests
npm test

# Clean artifacts
npm run clean
```

### Frontend
```bash
# Start development server
npm start

# Build for production
npm run build
```

---

## Troubleshooting Quick Fixes

### "Insufficient funds"
→ Get more MATIC from faucet

### "Nonce too high"
→ MetaMask Settings → Advanced → Clear activity data

### "Wrong network"
→ Switch to Polygon Amoy in MetaMask

### "Cannot find module"
→ Run `npm install` in correct directory

### Frontend not loading
→ Check CONTRACT_ADDRESS is set correctly

---

## Testing Workflow

### Test User Registration:
1. Connect wallet
2. Request registration as Manufacturer
3. Use different account as Owner
4. Approve the request

### Test Product Flow:
1. Login as Manufacturer → Register product
2. Login as Distributor → Receive product
3. Login as Retailer → Receive product
4. Login as Customer → Purchase product

---

## File Structure Checklist

```
✅ areenzainab-supply-chain/
├── ✅ contracts/
│   └── ✅ AreenZainab_supplychain.sol
├── ✅ scripts/
│   └── ✅ deploy.js
├── ✅ frontend/
│   └── ✅ src/
│       ├── ✅ App.js
│       ├── ✅ App.css
│       └── ✅ AreenZainab_supplychain.json
├── ✅ hardhat.config.js
├── ✅ package.json
└── ✅ .env
```

---

## Essential Links

- **Polygon Faucet**: https://faucet.polygon.technology/
- **Amoy Explorer**: https://amoy.polygonscan.com/
- **MetaMask**: https://metamask.io/
- **Hardhat Docs**: https://hardhat.org/docs

---

## Need Help?

### Check These First:
1. Is MetaMask connected?
2. Are you on Polygon Amoy network?
3. Do you have enough MATIC?
4. Is the contract address correct?
5. Did you approve the transaction?

### Still Stuck?
- Check browser console (F12)
- Read error messages carefully
- Verify transaction on PolygonScan
- Review the full README.md

---

## Next Steps After Setup

1. ✅ Test all features
2. ✅ Take screenshots for report
3. ✅ Document any issues encountered
4. ✅ Test with multiple accounts
5. ✅ Verify on block explorer
6. ✅ Complete project report

---

## Pro Tips

💡 **Save your contract address immediately after deployment**

💡 **Keep multiple MetaMask accounts for different roles**

💡 **Always verify transactions on PolygonScan**

💡 **Take screenshots during the process for your report**

💡 **Test with small amounts first**

💡 **Keep a backup of your `.env` file (securely!)**

---

## Success Indicators

You know it's working when:
- ✅ Contract deploys without errors
- ✅ You can connect MetaMask to frontend
- ✅ Registration requests go through
- ✅ Products can be registered
- ✅ Products can be transferred
- ✅ History shows all transfers
- ✅ All roles work correctly

---

**Ready to go? Start with Step 1! 🚀**

For detailed information, see the full **README.md**

---

*Created by: Areen Zainab*  