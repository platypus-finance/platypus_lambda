const multicall = require("ethers-multicall");
const { utils, providers, constants } = require("ethers");
const ERC20_ABI = require("./abis/ERC20.json");
const MASTERCHEFJOEV3_ABI = require("./abis/MasterChefJoeV3.json");
const VEPTP_ABI = require("./abis/VePtpV3.json");
const vestingData = require("./vesting.json");
const { getMulticallContract } = require("./utils.js");

// AVAX network
const AVAX_RPC_PROVIDER = "https://api.avax.network/ext/bc/C/rpc";
const AVAX_CHAINID = "0xa86a";
const MASTERJOE_ADDRESS = "0x188bed1968b795d5c9022f6a0bb5931ac4c18f00";
const TREASURY_MULTISIG_ADDRESS = "0x068e297e8FF74115C9E1C4b5B83B700FdA5aFdEB";
const MASTERJOE_AVAX_PTP_POOL2_PID = 28;

// PTP
const PTP_TOTAL_SUPPLY = "300000000";
const PTP_ADDRESS = "0x22d4002028f537599bE9f666d1c4Fa138522f9c8";
const AVAX_PTP_JLP_ADDRESS = "0xCDFD91eEa657cc2701117fe9711C9a4F61FEED23";
const VEPTP_ADDRESS = "0x5857019c749147EEE22b1Fe63500F237F3c1B692";
const PTP_DECIMALS = 18;

// Addresses that hold non-circulating PTP
const LOCKED_ADDRESS = [
  "0xD2805cff8877235d9EC88F683F85A8213DC288BC", // liquidity mining
  "0xe9a4cf46dad66ab72f1eb516a95c99f8baf17e94", // treasury vesting
  TREASURY_MULTISIG_ADDRESS, // treausry multisig
  "0x51208420eaba25b787008ee856665b2f4c5ed818", // Avalaunch IDO
  "0x364996dc358926b9A86b1Ed601A33d5915fC86C8", // JLP double reward
  "0x68c5f4374228beedfa078e77b5ed93c28a2f713e", // MasterPlatypus V2
  "0x1f6B6b505D199B9bd0a6642B8d44533a811598da", // Voter address
  "0xc4Cf4996Ee374591D60FA80BcDfBF2F25CDE7CBe", // old multisig address
  /** @todo add PNG double reward */
];

const masterJoeContract = getMulticallContract(
  MASTERJOE_ADDRESS,
  MASTERCHEFJOEV3_ABI
);
const avaxPtpJlpContract = getMulticallContract(
  AVAX_PTP_JLP_ADDRESS,
  ERC20_ABI
);
const ptpContract = getMulticallContract(PTP_ADDRESS, ERC20_ABI);

const vePtpContract = getMulticallContract(VEPTP_ADDRESS, VEPTP_ABI);

const avaxMulticallProvider = new multicall.Provider(
  new providers.StaticJsonRpcProvider(AVAX_RPC_PROVIDER),
  parseInt(AVAX_CHAINID, 16)
);

const circulatingSupply = async (event, context, callback) => {
  const calls = [];
  // calls: indices 0,1,2 are for calculating PTP amount in AVAX-PTP pool owned by POL.
  // calls: indices 3 and so on, are all the locked PTP amount.
  calls.push(
    masterJoeContract.userInfo(
      MASTERJOE_AVAX_PTP_POOL2_PID,
      TREASURY_MULTISIG_ADDRESS
    ),
    avaxPtpJlpContract.totalSupply(),
    ptpContract.balanceOf(AVAX_PTP_JLP_ADDRESS),
    vePtpContract.totalLockedPtp()
  );

  // PTP balance of locked addresses and vested addresses
  const vestedAddresses = vestingData.map((vesting) => vesting[0]);
  const allLockedAddresses = LOCKED_ADDRESS.concat(vestedAddresses);

  allLockedAddresses.forEach((address) =>
    calls.push(ptpContract.balanceOf(address))
  );

  // multicall
  const multicallResults = await avaxMulticallProvider.all(calls);

  // first 3 results are for calculations of avax-ptp in POL
  const userInfo = multicallResults[0];
  const jlpSupply = multicallResults[1];
  const ptpAmountInPool2 = multicallResults[2];

  let lockedPtpAmount = constants.Zero;
  for (let index = 3; index < multicallResults.length; index++) {
    lockedPtpAmount = lockedPtpAmount.add(multicallResults[index]);
  }

  const jlpShareRatioWad = userInfo.amount
    .mul(utils.parseEther("1"))
    .div(jlpSupply);

  const ptpOwnedByPolInPool2 = ptpAmountInPool2
    .mul(jlpShareRatioWad)
    .div(utils.parseEther("1"));

  lockedPtpAmount = lockedPtpAmount.add(ptpOwnedByPolInPool2);

  const lockedPtpAmountWad = utils.parseEther(
    utils.formatUnits(lockedPtpAmount, PTP_DECIMALS)
  );

  // Formula: circulating = total supply - locked Ptp Amount
  const totalSupplyWad = utils.parseEther(PTP_TOTAL_SUPPLY);
  const circulatingWad = totalSupplyWad.sub(lockedPtpAmountWad);
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

circulatingSupply("", "", console.log);

module.exports.circulatingSupply = circulatingSupply;
