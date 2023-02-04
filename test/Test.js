const { expect } = require("chai");
const { parseEther, formatEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
describe("unit tests", () => {
  let PuppyNftContract, puppyNftContract;
  beforeEach(async () => {
    PuppyNftContract = await ethers.getContractFactory("PuppyNft");
    puppyNftContract = await PuppyNftContract.deploy(
      "ipfs://QmbR8HXAz6wZ7kWCrp55ahoBGrUaNr6qycR1B7Zh8LwcRg"
    );
    await puppyNftContract.deployed();
  });
  describe("constructor", () => {
    it("Sets the starting values correctly", async () => {
      const uri = await puppyNftContract.getTokenUri();
      await expect(uri).to.equal(
        "ipfs://QmbR8HXAz6wZ7kWCrp55ahoBGrUaNr6qycR1B7Zh8LwcRg"
      );
    });
  });
  describe("RequestNft", async () => {
    it("Will revert if the payment isn't send with the transaction", async () => {
      await expect(puppyNftContract.requestNft()).to.be.revertedWithCustomError(
        puppyNftContract,
        "PuppyNft__NeedMoreEthSent"
      );
    });
    it("Will revert if the user won't send enough eth", async () => {
      await expect(
        puppyNftContract.requestNft({ value: parseEther("0.09") })
      ).to.be.revertedWithCustomError(
        puppyNftContract,
        "PuppyNft__NeedMoreEthSent"
      );
    });
    it("Will emit an event if the user minted a Nft", async () => {
      await expect(
        puppyNftContract.requestNft({ value: parseEther("0.1") })
      ).to.emit(puppyNftContract, "NFTMinted");
    });
    it("Will revert if someone tries to request a Nft after the totalSupply is reached", async () => {
      let number = await puppyNftContract.getTotalSupply();
      number = Number(number);
      for (let i = 0; i < number; i++) {
        await puppyNftContract.requestNft({ value: parseEther("0.1") });
      }
      await expect(
        puppyNftContract.requestNft({ value: parseEther("0.1") })
      ).to.be.revertedWithCustomError(
        puppyNftContract,
        "PuppyNft__TotalSupplyReached"
      );
    });
  });
  describe("ERC721 functions", () => {
    it("Shows the owner of an NFT", async () => {
      const [owner, user1] = await ethers.getSigners();
      await puppyNftContract
        .connect(user1)
        .requestNft({ value: parseEther("0.1") });
      const tokenOwner = await puppyNftContract.ownerOf(1);
      await expect(tokenOwner).to.equal(user1.address);
    });
    it("Transfers the token", async () => {
      const [owner, user1] = await ethers.getSigners();
      await puppyNftContract
        .connect(user1)
        .requestNft({ value: parseEther("0.1") });
      await puppyNftContract
        .connect(user1)
        .transferFrom(user1.address, owner.address, 1);
      const tokenOwner = await puppyNftContract.ownerOf(1);
      await expect(tokenOwner).to.equal(owner.address);
    });
  });
  describe("Getter functions", () => {
    it("Lets us get the Mint Fee", async () => {
      let fee = await puppyNftContract.getMintFee();
      fee = formatEther(fee.toString());
      await expect(fee.toString()).to.equal("0.1");
    });
    it("Lets us get the token count", async () => {
      await puppyNftContract.requestNft({ value: parseEther("1") });
      const tokenCount = await puppyNftContract.getTokenCounter();
      await expect(tokenCount.toString()).to.equal("2");
    });
  });
});
