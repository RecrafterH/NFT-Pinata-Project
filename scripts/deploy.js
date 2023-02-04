const { ethers } = require("hardhat");
const {
  storeTokenUriMetadata,
  storeImages,
} = require("../utils/uploadToPinata");
require("dotenv").config();

const imageLocation = "./images";

let tokenUri = ["ipfs://QmbR8HXAz6wZ7kWCrp55ahoBGrUaNr6qycR1B7Zh8LwcRg"];

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Dangerous",
      value: 100,
      weapon: "Lasereyes",
    },
  ],
};

const main = async () => {
  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUri = await handleTokenUris();
  }
  let puppyUri = tokenUri[0];
  console.log(puppyUri);
  const PuppyContract = await ethers.getContractFactory("PuppyNft");
  const puppyContract = await PuppyContract.deploy(puppyUri);
  await puppyContract.deployed();
  console.log("Contract deployed at: ", puppyContract.address);
};

const handleTokenUris = async () => {
  tokenUri = [];

  const { responses: imageUploadResponses, files } = await storeImages(
    imageLocation
  );
  //console.log(imageUploadResponses);
  for (imageUploadResponseIndex in imageUploadResponses) {
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An dangerous ${tokenUriMetadata.name} killer`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetadata.name}...`);
    const metadataUploadResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );
    tokenUri.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs Uploaded! They are:");
  console.log(tokenUri);
  return tokenUri;
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
