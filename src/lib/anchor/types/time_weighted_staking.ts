import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

export type TimeWeightedStaking = {
  version: "0.1.0"
  name: "time_weighted_staking"
  accounts: [
    {
      name: "stakingPool"
      type: {
        kind: "struct"
        fields: [
          {
            name: "authority"
            type: "publicKey"
          },
          {
            name: "stakeTokenMint"
            type: "publicKey"
          },
          {
            name: "tokenVault"
            type: "publicKey"
          },
          {
            name: "totalStaked"
            type: "u64"
          },
          {
            name: "totalWeightedStake"
            type: "u64"
          },
          {
            name: "distributionStartTime"
            type: "i64"
          },
          {
            name: "distributionEndTime"
            type: "i64"
          },
          {
            name: "lastUpdateTime"
            type: "i64"
          },
          {
            name: "isPaused"
            type: "bool"
          },
          {
            name: "isDistributionActive"
            type: "bool"
          },
          {
            name: "bump"
            type: "u8"
          },
          {
            name: "vaultBump"
            type: "u8"
          }
        ]
      }
    },
    {
      name: "userStake"
      type: {
        kind: "struct"
        fields: [
          {
            name: "user"
            type: "publicKey"
          },
          {
            name: "stakingPool"
            type: "publicKey"
          },
          {
            name: "amount"
            type: "u64"
          },
          {
            name: "weightedStake"
            type: "u64"
          },
          {
            name: "stakeTime"
            type: "i64"
          },
          {
            name: "lastRewardCalculationTime"
            type: "i64"
          },
          {
            name: "accumulatedSolRewards"
            type: "u64"
          },
          {
            name: "sequenceNumber"
            type: "u64"
          },
          {
            name: "isActive"
            type: "bool"
          },
          {
            name: "bump"
            type: "u8"
          }
        ]
      }
    }
  ]
  instructions: [
    {
      name: "initializePool"
      accounts: [
        {
          name: "stakingPool"
          isMut: true
          isSigner: false
        },
        {
          name: "poolTokenVault"
          isMut: true
          isSigner: false
        },
        {
          name: "stakeTokenMint"
          isMut: false
          isSigner: false
        },
        {
          name: "payer"
          isMut: true
          isSigner: true
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "rent"
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: "authority"
          type: "publicKey"
        },
        {
          name: "bump"
          type: "u8"
        },
        {
          name: "vaultBump"
          type: "u8"
        }
      ]
    },
    {
      name: "stake"
      accounts: [
        {
          name: "stakingPool"
          isMut: true
          isSigner: false
        },
        {
          name: "userStake"
          isMut: true
          isSigner: false
        },
        {
          name: "poolTokenVault"
          isMut: true
          isSigner: false
        },
        {
          name: "userTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "user"
          isMut: true
          isSigner: true
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: "amount"
          type: "u64"
        }
      ]
    },
    {
      name: "unstake"
      accounts: [
        {
          name: "stakingPool"
          isMut: true
          isSigner: false
        },
        {
          name: "userStake"
          isMut: true
          isSigner: false
        },
        {
          name: "poolTokenVault"
          isMut: true
          isSigner: false
        },
        {
          name: "userTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "user"
          isMut: true
          isSigner: true
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: "amount"
          type: "u64"
        }
      ]
    },
    {
      name: "claimSolRewards"
      accounts: [
        {
          name: "stakingPool"
          isMut: true
          isSigner: false
        },
        {
          name: "userStake"
          isMut: true
          isSigner: false
        },
        {
          name: "user"
          isMut: true
          isSigner: true
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: "updateWeightedStake"
      accounts: [
        {
          name: "stakingPool"
          isMut: true
          isSigner: false
        },
        {
          name: "userStake"
          isMut: true
          isSigner: false
        }
      ]
      args: []
    }
  ]
  errors: [
    {
      code: 6000
      name: "Unauthorized"
      msg: "Unauthorized access"
    },
    {
      code: 6001
      name: "InsufficientBalance"
      msg: "Insufficient balance"
    },
    {
      code: 6002
      name: "InvalidAmount"
      msg: "Invalid amount"
    },
    {
      code: 6003
      name: "PoolNotActive"
      msg: "Staking pool is not active"
    },
    {
      code: 6004
      name: "AlreadyStaked"
      msg: "User already has an active stake"
    },
    {
      code: 6005
      name: "NoActiveStake"
      msg: "User has no active stake"
    },
    {
      code: 6006
      name: "StakeTooSmall"
      msg: "Stake amount is too small"
    },
    {
      code: 6007
      name: "PoolPaused"
      msg: "Staking pool is paused"
    },
    {
      code: 6008
      name: "InvalidTimestamp"
      msg: "Invalid timestamp"
    },
    {
      code: 6009
      name: "MathOverflow"
      msg: "Mathematical operation overflow"
    },
    {
      code: 6010
      name: "DistributionNotActive"
      msg: "Distribution is not active"
    },
    {
      code: 6011
      name: "DistributionEnded"
      msg: "Distribution has ended"
    },
    {
      code: 6012
      name: "InvalidSequenceNumber"
      msg: "Invalid sequence number"
    },
    {
      code: 6013
      name: "ReplayAttack"
      msg: "Potential replay attack detected"
    },
    {
      code: 6014
      name: "MaxStakeExceeded"
      msg: "Maximum stake amount exceeded"
    },
    {
      code: 6015
      name: "InvalidUnstakeFee"
      msg: "Invalid unstake fee"
    },
    {
      code: 6016
      name: "MinLockPeriodNotMet"
      msg: "Minimum lock period not met"
    },
    {
      code: 6017
      name: "NoRewardsAvailable"
      msg: "No rewards available to claim"
    },
    {
      code: 6018
      name: "InvalidStakeState"
      msg: "Invalid stake state"
    },
    {
      code: 6019
      name: "AccountAlreadyInitialized"
      msg: "Account already initialized"
    },
    {
      code: 6020
      name: "AccountNotInitialized"
      msg: "Account not initialized"
    },
    {
      code: 6021
      name: "TokenTransferFailed"
      msg: "Token transfer failed"
    }
  ]
}

// Export individual types for convenience
export interface StakingPoolAccount {
  authority: PublicKey
  stakeTokenMint: PublicKey
  tokenVault: PublicKey
  totalStaked: BN
  totalWeightedStake: BN
  distributionStartTime: BN
  distributionEndTime: BN
  lastUpdateTime: BN
  isPaused: boolean
  isDistributionActive: boolean
  bump: number
  vaultBump: number
}

export interface UserStakeAccount {
  user: PublicKey
  stakingPool: PublicKey
  amount: BN
  weightedStake: BN
  stakeTime: BN
  lastRewardCalculationTime: BN
  accumulatedSolRewards: BN
  sequenceNumber: BN
  isActive: boolean
  bump: number
} 