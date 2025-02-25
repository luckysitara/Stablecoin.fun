/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/basic.json`.
 */
export type Basic = {
  "address": "ETwg2dCnvVCqf7JQ4qcp9dBuYmsbLDnPHirAyQFVT817",
  "metadata": {
    "name": "basic",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createToken",
      "discriminator": [
        84,
        52,
        204,
        228,
        24,
        140,
        234,
        75
      ],
      "accounts": [
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  79,
                  73,
                  78,
                  95,
                  77,
                  73,
                  78,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "arg",
                "path": "params.symbol"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenMetadataProgram"
        },
        {
          "name": "coinAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  79,
                  73,
                  78,
                  95,
                  65,
                  67,
                  67,
                  79,
                  85,
                  78,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initCoinParams"
            }
          }
        },
        {
          "name": "currency",
          "type": "string"
        },
        {
          "name": "image",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "coinType",
          "type": "string"
        }
      ]
    },
    {
      "name": "initTreasury",
      "discriminator": [
        105,
        152,
        173,
        51,
        158,
        151,
        49,
        14
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "treasuryPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  82,
                  69,
                  65,
                  83,
                  85,
                  82,
                  89,
                  51
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
          "name": "bondAta",
          "type": "pubkey"
        },
        {
          "name": "bondCoinMint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "tokensBurn",
      "discriminator": [
        199,
        133,
        34,
        44,
        197,
        6,
        31,
        230
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "feed"
        },
        {
          "name": "userStablecoinAta",
          "writable": true
        },
        {
          "name": "coinAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  79,
                  73,
                  78,
                  95,
                  65,
                  67,
                  67,
                  79,
                  85,
                  78,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  82,
                  69,
                  65,
                  83,
                  85,
                  82,
                  89,
                  51
                ]
              }
            ]
          }
        },
        {
          "name": "bondMint",
          "writable": true
        },
        {
          "name": "treasuryBondAta",
          "writable": true
        },
        {
          "name": "coinAccountBondAta",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenProgram2022",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
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
      "name": "tokensMint",
      "discriminator": [
        103,
        170,
        206,
        84,
        137,
        85,
        209,
        163
      ],
      "accounts": [
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "destination",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "feed"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenProgram2022",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "coinAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  67,
                  79,
                  73,
                  78,
                  95,
                  65,
                  67,
                  67,
                  79,
                  85,
                  78,
                  84
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  84,
                  82,
                  69,
                  65,
                  83,
                  85,
                  82,
                  89,
                  51
                ]
              }
            ]
          }
        },
        {
          "name": "bondMint",
          "writable": true
        },
        {
          "name": "treasuryBondAta",
          "writable": true
        },
        {
          "name": "coinAccountBondAta",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "treasuryToTokenpda",
      "discriminator": [
        200,
        88,
        207,
        175,
        206,
        254,
        136,
        107
      ],
      "accounts": [
        {
          "name": "treasury",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "recipientTokenAccount",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "token2022Program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
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
      "name": "coinAccount",
      "discriminator": [
        32,
        126,
        109,
        137,
        54,
        111,
        78,
        149
      ]
    },
    {
      "name": "treasury",
      "discriminator": [
        238,
        239,
        123,
        238,
        89,
        1,
        168,
        253
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidQuantity",
      "msg": "Quantity must be greater than zero."
    },
    {
      "code": 6001,
      "name": "invalidCalculation",
      "msg": "Token calculation resulted in zero tokens."
    },
    {
      "code": 6002,
      "name": "insufficientFunds",
      "msg": "Insufficient funds in the PDA."
    },
    {
      "code": 6003,
      "name": "invalidSymbol",
      "msg": "Invalid symbol."
    },
    {
      "code": 6004,
      "name": "symbolTooLong",
      "msg": "Symbol must be 4 characters or less."
    },
    {
      "code": 6005,
      "name": "symbolNotAlphanumeric",
      "msg": "Symbol must be alphanumeric."
    },
    {
      "code": 6006,
      "name": "invalidCurrency",
      "msg": "Invalid currency."
    },
    {
      "code": 6007,
      "name": "invalidImage",
      "msg": "Invalid image."
    },
    {
      "code": 6008,
      "name": "invalidDescription",
      "msg": "Invalid description."
    },
    {
      "code": 6009,
      "name": "invalidCoinType",
      "msg": "Invalid coin type."
    }
  ],
  "types": [
    {
      "name": "coinAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "coinType",
            "type": "string"
          },
          {
            "name": "currency",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "image",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "initCoinParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "decimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "treasury",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bondAta",
            "type": "pubkey"
          },
          {
            "name": "bondCoinMint",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
