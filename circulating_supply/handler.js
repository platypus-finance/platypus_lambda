const multicall = require("ethers-multicall");
const { utils, providers, constants } = require("ethers");
const ERC20_ABI = require("./abis/ERC20.json");
const vestingData = require("./vesting.json");

// AVAX network
const AVAX_RPC_PROVIDER = "https://api.avax.network/ext/bc/C/rpc";
const AVAX_CHAINID = "0xa86a";

// PTP
const PTP_TOTAL_SUPPLY = "300000000";
const PTP_ADDRESS = "0x22d4002028f537599bE9f666d1c4Fa138522f9c8";
const PTP_DECIMALS = 18;
// Addresses that hold non-circulating PTP
const LOCKED_ADDRESS = [
  "0xD2805cff8877235d9EC88F683F85A8213DC288BC", // liquidity mining
  "0xe9a4cf46dad66ab72f1eb516a95c99f8baf17e94", // treasury vesting
  "0x068e297e8FF74115C9E1C4b5B83B700FdA5aFdEB", // treausry multisig
  "0x51208420eaba25b787008ee856665b2f4c5ed818", // Avalaunch IDO
  "0x364996dc358926b9A86b1Ed601A33d5915fC86C8", // JLP double reward
  "0x68c5f4374228beedfa078e77b5ed93c28a2f713e", // MasterPlatypus V2
  /** @todo add PNG double reward */
];

const vestedAmount = (t, start, duration, cliff, end, totalBalance) => {
  if (t < cliff) {
    return 0;
  } else if (t > end) {
    return totalBalance;
  } else {
    return (totalBalance * (t - cliff)) / (duration - (cliff - start));
  }
};

const circulatingSupply = async (event, context, callback) => {
  const avaxMulticallProvider = new multicall.Provider(
    new providers.StaticJsonRpcProvider(AVAX_RPC_PROVIDER),
    parseInt(AVAX_CHAINID, 16)
  );

  const ptpContract = new multicall.Contract(
    PTP_ADDRESS,
    ERC20_ABI.filter((item) => item.type === "function")
  );

  // PTP balance of locked addresses
  const calls = LOCKED_ADDRESS.map((address) => ptpContract.balanceOf(address));
  const lockedAddressesBalances = await avaxMulticallProvider.all(calls);
  const lockedAddressesSum = lockedAddressesBalances.reduce(
    (prev, bal) => bal.add(prev),
    constants.Zero
  );
  const lockedSumStr = utils.formatUnits(lockedAddressesSum, PTP_DECIMALS);

  // Vested amount of the vesting contracts
  const currentTime = String(Math.round(new Date().getTime() / 1000));
  let vestingAmount = 0;
  for (const vesting of vestingData) {
    // "contract_address","start","duration","cliff","end","total_amount","revoked"]
    const start = vesting[1];
    const duration = vesting[2];
    const cliff = vesting[3];
    const end = vesting[4];
    const totalAmount = vesting[5];
    vestingAmount +=
      totalAmount -
      vestedAmount(currentTime, start, duration, cliff, end, totalAmount);
  }
  const vestingAmountStr = String(Math.round(vestingAmount));

  // Formula: circulating = total supply - lockedAddressesSum - vestingAmount
  const totalSupplyWad = utils.parseEther(PTP_TOTAL_SUPPLY);
  const lockedSumWad = utils.parseEther(lockedSumStr);
  const vestingAmountWad = utils.parseEther(vestingAmountStr);

  const circulatingWad = totalSupplyWad.sub(lockedSumWad).sub(vestingAmountWad);
  const circulatingStr = utils.formatEther(circulatingWad);

  const response = {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: circulatingStr,
  };

  callback(null, response);
};

// circulatingSupply("", "", console.log);

module.exports.circulatingSupply = circulatingSupply;
