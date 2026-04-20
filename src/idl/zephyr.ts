/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/zephyr.json`.
 */
export type Zephyr = {
  "address": "54FFNwwXRGRHK2mVCuYEUNVzdW2kkTPGWUafG9NbjWGu",
  "metadata": {
    "name": "zephyr",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "acceptAuthority",
      "docs": [
        "M4: Accept a pending authority transfer (called by the new authority",
        "after the timelock has elapsed)."
      ],
      "discriminator": [
        107,
        86,
        198,
        91,
        33,
        12,
        107,
        160
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "Must be governance_config.pending_authority."
          ],
          "signer": true
        },
        {
          "name": "governanceConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "approveTierDowngrade",
      "docs": [
        "Admin confirms or rejects a staged tier downgrade."
      ],
      "discriminator": [
        193,
        23,
        219,
        111,
        254,
        136,
        30,
        116
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Must be TierConfig.admin."
          ],
          "signer": true
        },
        {
          "name": "tierConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "masterVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master_vault.master_wallet",
                "account": "masterExecutionVault"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "reject",
          "type": "bool"
        }
      ]
    },
    {
      "name": "callTrade",
      "docs": [
        "Master trader calls a trade through their Master Execution Vault.",
        "This is the ONLY way to execute trades that copiers will mirror."
      ],
      "discriminator": [
        165,
        255,
        131,
        157,
        11,
        192,
        156,
        200
      ],
      "accounts": [
        {
          "name": "master",
          "docs": [
            "The master trader (must sign to authorize trade)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "docs": [
            "1. THE GLOBAL CONFIG (Singleton)",
            "",
            "We use b\"config\" to find the ONE global settings file."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "masterVault",
          "docs": [
            "We use the master's key to find THEIR specific vault.",
            "The Master Execution Vault that will execute the trade"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master"
              }
            ]
          }
        },
        {
          "name": "masterTrade",
          "docs": [
            "MasterTrade storage for Slot-based execution.",
            "Initialized only when active_copier_count > atomic_threshold."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  116,
                  114,
                  97,
                  100,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "masterVault"
              }
            ]
          }
        },
        {
          "name": "platformFeeWallet",
          "docs": [
            "Platform fee wallet (where platform fees go)"
          ],
          "writable": true
        },
        {
          "name": "tierConfig",
          "docs": [
            "Singleton tier configuration. Used to resolve master's revenue split."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for fee transfers"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "jupiterProgram",
          "docs": [
            "Jupiter program for actual trading (CPI)"
          ]
        }
      ],
      "args": [
        {
          "name": "tradeParams",
          "type": {
            "defined": {
              "name": "tradeParams"
            }
          }
        }
      ]
    },
    {
      "name": "cancelAuthorityTransfer",
      "docs": [
        "M4: Cancel a pending authority transfer (called by the current authority)."
      ],
      "discriminator": [
        94,
        131,
        125,
        184,
        183,
        24,
        125,
        229
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "Must be the current primary_authority (Not the pending authority)"
          ],
          "signer": true
        },
        {
          "name": "governanceConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "claimFees",
      "docs": [
        "Claim/withdraw SOL from master vault."
      ],
      "discriminator": [
        82,
        251,
        233,
        156,
        12,
        52,
        184,
        202
      ],
      "accounts": [
        {
          "name": "master",
          "writable": true,
          "signer": true
        },
        {
          "name": "masterVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeCopierVault",
      "docs": [
        "Close copier vault and decrement master's active_copier_count."
      ],
      "discriminator": [
        192,
        57,
        112,
        228,
        165,
        191,
        30,
        198
      ],
      "accounts": [
        {
          "name": "copier",
          "writable": true,
          "signer": true
        },
        {
          "name": "copierVault",
          "docs": [
            "Copier vault to close. Rent is sent to copier. Must have balance 0 and position closed."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier"
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        },
        {
          "name": "masterVault",
          "docs": [
            "Master vault to decrement active_copier_count (must match copier_vault.master_vault)"
          ],
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "docs": [
        "Deposit funds into copier vault."
      ],
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "copier",
          "docs": [
            "The copier who owns the vault (must sign)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "riskConfig",
          "docs": [
            "Week 7: Min deposit enforced for first deposit"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  105,
                  115,
                  107,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "docs": [
            "The vault account to deposit into"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier"
              },
              {
                "kind": "account",
                "path": "vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for SOL transfers"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "depositMaster",
      "docs": [
        "Deposit capital into master vault."
      ],
      "discriminator": [
        119,
        174,
        255,
        66,
        110,
        3,
        45,
        249
      ],
      "accounts": [
        {
          "name": "master",
          "writable": true,
          "signer": true
        },
        {
          "name": "masterVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "emergencyOverride",
      "docs": [
        "Week 7: Emergency override (admin-only) - toggle emergency_risk_override flag."
      ],
      "discriminator": [
        75,
        190,
        183,
        78,
        212,
        137,
        146,
        59
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Protocol admin (must match RiskConfig.admin)."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "riskConfig",
          "docs": [
            "Protocol risk config to update."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  105,
                  115,
                  107,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "enable",
          "type": "bool"
        }
      ]
    },
    {
      "name": "emergencyPauseProtocol",
      "docs": [
        "M4: Toggle the protocol-wide emergency pause (emergency_admin only).",
        "Blocks all new vault operations; withdrawals and risk management remain open."
      ],
      "discriminator": [
        114,
        45,
        221,
        241,
        93,
        54,
        10,
        152
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Only emergency_admin can call this - NOT primary_authority."
          ],
          "signer": true
        },
        {
          "name": "governanceConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "enable",
          "type": "bool"
        }
      ]
    },
    {
      "name": "emergencyWithdraw",
      "docs": [
        "Admin-only emergency withdrawal.",
        "Requires RiskConfig.emergency_risk_override == true."
      ],
      "discriminator": [
        239,
        45,
        203,
        64,
        150,
        73,
        218,
        92
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Protocol admin (must match RiskConfig.admin)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "copier",
          "docs": [
            "The copier who owns the vault — receives their balance back."
          ],
          "writable": true
        },
        {
          "name": "copierVault",
          "docs": [
            "The copier vault to drain."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier_vault.copier",
                "account": "copierVault"
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        },
        {
          "name": "riskConfig",
          "docs": [
            "Protocol risk config — must have emergency_risk_override == true"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  105,
                  115,
                  107,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeConfig",
      "docs": [
        "Initialize program config."
      ],
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "platformFeeBps",
          "type": "u16"
        },
        {
          "name": "traderFeeBps",
          "type": "u16"
        },
        {
          "name": "maxSuccessFeeBps",
          "type": "u16"
        },
        {
          "name": "maxVolumeFeeBps",
          "type": "u16"
        },
        {
          "name": "feeWallet",
          "type": "pubkey"
        },
        {
          "name": "admin",
          "type": "pubkey"
        },
        {
          "name": "atomicThreshold",
          "type": "u16"
        },
        {
          "name": "slotGraceWindow",
          "type": "u8"
        },
        {
          "name": "protocolVersion",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeCopierVault",
      "docs": [
        "Initialize copier vault linked to a Master Execution Vault."
      ],
      "discriminator": [
        253,
        2,
        205,
        24,
        242,
        143,
        154,
        232
      ],
      "accounts": [
        {
          "name": "copier",
          "docs": [
            "Copier wallet - pays rent and owns the vault."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "masterWallet"
        },
        {
          "name": "vault",
          "docs": [
            "The copier vault PDA being initialized",
            "Derived from: [\"vault\", master_vault]"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier"
              },
              {
                "kind": "account",
                "path": "masterVault"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "masterVault",
          "docs": [
            "The master execution vault this copier is following."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "masterWallet"
              }
            ]
          }
        },
        {
          "name": "riskConfig",
          "docs": [
            "Week 7: Protocol-level risk caps (must be initialized before copier vaults)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  105,
                  115,
                  107,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "riskParams",
          "type": {
            "defined": {
              "name": "riskParams"
            }
          }
        },
        {
          "name": "stopLossTriggerBps",
          "type": "u16"
        },
        {
          "name": "stopLossSellBps",
          "type": "u16"
        },
        {
          "name": "dailyLossLimitBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeGovernanceConfig",
      "docs": [
        "M4: Initialize the root GovernanceConfig PDA.",
        "MUST be called first on any fresh Zephyr deployment."
      ],
      "discriminator": [
        15,
        40,
        42,
        141,
        94,
        104,
        27,
        201
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "Deployer / founder wallet - becomes primary authority."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "governanceConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "emergencyAdmin",
          "type": "pubkey"
        },
        {
          "name": "timelockSeconds",
          "type": "i64"
        },
        {
          "name": "upgradeAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeMasterVault",
      "docs": [
        "Initialize a Master Execution Vault for a master trader.",
        "This is the ONLY way masters can execute copy-triggering trades."
      ],
      "discriminator": [
        196,
        143,
        125,
        69,
        39,
        128,
        211,
        78
      ],
      "accounts": [
        {
          "name": "master",
          "docs": [
            "The master trader creating their execution vault"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "masterVault",
          "docs": [
            "The Master Execution Vault PDA to create",
            "Derived from: [\"master_vault\", master.key()]"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "successFeePercent",
          "type": "u16"
        },
        {
          "name": "volumeFeePercent",
          "type": "u16"
        },
        {
          "name": "takeProfitTriggerBps",
          "type": "u16"
        },
        {
          "name": "takeProfitSellBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeRiskConfig",
      "docs": [
        "Week 7: Initialize RiskConfig PDA (protocol-level risk caps)."
      ],
      "discriminator": [
        202,
        112,
        23,
        137,
        223,
        10,
        79,
        160
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "riskConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  105,
                  115,
                  107,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "maxDrawdownCapPct",
          "type": "u8"
        },
        {
          "name": "maxTradeSizeCapPct",
          "type": "u8"
        },
        {
          "name": "maxDailyLossBpsCap",
          "type": "u16"
        },
        {
          "name": "maxStopLossBpsCap",
          "type": "u16"
        },
        {
          "name": "minStopLossPct",
          "type": "u8"
        },
        {
          "name": "minVaultDepositLamports",
          "type": "u64"
        },
        {
          "name": "admin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeTierConfig",
      "docs": [
        "Initialize the protocol-wide TierConfig PDA."
      ],
      "discriminator": [
        155,
        239,
        39,
        192,
        223,
        254,
        117,
        117
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tierConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "admin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "mirrorTrade",
      "docs": [
        "Mirror a master vault trade — called by the indexer service."
      ],
      "discriminator": [
        222,
        222,
        212,
        30,
        182,
        122,
        62,
        44
      ],
      "accounts": [
        {
          "name": "copierVault",
          "docs": [
            "The copier vault that will mirror the trade"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier_vault.copier",
                "account": "copierVault"
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        },
        {
          "name": "masterVault",
          "docs": [
            "The master vault being copied (read-only for validation)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master_vault.master_wallet",
                "account": "masterExecutionVault"
              }
            ]
          }
        },
        {
          "name": "masterTrade",
          "docs": [
            "Slot-Level Deterministic Execution: The recorded master trade execution."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  116,
                  114,
                  97,
                  100,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "masterVault"
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "Authority that can trigger mirror trades (indexer service)",
            "todo: In production, we'll use a PDA or multisig for better security"
          ],
          "signer": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "mirrorTradeParams"
            }
          }
        }
      ]
    },
    {
      "name": "pauseCopierVault",
      "discriminator": [
        62,
        220,
        134,
        153,
        130,
        62,
        16,
        82
      ],
      "accounts": [
        {
          "name": "copier",
          "signer": true
        },
        {
          "name": "copierVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier"
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "pauseCopying",
      "docs": [
        "Pause copy-execution for a vault (copier-owned)."
      ],
      "discriminator": [
        56,
        159,
        165,
        178,
        76,
        221,
        191,
        240
      ],
      "accounts": [
        {
          "name": "copier",
          "docs": [
            "The copier who owns this vault."
          ],
          "signer": true
        },
        {
          "name": "copierVault",
          "docs": [
            "The copier vault to pause or resume."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier_vault.copier",
                "account": "copierVault"
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "pauseMasterVault",
      "discriminator": [
        184,
        195,
        194,
        200,
        163,
        191,
        147,
        222
      ],
      "accounts": [
        {
          "name": "master",
          "signer": true
        },
        {
          "name": "masterVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "resumeCopierVault",
      "discriminator": [
        2,
        120,
        4,
        228,
        81,
        95,
        80,
        16
      ],
      "accounts": [
        {
          "name": "copier",
          "signer": true
        },
        {
          "name": "copierVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier"
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "resumeCopying",
      "docs": [
        "Resume copy-execution after a manual or auto pause (copier-owned)."
      ],
      "discriminator": [
        28,
        60,
        103,
        72,
        0,
        233,
        66,
        79
      ],
      "accounts": [
        {
          "name": "copier",
          "docs": [
            "The copier who owns this vault."
          ],
          "signer": true
        },
        {
          "name": "copierVault",
          "docs": [
            "The copier vault to pause or resume."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier_vault.copier",
                "account": "copierVault"
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "resumeMasterVault",
      "discriminator": [
        139,
        130,
        203,
        150,
        10,
        208,
        106,
        124
      ],
      "accounts": [
        {
          "name": "master",
          "signer": true
        },
        {
          "name": "masterVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "setVerifiedFlags",
      "docs": [
        "Admin attests to off-chain criteria (KYC, risk-adjusted returns, etc)."
      ],
      "discriminator": [
        78,
        160,
        52,
        169,
        210,
        237,
        89,
        168
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Must be TierConfig.admin."
          ],
          "signer": true
        },
        {
          "name": "tierConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "masterVault",
          "docs": [
            "The MasterExecutionVault whose flags are being updated."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master_vault.master_wallet",
                "account": "masterExecutionVault"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newFlags",
          "type": "u8"
        }
      ]
    },
    {
      "name": "transferAuthority",
      "docs": [
        "M4: Initiate a timelocked authority transfer.",
        "The new authority must call accept_authority after the timelock expires."
      ],
      "discriminator": [
        48,
        169,
        76,
        72,
        229,
        180,
        55,
        161
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "governanceConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "triggerProfitTake",
      "docs": [
        "Week 6: Trigger automated profit-taking for a master vault position."
      ],
      "discriminator": [
        150,
        255,
        48,
        48,
        3,
        89,
        177,
        160
      ],
      "accounts": [
        {
          "name": "executor",
          "writable": true,
          "signer": true
        },
        {
          "name": "masterVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master_vault.master_wallet",
                "account": "masterExecutionVault"
              }
            ]
          }
        },
        {
          "name": "masterTrade",
          "docs": [
            "Week 7: MasterTrade storage for Slot-based execution."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  116,
                  114,
                  97,
                  100,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "masterVault"
              }
            ]
          }
        },
        {
          "name": "config",
          "docs": [
            "← ADD THIS: Read fee configuration"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "oraclePrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "triggerStopLoss",
      "docs": [
        "Permissionless stop-loss trigger."
      ],
      "discriminator": [
        17,
        202,
        42,
        253,
        27,
        138,
        151,
        12
      ],
      "accounts": [
        {
          "name": "executor",
          "docs": [
            "Account paying transaction fees (backend executor / keeper / copier).",
            "Permissionless — program enforces rules via account constraints."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "copierVault",
          "docs": [
            "The copier vault whose position we are stop-lossing out of."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier_vault.copier",
                "account": "copierVault"
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        },
        {
          "name": "masterTrade",
          "docs": [
            "Week 7: MasterTrade storage for Slot-based execution."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  116,
                  114,
                  97,
                  100,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        },
        {
          "name": "riskConfig",
          "docs": [
            "Protocol risk config — read to verify emergency override status."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  105,
                  115,
                  107,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "oraclePrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateConfig",
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "platformFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "traderFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "maxSuccessFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "maxVolumeFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "feeWallet",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "newAuthority",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "admin",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "atomicThreshold",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "slotGraceWindow",
          "type": {
            "option": "u8"
          }
        },
        {
          "name": "protocolVersion",
          "type": {
            "option": "u8"
          }
        }
      ]
    },
    {
      "name": "updateFeeWallet",
      "docs": [
        "Update the fee wallet address.",
        "Enables migration: simple wallet -> multisig -> DAO."
      ],
      "discriminator": [
        236,
        164,
        201,
        6,
        176,
        37,
        80,
        17
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "The current authority"
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "docs": [
            "The Config to update"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "newFeeWallet",
          "docs": [
            "We don't validate this account because it could be a multisig or program"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "updateGovernanceConfig",
      "docs": [
        "M4: Update non-authority fields in GovernanceConfig (primary_authority only)."
      ],
      "discriminator": [
        140,
        45,
        181,
        17,
        77,
        67,
        157,
        248
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "governanceConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newEmergencyAdmin",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "newTimelockSeconds",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "newUpgradeAuthority",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "newMinProposalThreshold",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "updateRiskConfig",
      "docs": [
        "Week 7: Update RiskConfig (authority-only)."
      ],
      "discriminator": [
        163,
        37,
        159,
        76,
        228,
        223,
        170,
        167
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "riskConfig"
          ]
        },
        {
          "name": "riskConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  105,
                  115,
                  107,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "maxDrawdownCapPct",
          "type": {
            "option": "u8"
          }
        },
        {
          "name": "maxTradeSizeCapPct",
          "type": {
            "option": "u8"
          }
        },
        {
          "name": "maxDailyLossBpsCap",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "maxStopLossBpsCap",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "minStopLossPct",
          "type": {
            "option": "u8"
          }
        },
        {
          "name": "minVaultDepositLamports",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "emergencyRiskOverride",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "globalPause",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "newAuthority",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "newAdmin",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "updateRiskParams",
      "docs": [
        "Week 7: Update vault-level risk parameters (copier-only)."
      ],
      "discriminator": [
        106,
        101,
        226,
        66,
        22,
        113,
        174,
        212
      ],
      "accounts": [
        {
          "name": "copier",
          "docs": [
            "The copier who owns the vault."
          ],
          "signer": true
        },
        {
          "name": "copierVault",
          "docs": [
            "The copier vault to update."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier"
              },
              {
                "kind": "account",
                "path": "copier_vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        },
        {
          "name": "riskConfig",
          "docs": [
            "Protocol risk config — new params must not exceed these caps."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  105,
                  115,
                  107,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newRiskParams",
          "type": {
            "option": {
              "defined": {
                "name": "riskParams"
              }
            }
          }
        },
        {
          "name": "newStopLossTriggerBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "newStopLossSellBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "newDailyLossLimitBps",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "updateTierConfig",
      "docs": [
        "Update TierConfig thresholds or revenue splits (authority-only)."
      ],
      "discriminator": [
        125,
        187,
        7,
        205,
        23,
        68,
        225,
        184
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "tierConfig"
          ]
        },
        {
          "name": "tierConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "communityMinTrades",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "communityMinVolumeUsd",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "communityMinActivityDays",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "communityMinWinRateBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "communityMaxDrawdownBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "communityMinCopiers",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "communityTraderFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "risingMinTrades",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "risingMinVolumeUsd",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "risingMinTrackRecordDays",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "risingMinWinRateBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "risingMaxDrawdownBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "risingMinAumUsd",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "risingMinCopierRetentionBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "risingTraderFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "verifiedMinTrades",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "verifiedMinVolumeUsd",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "verifiedMinTrackRecordDays",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "verifiedMinWinRateBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "verifiedMaxDrawdownBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "verifiedMinAumUsd",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "verifiedMinCopiers",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "verifiedTraderFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "eliteMinVolumeUsd",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "eliteMinAumUsd",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "eliteMinTrackRecordDays",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "eliteMaxDrawdownBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "eliteMinCopiers",
          "type": {
            "option": "u32"
          }
        },
        {
          "name": "eliteTraderFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "institutionalMinVolumeUsd",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "institutionalMinAumUsd",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "institutionalMinTrackRecordDays",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "institutionalMaxDrawdownBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "institutionalTraderFeeBps",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "newAuthority",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "newAdmin",
          "type": {
            "option": "pubkey"
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "docs": [
        "Withdraw SOL from copier vault."
      ],
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "copier",
          "docs": [
            "The copier who owns the vault (must sign)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "vault",
          "docs": [
            "The vault account to withdraw from"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "copier"
              },
              {
                "kind": "account",
                "path": "vault.master_vault",
                "account": "copierVault"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program (required for account validation)"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawMaster",
      "docs": [
        "Withdraw capital from master vault."
      ],
      "discriminator": [
        223,
        5,
        0,
        183,
        16,
        8,
        101,
        232
      ],
      "accounts": [
        {
          "name": "master",
          "writable": true,
          "signer": true
        },
        {
          "name": "masterVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  115,
                  116,
                  101,
                  114,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "master"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "copierVault",
      "discriminator": [
        65,
        222,
        118,
        10,
        91,
        225,
        46,
        127
      ]
    },
    {
      "name": "governanceConfig",
      "discriminator": [
        81,
        63,
        124,
        107,
        210,
        100,
        145,
        70
      ]
    },
    {
      "name": "masterExecutionVault",
      "discriminator": [
        155,
        50,
        126,
        91,
        210,
        175,
        31,
        2
      ]
    },
    {
      "name": "masterTrade",
      "discriminator": [
        238,
        249,
        207,
        174,
        66,
        50,
        71,
        31
      ]
    },
    {
      "name": "riskConfig",
      "discriminator": [
        201,
        119,
        245,
        244,
        40,
        27,
        0,
        31
      ]
    },
    {
      "name": "tierConfig",
      "discriminator": [
        142,
        18,
        118,
        115,
        76,
        33,
        208,
        58
      ]
    }
  ],
  "events": [
    {
      "name": "authorityTransferCancelled",
      "discriminator": [
        31,
        228,
        187,
        148,
        20,
        99,
        237,
        48
      ]
    },
    {
      "name": "authorityTransferCompleted",
      "discriminator": [
        11,
        219,
        75,
        24,
        117,
        129,
        240,
        79
      ]
    },
    {
      "name": "authorityTransferInitiated",
      "discriminator": [
        194,
        206,
        0,
        50,
        236,
        124,
        236,
        147
      ]
    },
    {
      "name": "copierVaultStatusEvent",
      "discriminator": [
        240,
        205,
        143,
        162,
        246,
        165,
        192,
        202
      ]
    },
    {
      "name": "depositEvent",
      "discriminator": [
        120,
        248,
        61,
        83,
        31,
        142,
        107,
        144
      ]
    },
    {
      "name": "depositMasterEvent",
      "discriminator": [
        235,
        251,
        155,
        146,
        52,
        248,
        67,
        199
      ]
    },
    {
      "name": "emergencyWithdrawEvent",
      "discriminator": [
        177,
        61,
        254,
        20,
        145,
        18,
        188,
        237
      ]
    },
    {
      "name": "feeClaimedEvent",
      "discriminator": [
        42,
        25,
        34,
        217,
        30,
        24,
        89,
        139
      ]
    },
    {
      "name": "feeCollectedEvent",
      "discriminator": [
        142,
        253,
        94,
        133,
        187,
        191,
        46,
        40
      ]
    },
    {
      "name": "feeWalletUpdated",
      "discriminator": [
        239,
        21,
        163,
        102,
        93,
        63,
        3,
        248
      ]
    },
    {
      "name": "governanceConfigInitialized",
      "discriminator": [
        165,
        136,
        97,
        201,
        208,
        165,
        199,
        162
      ]
    },
    {
      "name": "governanceConfigUpdated",
      "discriminator": [
        76,
        140,
        190,
        10,
        102,
        221,
        44,
        0
      ]
    },
    {
      "name": "jupiterSwapEvent",
      "discriminator": [
        71,
        37,
        34,
        221,
        98,
        167,
        26,
        156
      ]
    },
    {
      "name": "masterVaultStatusEvent",
      "discriminator": [
        248,
        24,
        50,
        203,
        27,
        165,
        59,
        34
      ]
    },
    {
      "name": "positionStateChangedEvent",
      "discriminator": [
        160,
        106,
        96,
        30,
        50,
        177,
        145,
        6
      ]
    },
    {
      "name": "profitTakeSettledEvent",
      "discriminator": [
        18,
        33,
        142,
        207,
        70,
        13,
        247,
        210
      ]
    },
    {
      "name": "profitTakeTriggeredEvent",
      "discriminator": [
        113,
        165,
        68,
        241,
        211,
        179,
        241,
        46
      ]
    },
    {
      "name": "protocolEmergencyPauseToggled",
      "discriminator": [
        168,
        89,
        57,
        108,
        237,
        250,
        149,
        29
      ]
    },
    {
      "name": "riskParamsUpdatedEvent",
      "discriminator": [
        87,
        26,
        74,
        136,
        125,
        168,
        107,
        23
      ]
    },
    {
      "name": "stopLossSettledEvent",
      "discriminator": [
        61,
        2,
        130,
        235,
        112,
        90,
        57,
        47
      ]
    },
    {
      "name": "stopLossTriggeredEvent",
      "discriminator": [
        70,
        113,
        65,
        104,
        72,
        7,
        217,
        219
      ]
    },
    {
      "name": "tierDowngradeApprovedEvent",
      "discriminator": [
        236,
        128,
        201,
        211,
        92,
        30,
        212,
        198
      ]
    },
    {
      "name": "tierDowngradeRejectedEvent",
      "discriminator": [
        235,
        53,
        56,
        41,
        168,
        27,
        144,
        44
      ]
    },
    {
      "name": "tierDowngradeStagedEvent",
      "discriminator": [
        206,
        254,
        107,
        178,
        93,
        137,
        141,
        157
      ]
    },
    {
      "name": "tierUpgradedEvent",
      "discriminator": [
        110,
        162,
        186,
        192,
        67,
        172,
        70,
        140
      ]
    },
    {
      "name": "tradeExecutedEvent",
      "discriminator": [
        177,
        28,
        68,
        220,
        129,
        3,
        100,
        52
      ]
    },
    {
      "name": "tradeMirroredEvent",
      "discriminator": [
        154,
        42,
        43,
        97,
        215,
        53,
        240,
        145
      ]
    },
    {
      "name": "vaultCreatedEvent",
      "discriminator": [
        81,
        80,
        244,
        58,
        136,
        54,
        236,
        111
      ]
    },
    {
      "name": "vaultPausedEvent",
      "discriminator": [
        75,
        189,
        120,
        167,
        117,
        229,
        155,
        60
      ]
    },
    {
      "name": "vaultResumedEvent",
      "discriminator": [
        237,
        150,
        38,
        144,
        227,
        71,
        26,
        192
      ]
    },
    {
      "name": "verifiedFlagsChangedEvent",
      "discriminator": [
        146,
        145,
        70,
        177,
        86,
        21,
        166,
        190
      ]
    },
    {
      "name": "withdrawalEvent",
      "discriminator": [
        161,
        53,
        185,
        18,
        98,
        254,
        54,
        165
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "masterVaultPaused",
      "msg": "Master vault is currently paused"
    },
    {
      "code": 6001,
      "name": "masterVaultNotPaused",
      "msg": "Master Vault is not paused"
    },
    {
      "code": 6002,
      "name": "masterVaultNotFound",
      "msg": "Master Execution Vault not found"
    },
    {
      "code": 6003,
      "name": "unauthorizedMaster",
      "msg": "Unauthorized - you are not the master of this vault"
    },
    {
      "code": 6004,
      "name": "invalidFeeConfig",
      "msg": "Invalid fee configuration - exceeds maximum allowed"
    },
    {
      "code": 6005,
      "name": "masterFeeExceedsConfig",
      "msg": "Master vault fees exceed maximum allowed in global config"
    },
    {
      "code": 6006,
      "name": "copierVaultPaused",
      "msg": "Copier Vault is currently paused"
    },
    {
      "code": 6007,
      "name": "copierVaultNotPaused",
      "msg": "Copier Vault is not paused"
    },
    {
      "code": 6008,
      "name": "unauthorizedAccess",
      "msg": "Unauthorized access - you do not own this vault"
    },
    {
      "code": 6009,
      "name": "vaultAlreadyPaused",
      "msg": "Vault is already in the requested state (Paused)"
    },
    {
      "code": 6010,
      "name": "vaultNotPaused",
      "msg": "Vault is already in the requested state (Active)"
    },
    {
      "code": 6011,
      "name": "tradeSizeExceeded",
      "msg": "Trade size exceeds maximum allowed percentage"
    },
    {
      "code": 6012,
      "name": "invalidRiskParams",
      "msg": "Invalid risk parameters provided"
    },
    {
      "code": 6013,
      "name": "invalidTakeProfitParameters",
      "msg": "Invalid take profit parameters"
    },
    {
      "code": 6014,
      "name": "maxLossExceeded",
      "msg": "Maximum loss limit exceeded relative to total deposits"
    },
    {
      "code": 6015,
      "name": "maxDrawdownExceeded",
      "msg": "Maximum drawdown exceeded relative to peak balance"
    },
    {
      "code": 6016,
      "name": "invalidAllocationPercentage",
      "msg": "Invalid allocation percentage. Must be between 1 and 100"
    },
    {
      "code": 6017,
      "name": "insufficientBalance",
      "msg": "Insufficient balance for this operation"
    },
    {
      "code": 6018,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow or underflow occurred"
    },
    {
      "code": 6019,
      "name": "invalidAmount",
      "msg": "Invalid amount - must be greater than 0"
    },
    {
      "code": 6020,
      "name": "invalidTradeAmount",
      "msg": "Invalid trade amount"
    },
    {
      "code": 6021,
      "name": "invalidTokenPair",
      "msg": "Invalid token pair - source and destination tokens cannot be the same"
    },
    {
      "code": 6022,
      "name": "tradeFromWalletNotAllowed",
      "msg": "Direct wallet trades not allowed - must use Master Execution Vault"
    },
    {
      "code": 6023,
      "name": "profitThresholdNotMet",
      "msg": "Profit threshold not yet met - current price is below take-profit trigger"
    },
    {
      "code": 6024,
      "name": "positionNotOpen",
      "msg": "No open position to take profit on"
    },
    {
      "code": 6025,
      "name": "sellQuantityZero",
      "msg": "Sell quantity is zero - position size too small for partial sell"
    },
    {
      "code": 6026,
      "name": "invalidOraclePrice",
      "msg": "Invalid oracle price provided"
    },
    {
      "code": 6027,
      "name": "oracleDisagreement",
      "msg": "Oracle prices diverge beyond maximum allowed threshold"
    },
    {
      "code": 6028,
      "name": "atomicCopierCountMismatch",
      "msg": "Atomic path requires exactly active_copier_count copier vault accounts"
    },
    {
      "code": 6029,
      "name": "copierVaultMasterMismatch",
      "msg": "Copier vault does not belong to this master vault"
    },
    {
      "code": 6030,
      "name": "slotGraceWindowExceeded",
      "msg": "Slot grace window exceeded - copier execution too late"
    },
    {
      "code": 6031,
      "name": "vaultMustBeEmptyToClose",
      "msg": "Vault must have zero balance and closed position before close"
    },
    {
      "code": 6032,
      "name": "riskParamExceedsCap",
      "msg": "Requested risk parameter exceeds the protocol-level cap."
    },
    {
      "code": 6033,
      "name": "depositBelowMinimum",
      "msg": "Deposit below minimum required by RiskConfig"
    },
    {
      "code": 6034,
      "name": "stopLossConditionNotMet",
      "msg": "Stop-loss conditions are not yet met - no risk limit has been breached"
    },
    {
      "code": 6035,
      "name": "dailyLossLimitExceeded",
      "msg": "Daily loss limit exceeded - vault has lost more than the configured daily maximum"
    },
    {
      "code": 6036,
      "name": "emergencyWithdrawZeroBalance",
      "msg": "No balance available for emergency withdrawal"
    },
    {
      "code": 6037,
      "name": "invalidDailyLossBps",
      "msg": "Invalid daily loss limit basis points - must be between 1 and 10000"
    },
    {
      "code": 6038,
      "name": "globalPause",
      "msg": "Protocol is globally paused — no new operations allowed."
    },
    {
      "code": 6039,
      "name": "noPendingDowngrade",
      "msg": "No pending tier downgrade to approve or reject"
    },
    {
      "code": 6040,
      "name": "unauthorizedEmergencyAdmin",
      "msg": "Only the emergency admin can toggle the protocol emergency pause"
    },
    {
      "code": 6041,
      "name": "timelockNotExpired",
      "msg": "Authority transfer timelock has not yet expired — wait before accepting"
    },
    {
      "code": 6042,
      "name": "noPendingAuthorityTransfer",
      "msg": "No pending authority transfer exists to accept or cancel"
    },
    {
      "code": 6043,
      "name": "protocolEmergencyPaused",
      "msg": "Protocol is under emergency pause — new operations are blocked"
    },
    {
      "code": 6044,
      "name": "invalidGovernanceParams",
      "msg": "Invalid governance parameter provided"
    }
  ],
  "types": [
    {
      "name": "authorityTransferCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cancelledPendingAuthority",
            "type": "pubkey"
          },
          {
            "name": "cancelledBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "authorityTransferCompleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldAuthority",
            "type": "pubkey"
          },
          {
            "name": "newAuthority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "authorityTransferInitiated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fromAuthority",
            "type": "pubkey"
          },
          {
            "name": "toAuthority",
            "type": "pubkey"
          },
          {
            "name": "effectiveAfter",
            "docs": [
              "Unix timestamp after which accept_authority must be called"
            ],
            "type": "i64"
          },
          {
            "name": "timelockSeconds",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "platformFeeBps",
            "docs": [
              "Platform's share of fees in basis points (e.g., 2000 = 20%)"
            ],
            "type": "u16"
          },
          {
            "name": "traderFeeBps",
            "docs": [
              "Master trader's share of fees in basis points (e.g., 8000 = 80%)",
              "Note: platform_fees_bps + trader_fee_bps should = 10000 (100%)"
            ],
            "type": "u16"
          },
          {
            "name": "maxSuccessFeeBps",
            "docs": [
              "Maximum success fee a master can charge (basis points)",
              "E.g., 5000 = 50% max success fee"
            ],
            "type": "u16"
          },
          {
            "name": "maxVolumeFeeBps",
            "docs": [
              "Maximum volume fee a master can charge (basis points)",
              "E.g., 100 = 1% max volume fee"
            ],
            "type": "u16"
          },
          {
            "name": "feeWallet",
            "docs": [
              "Wallet address where platform fees are collected",
              "Can be updated to migrate from simple wallet -> multisig -> DAO treasury"
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "Authrity: who can update this config",
              "Should be founder initially, then multisg, then DAO"
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          },
          {
            "name": "admin",
            "docs": [
              "Admin public key, who can update the config"
            ],
            "type": "pubkey"
          },
          {
            "name": "atomicThreshold",
            "docs": [
              "Max copiers for atomic execution path (e.g. 20–30); above this use slot path"
            ],
            "type": "u16"
          },
          {
            "name": "slotGraceWindow",
            "docs": [
              "Max slots allowed for copier execution after master (slot path)"
            ],
            "type": "u8"
          },
          {
            "name": "protocolVersion",
            "docs": [
              "Protocol version for upgrades"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "copierVault",
      "docs": [
        "Represents a copier's vault.",
        "CRITICAL: Links to Master Execution vault PDA. not master wallet"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "copier",
            "docs": [
              "The copier who owns this vault"
            ],
            "type": "pubkey"
          },
          {
            "name": "masterVault",
            "docs": [
              "CRITICAL: Master execution Vault PDA (Not master wallet)",
              "This ensures copiers only mirror vault-executed trades"
            ],
            "type": "pubkey"
          },
          {
            "name": "balance",
            "docs": [
              "Current balance (in lamports for SOL, or token amount)"
            ],
            "type": "u64"
          },
          {
            "name": "totalDeposited",
            "docs": [
              "Total amount deposited (for PnL calculation)"
            ],
            "type": "u64"
          },
          {
            "name": "riskParams",
            "docs": [
              "Risk management parameters"
            ],
            "type": {
              "defined": {
                "name": "riskParams"
              }
            }
          },
          {
            "name": "stats",
            "docs": [
              "Perfromance tracking"
            ],
            "type": {
              "defined": {
                "name": "vaultStats"
              }
            }
          },
          {
            "name": "isPaused",
            "docs": [
              "Vault status"
            ],
            "type": "bool"
          },
          {
            "name": "createdAt",
            "docs": [
              "Time Created"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump seed for PDA derivation"
            ],
            "type": "u8"
          },
          {
            "name": "lastSyncedPositionId",
            "docs": [
              "Last synced master position ID"
            ],
            "type": "u64"
          },
          {
            "name": "currentPosition",
            "docs": [
              "Current active position"
            ],
            "type": {
              "defined": {
                "name": "positionData"
              }
            }
          },
          {
            "name": "takeProfitTriggerBps",
            "docs": [
              "Profit-taking parameters (can override master's to be stricter)"
            ],
            "type": "u16"
          },
          {
            "name": "takeProfitSellBps",
            "type": "u16"
          },
          {
            "name": "copyActive",
            "docs": [
              "Re-entry configuration"
            ],
            "type": "bool"
          },
          {
            "name": "allowReentryAfterFullExit",
            "type": "bool"
          },
          {
            "name": "totalRealizedProfit",
            "docs": [
              "Performance tracking"
            ],
            "type": "i64"
          },
          {
            "name": "highWaterMark",
            "type": "u64"
          },
          {
            "name": "dailyLossLamports",
            "docs": [
              "Accumulated loss in the current 24-hour window (in lamports).",
              "Reset to 0 when the current unis timestamp exceeds",
              "`daily_loss_reset_timestamp + 86400`."
            ],
            "type": "u64"
          },
          {
            "name": "dailyLossResetTimestamp",
            "docs": [
              "Unix timestamp marking the start of the current loss window.",
              "Initialised to `created_at`; advanced by 86400 seconds each day"
            ],
            "type": "i64"
          },
          {
            "name": "dailyLossLimitBps",
            "docs": [
              "Maximum daily loss as basis points of `total_deposited`",
              "(e.g. 500 = 5 %). 0 = feature disabled.",
              "Set by the copier; validated against `RiskConfig` caps on creation."
            ],
            "type": "u16"
          },
          {
            "name": "stopLossTriggerBps",
            "docs": [
              "Custom stop-loss threshold as basis point of `total_deposited`",
              "(e.g 1500 = 15 %). 0 = feature disabled",
              "When the vault's cumulative loss exceeds this the stop-loss",
              "instruction will pause the vault automatically"
            ],
            "type": "u16"
          },
          {
            "name": "stopLossSellBps",
            "docs": [
              "Percentage of position to sell when stop-loss trigger fires (basis points).",
              "e.g. 10000 = 100% (full exit)."
            ],
            "type": "u16"
          },
          {
            "name": "stopLossTriggered",
            "docs": [
              "Guard flag: set to true after stop-loss fires, reset on new position.",
              "Mirrors profit_taken pattern so both triggers are mutually exclusive."
            ],
            "type": "bool"
          },
          {
            "name": "dailyLossStartBalance",
            "docs": [
              "Vault balance captured at the start of the current trading day.",
              "Reset each time `last_day_reset` is more than 86 400 seconds old."
            ],
            "type": "u64"
          },
          {
            "name": "lastDayReset",
            "docs": [
              "Unix timestamp of the last daily-reset check."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "copierVaultStatusEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "copierVault",
            "type": "pubkey"
          },
          {
            "name": "actionBy",
            "type": "pubkey"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "depositEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "newBalance",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "depositMasterEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "master",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "newTotalDeposits",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "emergencyWithdrawEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "copierVault",
            "type": "pubkey"
          },
          {
            "name": "copier",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "amountWithdrawn",
            "docs": [
              "Amount of lamports returned to copier"
            ],
            "type": "u64"
          },
          {
            "name": "hadOpenPosition",
            "docs": [
              "Whether an open position existed at time of withdrawal"
            ],
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "feeClaimedEvent",
      "docs": [
        "Event emitted when fees are claimed from master vault"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "masterWallet",
            "type": "pubkey"
          },
          {
            "name": "amountClaimed",
            "type": "u64"
          },
          {
            "name": "remainingFees",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "feeCollectedEvent",
      "docs": [
        "Event emitted when fees are collected"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "tradeSignature",
            "type": "string"
          },
          {
            "name": "totalFee",
            "type": "u64"
          },
          {
            "name": "platformFee",
            "type": "u64"
          },
          {
            "name": "traderFee",
            "type": "u64"
          },
          {
            "name": "platformWallet",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "tier",
            "type": "u8"
          },
          {
            "name": "traderFeeBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "feeWalletUpdated",
      "docs": [
        "Event emitted when fee wallet is updated",
        "Important for tracking governance transitions"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldWallet",
            "type": "pubkey"
          },
          {
            "name": "newWallet",
            "type": "pubkey"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "governanceConfig",
      "docs": [
        "Protocol-wide governance configuration",
        "PDA seed: b\"governance_config\" (singleton)"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "primaryAuthority",
            "docs": [
              "Primary authority - can update all Config PDAs and this config."
            ],
            "type": "pubkey"
          },
          {
            "name": "emergencyAdmin",
            "docs": [
              "Emergency admin - restricted role; may ONLY toggle emergency_pause_enabled",
              "Should be a hardware-wallet key seperate from primary_authority"
            ],
            "type": "pubkey"
          },
          {
            "name": "emergencyPauseEnabled",
            "docs": [
              "When true every new vault operation (trade, deposit, vault init) is",
              "blocked protocol-wide.",
              "",
              "Distinct from `RiskConfig.global_pause` which only blocks copy-trade",
              "opens — this blocks everything including deposits and new vaults.",
              "",
              "Withdrawals, stop-loss triggers, and profit-take triggers are NOT",
              "blocked so that users can always exit their positions."
            ],
            "type": "bool"
          },
          {
            "name": "timelockSeconds",
            "docs": [
              "minimum delay (seconds) that must elapse between `transfer_authority`",
              "being called and `accept_authority` being accepted by the new owner.",
              "",
              "example values:",
              "0 - no timelock (devnet / test only)",
              "86_400 - 24 hours",
              "172_800 - 48 hours (recommended minimum for mainnet)",
              "604_800 - 7 days (DAO governance)"
            ],
            "type": "i64"
          },
          {
            "name": "pendingAuthority",
            "docs": [
              "The proposed new primary_authority",
              "`PubKey::default()` means no transfer is currently pending.",
              "Set by `transfer_authority`; cleared by `accept_authority` or",
              "`cancel_authority_transfer`."
            ],
            "type": "pubkey"
          },
          {
            "name": "authorityChangeAfter",
            "docs": [
              "Unix timestamp after which `accept_authority` becomes callable.",
              "Zero when no transfer is pending"
            ],
            "type": "i64"
          },
          {
            "name": "upgradeAuthority",
            "docs": [
              "Stored for transparency - the actual enforcement is by Solana's BPF",
              "loader (not this program). Should always match the upgrade authority",
              "returned by `solana program show <PROGRAM_ID>`."
            ],
            "type": "pubkey"
          },
          {
            "name": "minProposalThreshold",
            "docs": [
              "Minimum token-weighted votes required to pass a governance proposal.",
              "Zero = DAO governance not yet active; authority model is used instead."
            ],
            "type": "u64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Unix timestamp of last update (any field)."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "governanceConfigInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "primaryAuthority",
            "type": "pubkey"
          },
          {
            "name": "emergencyAdmin",
            "type": "pubkey"
          },
          {
            "name": "timelockSeconds",
            "type": "i64"
          },
          {
            "name": "upgradeAuthority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "governanceConfigUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updatedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "jupiterSwapEvent",
      "docs": [
        "Event emitted when a Jupiter swap is triggered via CPI (Week 10)"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "inputMint",
            "type": "pubkey"
          },
          {
            "name": "outputMint",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "minAmountOut",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "masterExecutionVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterWallet",
            "docs": [
              "The master trader who owns this vault"
            ],
            "type": "pubkey"
          },
          {
            "name": "totalDeposits",
            "docs": [
              "Total deposits"
            ],
            "type": "u64"
          },
          {
            "name": "successFeePercent",
            "type": "u16"
          },
          {
            "name": "volumeFeePercent",
            "type": "u16"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "totalFeesEarned",
            "type": "u64"
          },
          {
            "name": "totalTrades",
            "type": "u32"
          },
          {
            "name": "isPaused",
            "docs": [
              "Vault status"
            ],
            "type": "bool"
          },
          {
            "name": "createdAt",
            "docs": [
              "Time created"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          },
          {
            "name": "positionCounter",
            "docs": [
              "position counter. (increments on each. new postion)"
            ],
            "type": "u64"
          },
          {
            "name": "currentPosition",
            "docs": [
              "Current active position (simplied for MVP - single asset)",
              "for multi-asset in the future, this becomes seperate PositionAccount PDAs"
            ],
            "type": {
              "defined": {
                "name": "positionData"
              }
            }
          },
          {
            "name": "totalRealizedProfit",
            "type": "i64"
          },
          {
            "name": "takeProfitTriggerBps",
            "docs": [
              "progit taking parameters"
            ],
            "type": "u16"
          },
          {
            "name": "takeProfitSellBps",
            "type": "u16"
          },
          {
            "name": "highWaterMark",
            "docs": [
              "High-water mark for fee calculation"
            ],
            "type": "u64"
          },
          {
            "name": "activeCopierCount",
            "docs": [
              "Number of active copier vaults (for execution path: atomic vs slot)",
              "Incremented on initialize_copier_vault; decremented when copier vault is closed"
            ],
            "type": "u32"
          },
          {
            "name": "verifiedFlags",
            "docs": [
              "Bitmask of off-chain criteria verified by the admin.",
              "Use the constants in `verified_flags` module to read/write.",
              "Only the TierConfig admin can modify via `set_verified_flags`."
            ],
            "type": "u8"
          },
          {
            "name": "currentTier",
            "docs": [
              "Master's currently active tier (1–5, starts at 1 = Community Trader).",
              "Updated immediately on upgrade; only updated after admin approval on downgrade."
            ],
            "type": "u8"
          },
          {
            "name": "pendingDowngradeTier",
            "docs": [
              "When a downgrade is detected, the new lower tier is staged here.",
              "Zero = no downgrade pending.",
              "The current tier (and its fee split) remains active until admin",
              "calls approve_tier_downgrade."
            ],
            "type": "u8"
          },
          {
            "name": "tierConfirmedSlot",
            "docs": [
              "Slot at which current_tier was last confirmed (upgrade or approved downgrade).",
              "Used by the leaderboard to display how long a master has held their tier."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "masterTrade",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "positionId",
            "type": "u64"
          },
          {
            "name": "assetMint",
            "type": "pubkey"
          },
          {
            "name": "tradeType",
            "type": "u8"
          },
          {
            "name": "masterAmount",
            "type": "u64"
          },
          {
            "name": "executionSlot",
            "type": "u64"
          },
          {
            "name": "executionPrice",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "masterVaultStatusEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "actionBy",
            "type": "pubkey"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "mirrorTradeParams",
      "docs": [
        "Parameters for mirroring a trade"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterPositionId",
            "type": "u64"
          },
          {
            "name": "assetMint",
            "type": "pubkey"
          },
          {
            "name": "tradeType",
            "type": {
              "defined": {
                "name": "tradeType"
              }
            }
          },
          {
            "name": "masterAmount",
            "type": "u64"
          },
          {
            "name": "masterPrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "positionData",
      "docs": [
        "Position data for tracking individual asset positions",
        "This will be embedded in MasterExecution Vault and CopierVault"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "positionId",
            "docs": [
              "Unique position ID (increments on full exit -> re-entry)"
            ],
            "type": "u64"
          },
          {
            "name": "state",
            "docs": [
              "Current state"
            ],
            "type": {
              "defined": {
                "name": "positionState"
              }
            }
          },
          {
            "name": "entryPrice",
            "docs": [
              "Entry price (weighted average for partial re-enteries)",
              "Stored in basis point (e.g., $100.00 = 10000)"
            ],
            "type": "u64"
          },
          {
            "name": "size",
            "docs": [
              "Current position size (in basis units)"
            ],
            "type": "u64"
          },
          {
            "name": "realizedProfit",
            "docs": [
              "Realized profit from this position (accumulated)"
            ],
            "type": "i64"
          },
          {
            "name": "profitTaken",
            "docs": [
              "Has profut-taken been triggered for this position?"
            ],
            "type": "bool"
          },
          {
            "name": "openedAt",
            "docs": [
              "Timestamp when position was opened"
            ],
            "type": "i64"
          },
          {
            "name": "lastUpdated",
            "docs": [
              "Timestamp of last update"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "positionState",
      "docs": [
        "Position state machine for tracking position lifecycle"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "closed"
          },
          {
            "name": "open"
          },
          {
            "name": "partialClosed"
          }
        ]
      }
    },
    {
      "name": "positionStateChangedEvent",
      "docs": [
        "Event emitted when position state changes"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "positionId",
            "type": "u64"
          },
          {
            "name": "assetMint",
            "type": "pubkey"
          },
          {
            "name": "oldState",
            "type": {
              "defined": {
                "name": "positionState"
              }
            }
          },
          {
            "name": "newState",
            "type": {
              "defined": {
                "name": "positionState"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "profitTakeSettledEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "positionId",
            "type": "u64"
          },
          {
            "name": "sellQuantity",
            "type": "u64"
          },
          {
            "name": "receivedAmount",
            "type": "u64"
          },
          {
            "name": "realizedProfit",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "profitTakeTriggeredEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "positionId",
            "type": "u64"
          },
          {
            "name": "oraclePrice",
            "type": "u64"
          },
          {
            "name": "entryPrice",
            "type": "u64"
          },
          {
            "name": "profitBps",
            "type": "u64"
          },
          {
            "name": "sellQuantity",
            "type": "u64"
          },
          {
            "name": "remainingSize",
            "type": "u64"
          },
          {
            "name": "realizedProfitUsd",
            "type": "u64"
          },
          {
            "name": "feesEarnedUsd",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "protocolEmergencyPauseToggled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "enabled",
            "docs": [
              "true = paused, false = resumed"
            ],
            "type": "bool"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "riskConfig",
      "docs": [
        "Protocol-wide risk configuration.",
        "PDA seed: b\"risk_config\""
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "Protocol admin — only this key may update RiskConfig or trigger emergency ops."
            ],
            "type": "pubkey"
          },
          {
            "name": "maxDrawdownCapPct",
            "docs": [
              "Global max drawdown cap (e.g., 80 = 80%). User cannot set higher."
            ],
            "type": "u8"
          },
          {
            "name": "maxTradeSizeCapPct",
            "docs": [
              "Maximum allowed single-trade allocation as % of vault balance.",
              "e.g. 20 = copiers cannot set max_trade_size_pct above 20%.",
              "Global max trade size cap (e.g., 30 = 30%). User cannot set higher."
            ],
            "type": "u8"
          },
          {
            "name": "maxDailyLossBpsCap",
            "docs": [
              "Absolute maximum daily loss % cap across all vaults (basis points).",
              "e.g. 2000 = no vault may sustain more than 20% loss in one day."
            ],
            "type": "u16"
          },
          {
            "name": "maxStopLossBpsCap",
            "docs": [
              "Maximum stop-loss trigger threshold (basis points).",
              "e.g. 3000 = stop-loss triggers cannot be set looser than 30%."
            ],
            "type": "u16"
          },
          {
            "name": "minStopLossPct",
            "docs": [
              "Minimum required stop-loss (e.g., 5 = 5%). User cannot set lower."
            ],
            "type": "u8"
          },
          {
            "name": "minVaultDepositLamports",
            "docs": [
              "Minimum deposit (e.g., 0.1 SOL = 100_000_000 lamports)"
            ],
            "type": "u64"
          },
          {
            "name": "emergencyRiskOverride",
            "docs": [
              "When true, admin may call emergency_withdraw on any copier vault.",
              "When true, admin can pause risky trades via emergency_override"
            ],
            "type": "bool"
          },
          {
            "name": "globalPause",
            "docs": [
              "When true, all new copy-trade opens are blocked protocol-wide."
            ],
            "type": "bool"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Unix timestamp of last update."
            ],
            "type": "i64"
          },
          {
            "name": "authority",
            "docs": [
              "Who can update risk caps (update_risk_config)"
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "riskParams",
      "docs": [
        "Risk management parameters (set by copier)"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maxLossPct",
            "docs": [
              "Maximum loss as percentage (e.g., 20 = 20%)"
            ],
            "type": "u8"
          },
          {
            "name": "maxTradeSizePct",
            "docs": [
              "Maximum trade size as percentage (e.g., 10 = 10%)"
            ],
            "type": "u8"
          },
          {
            "name": "maxDrawdownPct",
            "docs": [
              "Maximum drawdown percentage"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "riskParamsUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "copierVault",
            "type": "pubkey"
          },
          {
            "name": "oldParams",
            "type": {
              "defined": {
                "name": "riskParams"
              }
            }
          },
          {
            "name": "newParams",
            "type": {
              "defined": {
                "name": "riskParams"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "stopLossSettledEvent",
      "docs": [
        "Emitted after the backend confirms the Jupiter swap settled."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "copierVault",
            "type": "pubkey"
          },
          {
            "name": "positionId",
            "type": "u64"
          },
          {
            "name": "sellQuantity",
            "type": "u64"
          },
          {
            "name": "receivedAmount",
            "type": "u64"
          },
          {
            "name": "realizedLoss",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "stopLossTriggeredEvent",
      "docs": [
        "Emitted when a copier vault's stop-loss is triggered.",
        "Backend listens for this to execute the Jupiter swap."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "copierVault",
            "type": "pubkey"
          },
          {
            "name": "positionId",
            "type": "u64"
          },
          {
            "name": "oraclePrice",
            "docs": [
              "Oracle price that crossed the stop-loss threshold (micro-USD)"
            ],
            "type": "u64"
          },
          {
            "name": "entryPrice",
            "docs": [
              "Entry price of the position (micro-USD)"
            ],
            "type": "u64"
          },
          {
            "name": "lossBps",
            "docs": [
              "How far below entry the price has fallen (bps)"
            ],
            "type": "u64"
          },
          {
            "name": "sellQuantity",
            "docs": [
              "Quantity to sell (in position size units)"
            ],
            "type": "u64"
          },
          {
            "name": "remainingSize",
            "docs": [
              "Remaining position size after the sell"
            ],
            "type": "u64"
          },
          {
            "name": "unrealizedLoss",
            "docs": [
              "Unrealized loss for the sold portion (negative, micro-USD)"
            ],
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tierConfig",
      "docs": [
        "Protocol-wide tier configuration.",
        "PDA seed: b\"tier_config\""
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "communityMinTrades",
            "type": "u32"
          },
          {
            "name": "communityMinVolumeUsd",
            "type": "u64"
          },
          {
            "name": "communityMinActivityDays",
            "type": "u16"
          },
          {
            "name": "communityMinWinRateBps",
            "type": "u16"
          },
          {
            "name": "communityMaxDrawdownBps",
            "type": "u16"
          },
          {
            "name": "communityMinCopiers",
            "type": "u32"
          },
          {
            "name": "communityTraderFeeBps",
            "type": "u16"
          },
          {
            "name": "risingMinTrades",
            "type": "u32"
          },
          {
            "name": "risingMinVolumeUsd",
            "type": "u64"
          },
          {
            "name": "risingMinTrackRecordDays",
            "type": "u16"
          },
          {
            "name": "risingMinWinRateBps",
            "type": "u16"
          },
          {
            "name": "risingMaxDrawdownBps",
            "type": "u16"
          },
          {
            "name": "risingMinAumUsd",
            "type": "u64"
          },
          {
            "name": "risingMinCopierRetentionBps",
            "type": "u16"
          },
          {
            "name": "risingTraderFeeBps",
            "type": "u16"
          },
          {
            "name": "verifiedMinTrades",
            "type": "u32"
          },
          {
            "name": "verifiedMinVolumeUsd",
            "type": "u64"
          },
          {
            "name": "verifiedMinTrackRecordDays",
            "type": "u16"
          },
          {
            "name": "verifiedMinWinRateBps",
            "type": "u16"
          },
          {
            "name": "verifiedMaxDrawdownBps",
            "type": "u16"
          },
          {
            "name": "verifiedMinAumUsd",
            "type": "u64"
          },
          {
            "name": "verifiedMinCopiers",
            "type": "u32"
          },
          {
            "name": "verifiedTraderFeeBps",
            "type": "u16"
          },
          {
            "name": "eliteMinVolumeUsd",
            "type": "u64"
          },
          {
            "name": "eliteMinAumUsd",
            "type": "u64"
          },
          {
            "name": "eliteMinTrackRecordDays",
            "type": "u16"
          },
          {
            "name": "eliteMaxDrawdownBps",
            "type": "u16"
          },
          {
            "name": "eliteMinCopiers",
            "type": "u32"
          },
          {
            "name": "eliteTraderFeeBps",
            "type": "u16"
          },
          {
            "name": "institutionalMinVolumeUsd",
            "type": "u64"
          },
          {
            "name": "institutionalMinAumUsd",
            "type": "u64"
          },
          {
            "name": "institutionalMinTrackRecordDays",
            "type": "u16"
          },
          {
            "name": "institutionalMaxDrawdownBps",
            "type": "u16"
          },
          {
            "name": "institutionalTraderFeeBps",
            "type": "u16"
          },
          {
            "name": "admin",
            "docs": [
              "Protocol admin — only this key may call update_tier_config or",
              "set_verified_flags / approve_tier_downgrade."
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "Who can update tier thresholds (update_tier_config)."
            ],
            "type": "pubkey"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Unix timestamp of last update."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tierDowngradeApprovedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "masterWallet",
            "type": "pubkey"
          },
          {
            "name": "fromTier",
            "type": "u8"
          },
          {
            "name": "toTier",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tierDowngradeRejectedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "masterWallet",
            "type": "pubkey"
          },
          {
            "name": "keptTier",
            "type": "u8"
          },
          {
            "name": "rejectedTier",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tierDowngradeStagedEvent",
      "docs": [
        "Emitted when a tier downgrade is detected and staged for admin approval.",
        "The master's current (higher) split remains active until approve_tier_downgrade is called."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "masterWallet",
            "type": "pubkey"
          },
          {
            "name": "currentTier",
            "type": "u8"
          },
          {
            "name": "pendingTier",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tierUpgradedEvent",
      "docs": [
        "Emitted when a master's tier upgrades immediately during a trade."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "masterWallet",
            "type": "pubkey"
          },
          {
            "name": "fromTier",
            "type": "u8"
          },
          {
            "name": "toTier",
            "type": "u8"
          },
          {
            "name": "newTraderFeeBps",
            "type": "u16"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tradeExecutedEvent",
      "docs": [
        "Emitted when a trade is executed on a master vault"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "masterWallet",
            "type": "pubkey"
          },
          {
            "name": "tokenIn",
            "type": "pubkey"
          },
          {
            "name": "tokenOut",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "minAmountOut",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "positionId",
            "docs": [
              "Position ID (for copiers to track which position to mirror)"
            ],
            "type": "u64"
          },
          {
            "name": "tradeType",
            "docs": [
              "Trade type classification"
            ],
            "type": {
              "defined": {
                "name": "tradeType"
              }
            }
          },
          {
            "name": "price",
            "docs": [
              "Execution price (oracle price at trade time)"
            ],
            "type": "u64"
          },
          {
            "name": "positionState",
            "docs": [
              "New position state after trade"
            ],
            "type": {
              "defined": {
                "name": "positionState"
              }
            }
          },
          {
            "name": "entryPrice",
            "type": "u64"
          },
          {
            "name": "positionSize",
            "docs": [
              "Current position size after trade"
            ],
            "type": "u64"
          },
          {
            "name": "realizedProfit",
            "docs": [
              "Realized profit from this trade (0 for buys)"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tradeMirroredEvent",
      "docs": [
        "Event emittef when a copier mirrors a master trade"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "copierVault",
            "type": "pubkey"
          },
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "masterPositionId",
            "type": "u64"
          },
          {
            "name": "assetMint",
            "type": "pubkey"
          },
          {
            "name": "tradeType",
            "type": {
              "defined": {
                "name": "tradeType"
              }
            }
          },
          {
            "name": "masterAmount",
            "type": "u64"
          },
          {
            "name": "copierAmount",
            "type": "u64"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "slippageBps",
            "type": "u16"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "fullyExecuted",
            "type": "bool"
          },
          {
            "name": "filledAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tradeParams",
      "docs": [
        "Trade parameters"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenIn",
            "type": "pubkey"
          },
          {
            "name": "tokenOut",
            "type": "pubkey"
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "minAmountOut",
            "type": "u64"
          },
          {
            "name": "oraclePrice",
            "type": "u64"
          },
          {
            "name": "tradeType",
            "type": {
              "defined": {
                "name": "tradeType"
              }
            }
          },
          {
            "name": "jupiterInstructionData",
            "docs": [
              "Serialized Jupiter swap instruction data (base64-decoded).",
              "Populated from Jupiter's /v6/swap-instructions response.",
              "Empty vec signals mock/devnet mode — no real swap is executed."
            ],
            "type": "bytes"
          },
          {
            "name": "daysActive",
            "docs": [
              "Days since this master vault was created (clock.unix_timestamp - created_at) / 86400."
            ],
            "type": "u16"
          },
          {
            "name": "winRateBps",
            "docs": [
              "Win rate in bps (profitable closed trades / total closed trades × 10000)."
            ],
            "type": "u16"
          },
          {
            "name": "maxDrawdownBps",
            "docs": [
              "Max drawdown in bps since vault inception (off-chain computed from snapshot history)."
            ],
            "type": "u16"
          },
          {
            "name": "rollingAumUsd",
            "docs": [
              "Rolling average AUM in USD (×1e6) over the relevant window."
            ],
            "type": "u64"
          },
          {
            "name": "copierRetentionBps",
            "docs": [
              "Copier retention rate in bps (backend-computed)."
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "tradeType",
      "docs": [
        "Trade type classification for events"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "buy"
          },
          {
            "name": "sell"
          },
          {
            "name": "partialSell"
          }
        ]
      }
    },
    {
      "name": "vaultCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "docs": [
              "Master vault address (Some if master, None if copier)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "copierVault",
            "docs": [
              "Copier vault address (Some if copier, None if master)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "masterWallet",
            "docs": [
              "Master wallet address (for master vaults)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "copierWallet",
            "docs": [
              "Copier wallet address (for copier vaults)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp pf creation"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "vaultPausedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "copierVault",
            "type": "pubkey"
          },
          {
            "name": "copier",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "vaultResumedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "copierVault",
            "type": "pubkey"
          },
          {
            "name": "copier",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "vaultStats",
      "docs": [
        "Vault performance statistics"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "peakBalance",
            "docs": [
              "Highest balance reached (for high-water mark)"
            ],
            "type": "u64"
          },
          {
            "name": "totalTrades",
            "docs": [
              "Total number of trades executed"
            ],
            "type": "u32"
          },
          {
            "name": "winningTrades",
            "docs": [
              "number of winning trades"
            ],
            "type": "u32"
          },
          {
            "name": "feesOwed",
            "docs": [
              "accumulated fees owed to master"
            ],
            "type": "u64"
          },
          {
            "name": "copyCount",
            "docs": [
              "copy count"
            ],
            "type": "u32"
          },
          {
            "name": "allocationPercentage",
            "docs": [
              "Allocation percentage"
            ],
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "verifiedFlagsChangedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "masterVault",
            "type": "pubkey"
          },
          {
            "name": "masterWallet",
            "type": "pubkey"
          },
          {
            "name": "oldFlags",
            "type": "u8"
          },
          {
            "name": "newFlags",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "withdrawalEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "withdrawer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "newBalance",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
