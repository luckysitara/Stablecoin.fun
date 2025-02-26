export type Basic = {
  version: "0.1.0"
  name: "basic"
  instructions: [
    {
      name: "createToken"
      accounts: [
        { name: "metadata"; isMut: true; isSigner: false },
        { name: "mint"; isMut: true; isSigner: false },
        { name: "payer"; isMut: true; isSigner: true },
        { name: "rent"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false },
        { name: "tokenProgram"; isMut: false; isSigner: false },
        { name: "tokenMetadataProgram"; isMut: false; isSigner: false },
        { name: "coinAccount"; isMut: true; isSigner: false },
      ]
      args: [
        { name: "params"; type: { defined: "InitCoinParams" } },
        { name: "currency"; type: "string" },
        { name: "image"; type: "string" },
        { name: "description"; type: "string" },
        { name: "coinType"; type: "string" },
      ]
    },
    {
      name: "initTreasury"
      accounts: [
        { name: "payer"; isMut: true; isSigner: true },
        { name: "treasuryPda"; isMut: true; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false },
      ]
      args: [{ name: "bondAta"; type: "publicKey" }, { name: "bondCoinMint"; type: "publicKey" }]
    },
    {
      name: "tokensBurn"
      accounts: [
        { name: "mint"; isMut: true; isSigner: false },
        { name: "payer"; isMut: true; isSigner: true },
        { name: "feed"; isMut: false; isSigner: false },
        { name: "userStablecoinAta"; isMut: true; isSigner: false },
        { name: "coinAccount"; isMut: true; isSigner: false },
        { name: "treasury"; isMut: true; isSigner: false },
        { name: "bondMint"; isMut: true; isSigner: false },
        { name: "treasuryBondAta"; isMut: true; isSigner: false },
        { name: "coinAccountBondAta"; isMut: true; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false },
        { name: "tokenProgram"; isMut: false; isSigner: false },
        { name: "tokenProgram2022"; isMut: false; isSigner: false },
        { name: "associatedTokenProgram"; isMut: false; isSigner: false },
      ]
      args: [{ name: "amount"; type: "u64" }]
    },
    {
      name: "tokensMint"
      accounts: [
        { name: "mint"; isMut: true; isSigner: false },
        { name: "destination"; isMut: true; isSigner: false },
        { name: "payer"; isMut: true; isSigner: true },
        { name: "feed"; isMut: false; isSigner: false },
        { name: "rent"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false },
        { name: "tokenProgram"; isMut: false; isSigner: false },
        { name: "tokenProgram2022"; isMut: false; isSigner: false },
        { name: "associatedTokenProgram"; isMut: false; isSigner: false },
        { name: "coinAccount"; isMut: true; isSigner: false },
        { name: "treasury"; isMut: true; isSigner: false },
        { name: "bondMint"; isMut: true; isSigner: false },
        { name: "treasuryBondAta"; isMut: true; isSigner: false },
        { name: "coinAccountBondAta"; isMut: true; isSigner: false },
      ]
      args: [{ name: "solAmount"; type: "u64" }]
    },
    {
      name: "treasuryToTokenpda"
      accounts: [
        { name: "treasury"; isMut: false; isSigner: false },
        { name: "treasuryTokenAccount"; isMut: true; isSigner: false },
        { name: "recipientTokenAccount"; isMut: true; isSigner: false },
        { name: "mint"; isMut: false; isSigner: false },
        { name: "token2022Program"; isMut: false; isSigner: false },
        { name: "tokenProgram"; isMut: false; isSigner: false },
        { name: "associatedTokenProgram"; isMut: false; isSigner: false },
      ]
      args: [{ name: "amount"; type: "u64" }]
    },
  ]
  accounts: [
    {
      name: "coinAccount"
      type: {
        kind: "struct"
        fields: [
          { name: "balance"; type: "u64" },
          { name: "mint"; type: "publicKey" },
          { name: "bump"; type: "u8" },
          { name: "symbol"; type: "string" },
          { name: "name"; type: "string" },
          { name: "coinType"; type: "string" },
          { name: "currency"; type: "string" },
          { name: "uri"; type: "string" },
          { name: "image"; type: "string" },
          { name: "description"; type: "string" },
        ]
      }
    },
    {
      name: "treasury"
      type: {
        kind: "struct"
        fields: [
          { name: "bondAta"; type: "publicKey" },
          { name: "bondCoinMint"; type: "publicKey" },
          { name: "balance"; type: "u64" },
          { name: "bump"; type: "u8" },
        ]
      }
    },
  ]
  types: [
    {
      name: "InitCoinParams"
      type: {
        kind: "struct"
        fields: [
          { name: "name"; type: "string" },
          { name: "symbol"; type: "string" },
          { name: "uri"; type: "string" },
          { name: "decimals"; type: "u8" },
        ]
      }
    },
  ]
  errors: [
    { code: 6000; name: "InvalidQuantity"; msg: "Quantity must be greater than zero." },
    { code: 6001; name: "InvalidCalculation"; msg: "Token calculation resulted in zero tokens." },
    { code: 6002; name: "InsufficientFunds"; msg: "Insufficient funds in the PDA." },
    { code: 6003; name: "InvalidSymbol"; msg: "Invalid symbol." },
    { code: 6004; name: "SymbolTooLong"; msg: "Symbol must be 4 characters or less." },
    { code: 6005; name: "SymbolNotAlphanumeric"; msg: "Symbol must be alphanumeric." },
    { code: 6006; name: "InvalidCurrency"; msg: "Invalid currency." },
    { code: 6007; name: "InvalidImage"; msg: "Invalid image." },
    { code: 6008; name: "InvalidDescription"; msg: "Invalid description." },
    { code: 6009; name: "InvalidCoinType"; msg: "Invalid coin type." },
  ]
}

