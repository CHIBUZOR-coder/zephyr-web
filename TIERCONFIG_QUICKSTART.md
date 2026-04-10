# TierConfig Initialization - Quick Start

## 📋 What You Created

I've added TierConfig initialization support to zephyr-web with:

1. **`src/features/admin/useInitializeTierConfig.ts`** - React hook that handles the on-chain initialization
2. **`src/shared/Modals/TierConfigInitModal/TierConfigInitModal.tsx`** - Pre-built modal UI component
3. **`TIERCONFIG_SETUP.md`** - Detailed setup guide with all options

## ⚡ The Error You Had

```zsh
[error]: Failed to fetch protocol TierConfig
  Account does not exist or has no data 8KDyhGb7bnfXLfipPLFvdpZCpSzWDscdqCyy1hfXaDbs
```

**Cause:** The TierConfig PDA hasn't been initialized on-chain yet.

**Solution:** Initialize it once using the modal (takes ~30 seconds).

## 🚀 How to Use (Choose One)

### **Option A: Easiest - Add Button to Dashboard (Recommended)**

Find your main dashboard component and add:

```typescript
import { useState } from 'react';
import { TierConfigInitModal } from '@shared/Modals/TierConfigInitModal';

export function DashboardPage() {
  const [tierConfigModalOpen, setTierConfigModalOpen] = useState(false);

  return (
    <div>
      {/* Your existing dashboard content */}
      
      {/* Add this button somewhere visible */}
      <button
        onClick={() => setTierConfigModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Initialize TierConfig (Admin)
      </button>

      {/* Add modal at end of component */}
      <TierConfigInitModal
        isOpen={tierConfigModalOpen}
        onClose={() => setTierConfigModalOpen(false)}
      />
    </div>
  );
}
```

**Then:**
1. Open zephyr-web in browser (http://localhost:3000 or your dev URL)
2. Click "Initialize TierConfig" button
3. Wait for transaction confirmation
4. ✅ Done! Backend will now work

---

### **Option B: Custom Hook Usage**

```typescript
import { useInitializeTierConfig } from '@features/admin/useInitializeTierConfig';

function MyComponent() {
  const { initializeTierConfig, isLoading, error, success } = useInitializeTierConfig();

  const handleInit = async () => {
    try {
      await initializeTierConfig();
      console.log('✅ TierConfig initialized!');
    } catch (err) {
      console.error('❌ Failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleInit} disabled={isLoading}>
        {isLoading ? 'Initializing...' : 'Init TierConfig'}
      </button>
      {success && <p style={{ color: 'green' }}>Success!</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

### **Option C: Browser Console (For Testing)**

In DevTools Console, run:

```javascript
// Get the hook from a component context and call it
// Or paste this directly if you have access to the program:

async function initTierConfig() {
  const { PublicKey, SystemProgram } = window.solanaWeb3;
  
  // You need to have program and wallet context
  // This is just pseudo-code - adjust for your setup
  const [tierConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('tier_config')],
    PROGRAM_ID
  );

  const tx = await program.methods
    .initializeTierConfig(walletPublicKey)
    .accounts({
      authority: walletPublicKey,
      tierConfig: tierConfigPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log('✅ TX:', tx);
}

initTierConfig();
```

---

## ✅ Verification

After initialization, the error disappears and this works:

```bash
# From terminal
curl http://localhost:3000/api/tier/config

# Response (200 OK):
{
  "success": true,
  "data": {
    "tiers": [ /* 5 tier configs */ ],
    "authority": "...",
    "admin": "..."
  }
}
```

---

## 📁 Files to Integrate

| File | Purpose | Where to Use |
| ------ | --------- | ------------- |
| `src/features/admin/useInitializeTierConfig.ts` | Hook logic | Import in components |
| `src/shared/Modals/TierConfigInitModal/TierConfigInitModal.tsx` | UI component | Add to pages that need it |
| `TIERCONFIG_SETUP.md` | Full documentation | Reference guide |

---

## 🔧 Import Statements

Once added, you can import with:

```typescript
// Use modal:
import { TierConfigInitModal } from '@shared/Modals/TierConfigInitModal';

// Or use hook directly:
import { useInitializeTierConfig } from '@features/admin/useInitializeTierConfig';
```

**Note:** Paths are relative; no path aliases needed.

---

## 🎯 What Gets Initialized

One on-chain PDA with 5 tier levels:

| Tier | Fee Split | Min Volume | Min AUM | Requirements |
| ------ | ----------- | ----------- | --------- | -------------- |
| **Tier 1** | 80/20 | $50k | - | Community level |
| **Tier 2** | 85/15 | $300k | $50k | Rising trader |
| **Tier 3** | 90/10 | $1M | $250k | Risk-adjusted positive |
| **Tier 4** | 92.5/7.5 | $3M | $750k | Multiple flags |
| **Tier 5** | 95/5 | $5M | $1M | Institutional (all flags) |

---

## ⚠️ Important Notes

- ✅ **One-time setup** - Only needs to run once per network
- ✅ **Idempotent-safe** - Can run multiple times without harm
- ✅ **Current wallet becomes authority** - Can update tier config
- ✅ **Works on devnet/testnet/mainnet** - Adjust network in wallet config
- ⏱️ **Takes ~30-60 seconds** - Transaction confirmation time

---

## 🐛 Troubleshooting

| Problem | Fix |
| --------- | ----- |
| "Program or wallet not initialized" | Connect wallet first |
| "Account already exists" | Already initialized; check `/api/tier/config` |
| "Invalid admin address" | Use valid Solana address format |
| Transaction timeout | Retry; devnet can be slow |
| Modal won't open | Check component tree includes `ProgramProvider` |

---

## Next Steps

1. **Choose an integration option** (A, B, or C above)
2. **Add the code to your component**
3. **Run initialization** (takes 30 seconds)
4. **Verify** with `curl http://localhost:3000/api/tier/config`
5. **Done!** Tiers are now live

Questions? Check `TIERCONFIG_SETUP.md` for detailed info.
