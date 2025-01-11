-- Test Token A Contract
local function createTokenA()
  return {
    name = "Test Token A",
    ticker = "TSTA",
    supply = 1000000
  }
end

-- Test Token B Contract
local function createTokenB()
  return {
    name = "Test Token B",
    ticker = "TSTB",
    supply = 1000000
  }
end

-- Deploy using:
-- aos create ./tokenA.lua --scheduler scheduler-tag
-- aos create ./tokenB.lua --scheduler scheduler-tag