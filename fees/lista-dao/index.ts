import BigNumber from "bignumber.js";
import { FetchOptions, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import ADDRESSES from "../../helpers/coreAssets.json";

const treasury = "0x8d388136d578dCD791D081c6042284CED6d9B0c6";

/**
 * Fetches data from Lista DAO
 * @doc https://listaorg.notion.site/Profit-cfd754931df449eaa9a207e38d3e0a54
 * @test npx ts-node --transpile-only cli/testAdapter.ts fees lista-dao
 */

const ListaStakeManagerAddress = "0x1adB950d8bB3dA4bE104211D5AB038628e477fE6";
const HelioETHProvider = "0x0326c157bfF399e25dd684613aEF26DBb40D3BA4";
// const MasterVault = "0x986b40C2618fF295a49AC442c5ec40febB26CC54";
const SnBnbYieldConverterStrategy =
  "0x6F28FeC449dbd2056b76ac666350Af8773E03873";
const CeETHVault = "0xA230805C28121cc97B348f8209c79BEBEa3839C0";
const HayJoin = "0x4C798F81de7736620Cd8e6510158b1fE758e22F7";

// token
const slisBNB = "0xb0b84d294e0c75a6abe60171b70edeb2efd14a1b";
const eth = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const bnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const lisUSD = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";

const fetch = async (options: FetchOptions) => {
  const dailyFees = options.createBalances();

  const logs_reward = await options.getLogs({
    target: ListaStakeManagerAddress,
    eventAbi: "event RewardsCompounded(uint256 _amount)",
  });

  const logs_claim = await options.getLogs({
    target: HelioETHProvider,
    eventAbi: "event Claim(address recipient, uint256 amount)",
    entireLog: true,
  });

  //   const logs_fees_claim = await options.getLogs({
  //     target: MasterVault,
  //     eventAbi: "event FeeClaimed(address receiver, uint256 amount)",
  //   });

  const logs_fees_harvested = await options.getLogs({
    target: SnBnbYieldConverterStrategy,
    eventAbi: "event Harvested(address to, uint256 amount)",
  });

  const logs_transfer = await options.getLogs({
    target: eth,
    topics: [
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "0x000000000000000000000000a230805c28121cc97b348f8209c79bebea3839c0",
      "0x0000000000000000000000008d388136d578dcd791d081c6042284ced6d9b0c6",
    ],
  });

  const logs_exit = await options.getLogs({
    target: HayJoin,
    topics: [
      "0x22d324652c93739755cf4581508b60875ebdd78c20c0cff5cf8e23452b299631",
      "0x0000000000000000000000008d388136d578dcd791d081c6042284ced6d9b0c6",
    ],
  });

  logs_reward.forEach((log) => {
    const amount = log._amount;
    dailyFees.add(slisBNB, amount);
  });

  logs_claim.forEach((log) => {
    const amount = Number(log.data);
    dailyFees.add(eth, amount);
  });

  //   logs_fees_claim.forEach((log) => {
  //     const amount = log.amount;
  //     dailyFees.add(bnb, amount);
  //   });

  logs_fees_harvested.forEach((log) => {
    const amount = log.amount;
    dailyFees.add(slisBNB, amount);
  });

  logs_transfer.forEach((log) => {
    const amount = Number(log.data);
    dailyFees.add(eth, amount);
  });

  logs_exit.forEach((log) => {
    dailyFees.add(lisUSD, Number(log.data));
  });

  return {
    dailyFees,
    dailyRevenue: dailyFees,
  };
};

const adapter: SimpleAdapter = {
  version: 2,
  adapter: {
    [CHAIN.BSC]: {
      fetch,
      start: 1693361953,
    },
  },
};

export default adapter;
