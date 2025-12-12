// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AreenZainab Supply Chain Management
 * @author Areen Zainab
 * @notice This contract manages a complete supply chain from manufacturer to customer
 */
contract AreenZainab_supplychain {
    
    // Enums for roles and product status
    enum Role { None, Manufacturer, Distributor, Retailer, Customer }
    enum ProductStatus { Manufactured, InTransit, Delivered, Sold }
    
    // Structs
    struct User {
        address userAddress;
        Role role;
        bool isRegistered;
        string name;
    }
    
    struct RegistrationRequest {
        address requester;
        Role requestedRole;
        string name;
        bool isPending;
    }
    
    struct Product {
        uint256 productId;
        string name;
        string description;
        address currentOwner;
        address manufacturer;
        ProductStatus status;
        uint256 timestamp;
    }
    
    struct TransferHistory {
        address from;
        address to;
        ProductStatus status;
        uint256 timestamp;
        string notes;
    }
    
    // State variables
    address public owner;
    uint256 public productCounter;
    
    // Mappings
    mapping(address => User) public users;
    mapping(address => RegistrationRequest) public registrationRequests;
    mapping(uint256 => Product) public products;
    mapping(uint256 => TransferHistory[]) public productHistory;
    
    address[] public pendingRequests;
    
    // Events
    event UserRegistered(address indexed userAddress, Role role, string name);
    event RegistrationRequested(address indexed requester, Role requestedRole, string name);
    event RegistrationApproved(address indexed user, Role role);
    event RegistrationRejected(address indexed user);
    event ProductRegistered(uint256 indexed productId, string name, address manufacturer);
    event ProductTransferred(uint256 indexed productId, address indexed from, address indexed to, ProductStatus status);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }
    
    modifier onlyRole(Role _role) {
        require(users[msg.sender].role == _role, "Unauthorized role");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(_productId > 0 && _productId <= productCounter, "Product does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        users[owner] = User(owner, Role.None, true, "Contract Owner - Areen Zainab");
    }
    
    // ==================== Registration Functions ====================
    
    /**
     * @notice Request registration with a specific role
     * @param _role The role user wants to register as
     * @param _name The name of the user/company
     */
    function requestRegistration(Role _role, string memory _name) external {
        require(_role != Role.None, "Invalid role");
        require(!users[msg.sender].isRegistered, "Already registered");
        require(!registrationRequests[msg.sender].isPending, "Request already pending");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        registrationRequests[msg.sender] = RegistrationRequest(
            msg.sender,
            _role,
            _name,
            true
        );
        
        pendingRequests.push(msg.sender);
        
        emit RegistrationRequested(msg.sender, _role, _name);
    }
    
    /**
     * @notice Approve a registration request
     * @param _user Address of the user to approve
     */
    function approveRequest(address _user) external onlyOwner {
        require(registrationRequests[_user].isPending, "No pending request");
        
        RegistrationRequest memory request = registrationRequests[_user];
        
        users[_user] = User(
            _user,
            request.requestedRole,
            true,
            request.name
        );
        
        registrationRequests[_user].isPending = false;
        _removePendingRequest(_user);
        
        emit RegistrationApproved(_user, request.requestedRole);
        emit UserRegistered(_user, request.requestedRole, request.name);
    }
    
    /**
     * @notice Reject a registration request
     * @param _user Address of the user to reject
     */
    function rejectRequest(address _user) external onlyOwner {
        require(registrationRequests[_user].isPending, "No pending request");
        
        registrationRequests[_user].isPending = false;
        _removePendingRequest(_user);
        
        emit RegistrationRejected(_user);
    }
    
    /**
     * @notice Owner directly registers a user (bypasses request)
     * @param _user Address of the user to register
     * @param _role Role to assign
     * @param _name Name of the user
     */
    function registerUser(address _user, Role _role, string memory _name) external onlyOwner {
        require(_role != Role.None, "Invalid role");
        require(!users[_user].isRegistered, "Already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        users[_user] = User(_user, _role, true, _name);
        
        emit UserRegistered(_user, _role, _name);
    }
    
    // ==================== Product Functions ====================
    
    /**
     * @notice Register a new product (Manufacturer only)
     * @param _name Product name
     * @param _description Product description
     */
    function registerProduct(string memory _name, string memory _description) 
        external 
        onlyRegistered 
        onlyRole(Role.Manufacturer) 
        returns (uint256) 
    {
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        productCounter++;
        uint256 newProductId = productCounter;
        
        products[newProductId] = Product(
            newProductId,
            _name,
            _description,
            msg.sender,
            msg.sender,
            ProductStatus.Manufactured,
            block.timestamp
        );
        
        // Add initial history entry
        productHistory[newProductId].push(TransferHistory(
            address(0),
            msg.sender,
            ProductStatus.Manufactured,
            block.timestamp,
            "Product manufactured"
        ));
        
        emit ProductRegistered(newProductId, _name, msg.sender);
        
        return newProductId;
    }
    
    /**
     * @notice Transfer product ownership
     * @param _productId ID of the product to transfer
     * @param _to Address of the recipient
     * @param _status New status of the product
     * @param _notes Additional notes for the transfer
     */
    function transferProduct(
        uint256 _productId, 
        address _to, 
        ProductStatus _status,
        string memory _notes
    ) 
        external 
        onlyRegistered 
        productExists(_productId) 
    {
        Product storage product = products[_productId];
        
        require(product.currentOwner == msg.sender, "Not the current owner");
        require(users[_to].isRegistered, "Recipient not registered");
        require(_validateTransfer(users[msg.sender].role, users[_to].role), "Invalid role transition");
        require(_validateStatusTransition(product.status, _status), "Invalid status transition");
        
        // Update product
        address previousOwner = product.currentOwner;
        product.currentOwner = _to;
        product.status = _status;
        product.timestamp = block.timestamp;
        
        // Add to history
        productHistory[_productId].push(TransferHistory(
            previousOwner,
            _to,
            _status,
            block.timestamp,
            _notes
        ));
        
        emit ProductTransferred(_productId, previousOwner, _to, _status);
    }
    
    // ==================== View Functions ====================
    
    /**
     * @notice Get product details
     * @param _productId ID of the product
     */
    function getProduct(uint256 _productId) 
        external 
        view 
        productExists(_productId) 
        returns (
            uint256 productId,
            string memory name,
            string memory description,
            address currentOwner,
            address manufacturer,
            ProductStatus status,
            uint256 timestamp
        ) 
    {
        Product memory product = products[_productId];
        return (
            product.productId,
            product.name,
            product.description,
            product.currentOwner,
            product.manufacturer,
            product.status,
            product.timestamp
        );
    }
    
    /**
     * @notice Get complete transfer history of a product
     * @param _productId ID of the product
     */
    function getProductHistory(uint256 _productId) 
        external 
        view 
        productExists(_productId) 
        returns (TransferHistory[] memory) 
    {
        return productHistory[_productId];
    }
    
    /**
     * @notice Get all pending registration requests
     */
    function getPendingRequestAddresses() external view onlyOwner returns (address[] memory) {
        return pendingRequests;
    }
    
    /**
     * @notice Get specific registration request details
     * @param _user Address of the user
     */
    function getRegistrationRequest(address _user) 
        external 
        view 
        returns (
            address requester,
            Role requestedRole,
            string memory name,
            bool isPending
        ) 
    {
        RegistrationRequest memory request = registrationRequests[_user];
        return (request.requester, request.requestedRole, request.name, request.isPending);
    }
    
    /**
     * @notice Get user's role
     * @param _user Address of the user
     */
    function getUserRole(address _user) external view returns (Role) {
        return users[_user].role;
    }
    
    /**
     * @notice Check if user is registered
     * @param _user Address of the user
     */
    function isUserRegistered(address _user) external view returns (bool) {
        return users[_user].isRegistered;
    }
    
    /**
     * @notice Get user details
     * @param _user Address of the user
     */
    function getUser(address _user) 
        external 
        view 
        returns (
            address userAddress,
            Role role,
            bool isRegistered,
            string memory name
        ) 
    {
        User memory user = users[_user];
        return (user.userAddress, user.role, user.isRegistered, user.name);
    }
    
    /**
     * @notice Get total number of products
     */
    function getTotalProducts() external view returns (uint256) {
        return productCounter;
    }
    
    // ==================== Internal Functions ====================
    
    /**
     * @notice Validate role transition in supply chain
     */
    function _validateTransfer(Role _fromRole, Role _toRole) private pure returns (bool) {
        if (_fromRole == Role.Manufacturer && _toRole == Role.Distributor) return true;
        if (_fromRole == Role.Distributor && _toRole == Role.Retailer) return true;
        if (_fromRole == Role.Retailer && _toRole == Role.Customer) return true;
        return false;
    }
    
    /**
     * @notice Validate status transition
     */
    function _validateStatusTransition(ProductStatus _currentStatus, ProductStatus _newStatus) 
        private 
        pure 
        returns (bool) 
    {
        if (_currentStatus == ProductStatus.Manufactured && _newStatus == ProductStatus.InTransit) return true;
        if (_currentStatus == ProductStatus.InTransit && _newStatus == ProductStatus.Delivered) return true;
        if (_currentStatus == ProductStatus.Delivered && _newStatus == ProductStatus.Sold) return true;
        return false;
    }
    
    /**
     * @notice Remove address from pending requests array
     */
    function _removePendingRequest(address _user) private {
        for (uint i = 0; i < pendingRequests.length; i++) {
            if (pendingRequests[i] == _user) {
                pendingRequests[i] = pendingRequests[pendingRequests.length - 1];
                pendingRequests.pop();
                break;
            }
        }
    }
}