export const BasicIDL = {
  version: "0.1.0",
  name: "basic",
  instructions: [
    {
      name: "createToken",
      accounts: [
        {
          name: "metadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "coinAccount",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "InitCoinParams",
          },
        },
        {
          name: "currency",
          type: "string",
        },
        {
          name: "image",
          type: "string",
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "coinType",
          type: "string",
        },
      ],
    },
    {
      name: "initTreasury",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "treasuryPda",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bondAta",
          type: "publicKey",
        },
        {
          name: "bondCoinMint",
          type: "publicKey",
        },
      ],
    },
    {
      name: "tokensBurn",
      accounts: [
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feed",
          isMut: false,
          isSigner: false,
        },
        {
          name: "userStablecoinAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "coinAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treasury",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bondMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treasuryBondAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "coinAccountBondAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram2022",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "tokensMint",
      accounts: [
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "destination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "feed",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram2022",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "coinAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treasury",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bondMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treasuryBondAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "coinAccountBondAta",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "solAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "treasuryToTokenpda",
      accounts: [
        {
          name: "treasury",
          isMut: false,
          isSigner: false,
        },
        {
          name: "treasuryTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "recipientTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "token2022Program",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "coinAccount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "coinType",
            type: "string",
          },
          {
            name: "currency",
            type: "string",
          },
          {
            name: "uri",
            type: "string",
          },
          {
            name: "image",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
        ],
      },
    },
    {
      name: "treasury",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bondAta",
            type: "publicKey",
          },
          {
            name: "bondCoinMint",
            type: "publicKey",
          },
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "InitCoinParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "uri",
            type: "string",
          },
          {
            name: "decimals",
            type: "u8",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidQuantity",
      msg: "Quantity must be greater than zero.",
    },
    {
      code: 6001,
      name: "InvalidCalculation",
      msg: "Token calculation resulted in zero tokens.",
    },
    {
      code: 6002,
      name: "InsufficientFunds",
      msg: "Insufficient funds in the PDA.",
    },
    {
      code: 6003,
      name: "InvalidSymbol",
      msg: "Invalid symbol.",
    },
    {
      code: 6004,
      name: "SymbolTooLong",
      msg: "Symbol must be 4 characters or less.",
    },
    {
      code: 6005,
      name: "SymbolNotAlphanumeric",
      msg: "Symbol must be alphanumeric.",
    },
    {
      code: 6006,
      name: "InvalidCurrency",
      msg: "Invalid currency.",
    },
    {
      code: 6007,
      name: "InvalidImage",
      msg: "Invalid image.",
    },
    {
      code: 6008,
      name: "InvalidDescription",
      msg: "Invalid description.",
    },
    {
      code: 6009,
      name: "InvalidCoinType",
      msg: "Invalid coin type.",
    },
  ],
}

