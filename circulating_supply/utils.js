const multicall = require("ethers-multicall");

/**
 * @param {string} contractAddress
 * @param {Object} contractAbi
 * @returns a contract object used for multicall, i.e. remove all the non-view functions in the ABI
 */
const getMulticallContract = (contractAddress, contractAbi) =>
  new multicall.Contract(
    contractAddress,
    contractAbi.filter((item) => item.type === "function")
  );

/**
 * @param {*} t
 * @param {*} start
 * @param {*} duration
 * @param {*} cliff
 * @param {*} end
 * @param {*} totalBalance
 * @returns the vested amount, i.e. released + releasable amount from the vesting contract
 */
const vestedAmount = (t, start, duration, cliff, end, totalBalance) => {
  if (t < cliff) {
    return 0;
  } else if (t > end) {
    return totalBalance;
  } else {
    return (totalBalance * (t - cliff)) / (duration - (cliff - start));
  }
};

module.exports = { getMulticallContract, vestedAmount };
