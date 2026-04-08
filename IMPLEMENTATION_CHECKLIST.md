# TierConfig Implementation Checklist

## 📋 Pre-Integration Checklist

- [ ] zephyr-web is running (`npm run dev`)
- [ ] Wallet is connected (Phantom or Solflare in browser)
- [ ] Backend is running (`npm run backend:dev` in root)
- [ ] You have DevTools open to see logs

## 🔧 Integration Checklist

### Step 1: Import the Modal
- [ ] Open your dashboard component
- [ ] Add import: `import { TierConfigInitModal } from '@shared/Modals/TierConfigInitModal';`
- [ ] Verify no import errors

### Step 2: Add Component State
- [ ] Add state hook: `const [tierConfigModalOpen, setTierConfigModalOpen] = useState(false);`
- [ ] Make sure useState is imported

### Step 3: Add Button to UI
- [ ] Add button somewhere visible in your component
- [ ] Button should say "Initialize TierConfig" or similar
- [ ] Button onClick: `() => setTierConfigModalOpen(true)`

### Step 4: Add Modal to JSX
- [ ] Add modal component before component closes:
  ```tsx
  <TierConfigInitModal
    isOpen={tierConfigModalOpen}
    onClose={() => setTierConfigModalOpen(false)}
  />
  ```
- [ ] Verify component tree structure

## ✅ Verification Checklist

### In Browser
- [ ] Component loads without errors
- [ ] Button is visible and clickable
- [ ] Button click opens modal
- [ ] Modal shows initialization instructions
- [ ] Can type address in "Admin Wallet" field (optional)
- [ ] "Initialize TierConfig" button works
- [ ] See loading spinner during transaction
- [ ] Success message appears after ~30 seconds
- [ ] Transaction link shown (clickable)

### In Backend Terminal
- [ ] No TierConfig errors in logs
- [ ] Can run: `curl http://localhost:3000/api/tier/config`
- [ ] Returns 200 OK (not 400 error)
- [ ] Response includes 5 tier objects
- [ ] Response includes tierConfigPda

### In Browser Console
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] useInitializeTierConfig hook logs appear

## 🚀 Success Criteria

✅ **All of the following are true:**

1. Modal opens when button clicked
2. Button in modal works and sends transaction
3. Transaction confirms on Solana (check Explorer link)
4. Backend logs show no TierConfig errors
5. `curl /api/tier/config` returns 200 OK
6. Response includes all 5 tiers
7. No console errors in DevTools

## 🐛 Troubleshooting Checklist

If something doesn't work:

### Compile Errors
- [ ] Check paths are relative (no @ aliases)
- [ ] Verify imports point to correct files
- [ ] Make sure TypeScript config is correct

### Runtime Errors
- [ ] Check ProgramProvider is in component tree
- [ ] Verify wallet is connected
- [ ] Check browser console for errors
- [ ] Verify devnet is accessible

### Transaction Issues
- [ ] Check wallet has SOL for gas
- [ ] Wait longer for devnet confirmation
- [ ] Check Solana Explorer for error details
- [ ] Retry if timeout occurred

### TierConfig Still Not Showing
- [ ] Confirm transaction actually completed
- [ ] Check Solana Explorer for success
- [ ] Run: `npm run build --workspace=zephyr-web`
- [ ] Check backend has restarted and picked up changes

## 📊 Sign-Off

When ALL checks pass:

- [ ] I successfully integrated TierConfigInitModal
- [ ] I clicked the button and initialized on-chain
- [ ] Backend now successfully fetches tier configuration
- [ ] No more TierConfig errors in logs
- [ ] I verified with `curl /api/tier/config` returning 200

**Date Completed:** _______________

**Notes:** _______________________________________________

---

## 🎉 You're Done!

The tier system is now initialized and ready to use.

**Next:** Review the tier thresholds in backend logs to understand trader tiers.
