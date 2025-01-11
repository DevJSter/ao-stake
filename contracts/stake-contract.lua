-- Constants
local Constants = {
  MIN_STAKE_AMOUNT = 1,         -- Minimum amount that can be staked
  REWARD_RATE = 0.1,           -- 10% APR
  REWARD_INTERVAL = 86400,     -- Calculate rewards daily (in seconds)
  TOKEN_A = "KmUZi7nCtvoNTm7G6-U3D0ntu_ZAz0MHfAstOjljSZU",      -- Replace with actual Token A contract ID
  TOKEN_B = "KmUZi7nCtvoNTm7G6-U3D0ntu_ZAz0MHfAstOjljSZU"       -- Replace with actual Token B contract ID
}

-- State initialization
if not ao.state then
  ao.state = {
    stakes = {},           -- Tracks active stakes by wallet
    totalStaked = 0,       -- Total amount of Token A staked
    lastRewardUpdate = 0,  -- Timestamp of last reward calculation
    rewardPool = 0         -- Available Token B for rewards
  }
end

-- Utility functions
local function calculateRewards(stakeAmount, timestamp, lastUpdate)
  local timeStaked = timestamp - lastUpdate
  local rewardAmount = (stakeAmount * Constants.REWARD_RATE * timeStaked) / (365 * 24 * 60 * 60)
  return rewardAmount
end

local function updateRewards(address)
  local stake = ao.state.stakes[address]
  if stake then
    local currentTime = os.time()
    local rewards = calculateRewards(stake.amount, currentTime, stake.lastUpdate)
    stake.pendingRewards = stake.pendingRewards + rewards
    stake.lastUpdate = currentTime
  end
end

-- Message Handlers
Handlers = {
  -- Initialize stake for a user
  stake = function(msg)
    local amount = tonumber(msg.amount)
    assert(amount >= Constants.MIN_STAKE_AMOUNT, "Stake amount too low")
    
    -- Verify Token A transfer
    assert(msg.tokenId == Constants.TOKEN_A, "Invalid token")
    
    -- Update or create stake
    if not ao.state.stakes[msg.from] then
      ao.state.stakes[msg.from] = {
        amount = amount,
        startTime = os.time(),
        lastUpdate = os.time(),
        pendingRewards = 0
      }
    else
      -- Update existing stake rewards before adding new stake
      updateRewards(msg.from)
      ao.state.stakes[msg.from].amount = ao.state.stakes[msg.from].amount + amount
    end
    
    ao.state.totalStaked = ao.state.totalStaked + amount
    return { success = true, message = "Stake added successfully" }
  end,
  
  -- Withdraw stake and claim rewards
  withdraw = function(msg)
    local stake = ao.state.stakes[msg.from]
    assert(stake, "No active stake found")
    
    -- Calculate final rewards
    updateRewards(msg.from)
    
    -- Prepare token transfers
    local transfers = {
      {
        token = Constants.TOKEN_A,
        amount = stake.amount,
        recipient = msg.from
      },
      {
        token = Constants.TOKEN_B,
        amount = stake.pendingRewards,
        recipient = msg.from
      }
    }
    
    -- Update state
    ao.state.totalStaked = ao.state.totalStaked - stake.amount
    ao.state.stakes[msg.from] = nil
    
    -- Send transfers
    for _, transfer in ipairs(transfers) do
      ao.send({
        action = "transfer",
        tokens = {{
          id = transfer.token,
          amount = transfer.amount
        }},
        recipient = transfer.recipient
      })
    end
    
    return { success = true, message = "Stake and rewards withdrawn" }
  end,
  
  -- View current stake and rewards
  view = function(msg)
    local stake = ao.state.stakes[msg.from]
    if not stake then
      return { staked = 0, rewards = 0 }
    end
    
    -- Calculate current rewards
    updateRewards(msg.from)
    
    return {
      staked = stake.amount,
      rewards = stake.pendingRewards,
      startTime = stake.startTime,
      lastUpdate = stake.lastUpdate
    }
  end,
  
  -- Admin function to add Token B to reward pool
  addRewards = function(msg)
    assert(msg.owner, "Unauthorized")
    assert(msg.tokenId == Constants.TOKEN_B, "Invalid reward token")
    
    ao.state.rewardPool = ao.state.rewardPool + msg.amount
    return { success = true, message = "Rewards added to pool" }
  end
}

-- Message router
function handle(msg)
  -- Validate message
  assert(type(msg) == "table", "Invalid message")
  assert(msg.action, "No action specified")
  
  -- Route to appropriate handler
  local handler = Handlers[msg.action]
  assert(handler, "Invalid action")
  
  -- Execute handler
  return handler(msg)
end