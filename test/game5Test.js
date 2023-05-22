const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { assert } = require('chai');
const { utils } = require("ethers");

describe('Game5', function () {
  async function deployContractAndSetVariables() {
    const Game = await ethers.getContractFactory('Game5');
    const game = await Game.deploy();

    return { game };
  }
  it('should be a winner', async function () {
    const { game } = await loadFixture(deployContractAndSetVariables);
    const signer0 = ethers.provider.getSigner(0);

    console.log("Signer0 balance: ", await signer0.getBalance());

    const data = await ethers.provider.getStorageAt(game.address, 0);
    const stripped = utils.hexStripZeros(data).slice(0, -2);
    const padded = utils.hexZeroPad(stripped, 20);
    const threshold = padded;

    let signer = signer0;
    let address = await signer.getAddress();
    console.log(threshold, address, address < threshold);

    let i = 0;
    while(threshold <= address) {
        i++;
        signer = i < 20
            ? ethers.provider.getSigner(i)
            : ethers.Wallet.createRandom().connect(ethers.provider);
        address = await signer.getAddress();
        console.log(i, threshold, address, address < threshold);
    }

    console.log("Address found: ", address);
    console.log("Sending funds...");

    const result = await signer0.sendTransaction({
        from: await signer0.getAddress(),
        to: address,
        value: ethers.utils.parseEther("1")
    });

    // console.log("Funding result: ", result);

    await game.connect(signer).win();

    // leave this assertion as-is
    assert(await game.isWon(), 'You did not win the game');
  });
});
