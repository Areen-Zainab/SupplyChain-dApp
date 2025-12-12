const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AreenZainab Supply Chain Management", function () {
  let contract;
  let owner;
  let manufacturer;
  let distributor;
  let retailer;
  let customer;
  let addr1;

  beforeEach(async function () {
    // Get test accounts
    [owner, manufacturer, distributor, retailer, customer, addr1] = await ethers.getSigners();
    
    // Deploy contract
    const SupplyChain = await ethers.getContractFactory("AreenZainab_supplychain");
    contract = await SupplyChain.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should register owner by default", async function () {
      const isRegistered = await contract.isUserRegistered(owner.address);
      expect(isRegistered).to.equal(true);
    });
  });

  describe("User Registration", function () {
    it("Should allow users to request registration", async function () {
      await contract.connect(manufacturer).requestRegistration(1, "Test Manufacturer");
      
      const request = await contract.getRegistrationRequest(manufacturer.address);
      expect(request[1]).to.equal(1); // Role.Manufacturer
      expect(request[2]).to.equal("Test Manufacturer");
      expect(request[3]).to.equal(true); // isPending
    });

    it("Should not allow registration with invalid role", async function () {
      await expect(
        contract.connect(manufacturer).requestRegistration(0, "Test")
      ).to.be.revertedWith("Invalid role");
    });

    it("Should not allow duplicate registration requests", async function () {
      await contract.connect(manufacturer).requestRegistration(1, "Test Manufacturer");
      
      await expect(
        contract.connect(manufacturer).requestRegistration(1, "Test Manufacturer")
      ).to.be.revertedWith("Request already pending");
    });

    it("Should allow owner to approve registration", async function () {
      await contract.connect(manufacturer).requestRegistration(1, "Test Manufacturer");
      await contract.approveRequest(manufacturer.address);
      
      const isRegistered = await contract.isUserRegistered(manufacturer.address);
      expect(isRegistered).to.equal(true);
      
      const role = await contract.getUserRole(manufacturer.address);
      expect(role).to.equal(1); // Role.Manufacturer
    });

    it("Should allow owner to reject registration", async function () {
      await contract.connect(manufacturer).requestRegistration(1, "Test Manufacturer");
      await contract.rejectRequest(manufacturer.address);
      
      const request = await contract.getRegistrationRequest(manufacturer.address);
      expect(request[3]).to.equal(false); // isPending should be false
    });

    it("Should allow owner to directly register users", async function () {
      await contract.registerUser(manufacturer.address, 1, "Direct Manufacturer");
      
      const isRegistered = await contract.isUserRegistered(manufacturer.address);
      expect(isRegistered).to.equal(true);
      
      const user = await contract.getUser(manufacturer.address);
      expect(user[3]).to.equal("Direct Manufacturer");
    });

    it("Should not allow non-owner to approve requests", async function () {
      await contract.connect(manufacturer).requestRegistration(1, "Test Manufacturer");
      
      await expect(
        contract.connect(addr1).approveRequest(manufacturer.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });
  });

  describe("Product Management", function () {
    beforeEach(async function () {
      // Register manufacturer
      await contract.registerUser(manufacturer.address, 1, "Test Manufacturer");
    });

    it("Should allow manufacturer to register product", async function () {
      await contract.connect(manufacturer).registerProduct("Product 1", "Test Description");
      
      const product = await contract.getProduct(1);
      expect(product[0]).to.equal(1); // productId
      expect(product[1]).to.equal("Product 1"); // name
      expect(product[2]).to.equal("Test Description"); // description
      expect(product[3]).to.equal(manufacturer.address); // currentOwner
      expect(product[4]).to.equal(manufacturer.address); // manufacturer
      expect(product[5]).to.equal(0); // status: Manufactured
    });

    it("Should not allow non-manufacturer to register product", async function () {
      await contract.registerUser(distributor.address, 2, "Test Distributor");
      
      await expect(
        contract.connect(distributor).registerProduct("Product 1", "Description")
      ).to.be.revertedWith("Unauthorized role");
    });

    it("Should not allow unregistered user to register product", async function () {
      await expect(
        contract.connect(addr1).registerProduct("Product 1", "Description")
      ).to.be.revertedWith("User not registered");
    });

    it("Should increment product counter", async function () {
      await contract.connect(manufacturer).registerProduct("Product 1", "Description 1");
      await contract.connect(manufacturer).registerProduct("Product 2", "Description 2");
      
      const totalProducts = await contract.getTotalProducts();
      expect(totalProducts).to.equal(2);
    });

    it("Should create initial history entry on product registration", async function () {
      await contract.connect(manufacturer).registerProduct("Product 1", "Description");
      
      const history = await contract.getProductHistory(1);
      expect(history.length).to.equal(1);
      expect(history[0][1]).to.equal(manufacturer.address); // to
      expect(history[0][4]).to.equal("Product manufactured"); // notes
    });
  });

  describe("Product Transfer", function () {
    beforeEach(async function () {
      // Register all roles
      await contract.registerUser(manufacturer.address, 1, "Manufacturer");
      await contract.registerUser(distributor.address, 2, "Distributor");
      await contract.registerUser(retailer.address, 3, "Retailer");
      await contract.registerUser(customer.address, 4, "Customer");
      
      // Register a product
      await contract.connect(manufacturer).registerProduct("Product 1", "Test Product");
    });

    it("Should allow manufacturer to transfer to distributor", async function () {
      await contract.connect(manufacturer).transferProduct(
        1,
        distributor.address,
        1, // InTransit
        "Shipped to distributor"
      );
      
      const product = await contract.getProduct(1);
      expect(product[3]).to.equal(distributor.address); // currentOwner
      expect(product[5]).to.equal(1); // status: InTransit
    });

    it("Should allow distributor to transfer to retailer", async function () {
      // First transfer to distributor
      await contract.connect(manufacturer).transferProduct(
        1,
        distributor.address,
        1,
        "To distributor"
      );
      
      // Then transfer to retailer
      await contract.connect(distributor).transferProduct(
        1,
        retailer.address,
        2, // Delivered
        "Delivered to retailer"
      );
      
      const product = await contract.getProduct(1);
      expect(product[3]).to.equal(retailer.address);
      expect(product[5]).to.equal(2); // status: Delivered
    });

    it("Should allow retailer to transfer to customer", async function () {
      // Transfer through the chain
      await contract.connect(manufacturer).transferProduct(1, distributor.address, 1, "To dist");
      await contract.connect(distributor).transferProduct(1, retailer.address, 2, "To retail");
      await contract.connect(retailer).transferProduct(1, customer.address, 3, "Sold");
      
      const product = await contract.getProduct(1);
      expect(product[3]).to.equal(customer.address);
      expect(product[5]).to.equal(3); // status: Sold
    });

    it("Should not allow invalid role transition", async function () {
      await expect(
        contract.connect(manufacturer).transferProduct(
          1,
          retailer.address, // Skip distributor
          1,
          "Invalid transfer"
        )
      ).to.be.revertedWith("Invalid role transition");
    });

    it("Should not allow invalid status transition", async function () {
      await expect(
        contract.connect(manufacturer).transferProduct(
          1,
          distributor.address,
          3, // Sold - invalid from Manufactured
          "Invalid status"
        )
      ).to.be.revertedWith("Invalid status transition");
    });

    it("Should not allow non-owner to transfer", async function () {
      await expect(
        contract.connect(distributor).transferProduct(
          1,
          retailer.address,
          1,
          "Unauthorized transfer"
        )
      ).to.be.revertedWith("Not the current owner");
    });

    it("Should not allow transfer to unregistered user", async function () {
      await expect(
        contract.connect(manufacturer).transferProduct(
          1,
          addr1.address,
          1,
          "To unregistered"
        )
      ).to.be.revertedWith("Recipient not registered");
    });

    it("Should maintain complete transfer history", async function () {
      await contract.connect(manufacturer).transferProduct(1, distributor.address, 1, "Transfer 1");
      await contract.connect(distributor).transferProduct(1, retailer.address, 2, "Transfer 2");
      
      const history = await contract.getProductHistory(1);
      expect(history.length).to.equal(3); // Initial + 2 transfers
      
      // Check second transfer
      expect(history[1][0]).to.equal(manufacturer.address); // from
      expect(history[1][1]).to.equal(distributor.address); // to
      expect(history[1][4]).to.equal("Transfer 1"); // notes
      
      // Check third transfer
      expect(history[2][0]).to.equal(distributor.address); // from
      expect(history[2][1]).to.equal(retailer.address); // to
      expect(history[2][4]).to.equal("Transfer 2"); // notes
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.registerUser(manufacturer.address, 1, "Manufacturer");
      await contract.connect(manufacturer).registerProduct("Product 1", "Description 1");
      await contract.connect(manufacturer).registerProduct("Product 2", "Description 2");
    });

    it("Should return correct total products", async function () {
      const total = await contract.getTotalProducts();
      expect(total).to.equal(2);
    });

    it("Should return pending request addresses", async function () {
      await contract.connect(distributor).requestRegistration(2, "Distributor");
      await contract.connect(retailer).requestRegistration(3, "Retailer");
      
      const pending = await contract.getPendingRequestAddresses();
      expect(pending.length).to.equal(2);
      expect(pending).to.include(distributor.address);
      expect(pending).to.include(retailer.address);
    });

    it("Should return user details", async function () {
      const user = await contract.getUser(manufacturer.address);
      expect(user[0]).to.equal(manufacturer.address); // userAddress
      expect(user[1]).to.equal(1); // role: Manufacturer
      expect(user[2]).to.equal(true); // isRegistered
      expect(user[3]).to.equal("Manufacturer"); // name
    });

    it("Should check if user is registered", async function () {
      const registered = await contract.isUserRegistered(manufacturer.address);
      expect(registered).to.equal(true);
      
      const notRegistered = await contract.isUserRegistered(addr1.address);
      expect(notRegistered).to.equal(false);
    });
  });

  describe("Events", function () {
    it("Should emit RegistrationRequested event", async function () {
      await expect(
        contract.connect(manufacturer).requestRegistration(1, "Manufacturer")
      ).to.emit(contract, "RegistrationRequested")
        .withArgs(manufacturer.address, 1, "Manufacturer");
    });

    it("Should emit RegistrationApproved event", async function () {
      await contract.connect(manufacturer).requestRegistration(1, "Manufacturer");
      
      await expect(
        contract.approveRequest(manufacturer.address)
      ).to.emit(contract, "RegistrationApproved")
        .withArgs(manufacturer.address, 1);
    });

    it("Should emit ProductRegistered event", async function () {
      await contract.registerUser(manufacturer.address, 1, "Manufacturer");
      
      await expect(
        contract.connect(manufacturer).registerProduct("Product 1", "Description")
      ).to.emit(contract, "ProductRegistered")
        .withArgs(1, "Product 1", manufacturer.address);
    });

    it("Should emit ProductTransferred event", async function () {
      await contract.registerUser(manufacturer.address, 1, "Manufacturer");
      await contract.registerUser(distributor.address, 2, "Distributor");
      await contract.connect(manufacturer).registerProduct("Product 1", "Description");
      
      await expect(
        contract.connect(manufacturer).transferProduct(1, distributor.address, 1, "Transfer")
      ).to.emit(contract, "ProductTransferred")
        .withArgs(1, manufacturer.address, distributor.address, 1);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle product with non-existent ID", async function () {
      await expect(
        contract.getProduct(999)
      ).to.be.revertedWith("Product does not exist");
    });

    it("Should handle empty product name", async function () {
      await contract.registerUser(manufacturer.address, 1, "Manufacturer");
      
      await expect(
        contract.connect(manufacturer).registerProduct("", "Description")
      ).to.be.revertedWith("Product name cannot be empty");
    });

    it("Should handle empty description", async function () {
      await contract.registerUser(manufacturer.address, 1, "Manufacturer");
      
      await expect(
        contract.connect(manufacturer).registerProduct("Product", "")
      ).to.be.revertedWith("Description cannot be empty");
    });

    it("Should handle empty user name in registration", async function () {
      await expect(
        contract.connect(manufacturer).requestRegistration(1, "")
      ).to.be.revertedWith("Name cannot be empty");
    });
  });
});