# TierConfig Initialization Setup

This guide shows how to initialize the TierConfig on-chain using the web frontend.

## Option 1: Using the Modal Component (Easiest)

### Step 1: Add the modal to your main page/component

In your main dashboard or admin page component (e.g., `Dashboard.tsx` or `Admin.tsx`):

```typescript
import React, { useState } from 'react';
import { TierConfigInitModal } from '@shared/Modals/TierConfigInitModal';

export const Dashboard = () => {
  const [tierConfigModalOpen, setTierConfigModalOpen] = useState(false);

  return (
    <div>
      {/* Your existing dashboard content */}
      
      {/* Add button to open modal */}
      <button
        onClick={() => setTierConfigModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Initialize TierConfig
      </button>

      {/* Add modal */}
      <TierConfigInitModal
        isOpen={tierConfigModalOpen}
        onClose={() => setTierConfigModalOpen(false)}
        onSuccess={() => {
          setTierConfigModalOpen(false);
          // Optional: refresh tier config or show success message
          console.log('TierConfig initialized successfully!');
        }}
      />
    </div>
  );
};
```

### Step 2: Click the button and confirm initialization

1. Button opens a modal with clear instructions
2. You can optionally specify a different admin wallet
3. Click "Initialize TierConfig"
4. Wait for the transaction to confirm
5. View the transaction on Solana Explorer
6. Once complete, the backend can fetch tier configuration

---

## Option 2: Direct Hook Usage (For Custom Flows)

If you need more control, use the hook directly:

```typescript
import { useInitializeTierConfig } from '@features/admin/useInitializeTierConfig';
import { PublicKey } from '@solana/web3.js';

export const CustomInitComponent = () => {
  const { initializeTierConfig, isLoading, error, txSignature, success } = 
    useInitializeTierConfig();

  const handleInit = async () => {
    try {
      // Option A: Use current wallet as admin
      await initializeTierConfig();

      // Option B: Specify different admin wallet
      // const adminWallet = new PublicKey('...');
      // await initializeTierConfig(adminWallet);

      console.log('Success! TX:', txSignature);
    } catch (err) {
      console.error('Failed:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={handleInit} 
        disabled={isLoading}
      >
        {isLoading ? 'Initializing...' : 'Initialize'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Success! TX: {txSignature}</p>}
    </div>
  );
};
```

---

## Option 3: Browser Console (For Testing/Admin)

If you just want to quickly initialize without modifying code:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste and run:

```javascript
// Import what you need
const { PublicKey, SystemProgram } = window.solanaWeb3;
const { useProgram } = window.zephyrWeb;  // Depends on how exports are configured

// Or in the React component context:
async function initTierConfig() {
  const program = /* get from context/state */;
  const publicKey = /* get from wallet */;
  
  const [tierConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('tier_config')],
    program.programId
  );

  const tx = await program.methods
    .initializeTierConfig(publicKey)
    .accounts({
      authority: publicKey,
      tierConfig: tierConfigPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log('✅ TierConfig initialized:', tx);
}

initTierConfig();
```

---

## What Gets Initialized?

The transaction creates a singleton PDA (Program Derived Address) that stores:

### 5 Tier Levels with thresholds for

- **Tier 1 (Community)**: 80/20 fee split, low barriers to entry
- **Tier 2 (Rising)**: 85/15 fee split, moderate requirements
- **Tier 3 (Verified Alpha)**: 90/10 fee split, requires admin flag
- **Tier 4 (Elite)**: 92.5/7.5 fee split, requires multiple flags
- **Tier 5 (Institutional)**: 95/5 fee split, strictest requirements

### Per-tier thresholds include

- Minimum trading volume
- Minimum track record (days active)
- Minimum AUM (assets under management)
- Win rate requirements (basis points)
- Maximum drawdown allowed (basis points)
- Minimum number of copiers
- Trader/platform fee split

### Admin capabilities

- `authority`: Can update tier configuration
- `admin`: Can approve/reject tier downgrades and set verified flags

---

## Verification

After initialization, verify it worked:

### From Backend Terminal

```bash
curl http://localhost:3000/api/tier/config
```

**Before:** Returns 400 with "TierConfig has not been initialised on-chain yet"

**After:** Returns 200 with full tier configuration:

```json
{
  "success": true,
  "data": {
    "tiers": [
      {
        "tierIndex": 1,
        "label": "Community",
        "minVolumeUsd": 50000000000,
        "maxDrawdownBps": 3500,
        "traderFeeBps": 8000,
        ...
      },
      // ... more tiers
    ]
  }
}
```

---

## Files Created

- `src/features/admin/useInitializeTierConfig.ts` - React hook for initialization logic
- `src/shared/Modals/TierConfigInitModal/TierConfigInitModal.tsx` - Reusable modal component
- `TIERCONFIG_SETUP.md` - This file

---

## Troubleshooting

| Problem | Solution |
| --------- | ---------- |
| **"Program or wallet not initialized"** | Make sure wallet is connected and ProgramProvider is in component tree |
| **"Account does not exist"** (old error) | This will be fixed after running initialization |
| **Transaction failed with "Account already exists"** | TierConfig already initialized (check with `GET /api/tier/config`) |
| **"Invalid admin wallet address"** | Check the Solana address format (58 chars, starts with 1-9 or A-Z, a-z) |
| **Slow transaction** | Devnet is sometimes slow; wait 60+ seconds before retrying |

---

## Next Steps

After successful initialization:

1. **TierConfig is now on-chain** - All tier requirements are stored
2. **Backend can fetch it** - `GET /api/tier/config` will work
3. **Tier assignment works** - Traders can be ranked into tier 1-5
4. **Admin flags work** - Use `POST /api/tier/admin/set-verified-flags` to mark traders as verified
5. **Fee splits active** - Traders and platform get their respective fee shares

Enjoy your tier system! 🎉
