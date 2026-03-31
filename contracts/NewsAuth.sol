// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NewsAuth
 * @dev AI-Powered News Verification & Blockchain Storage
 * @notice Store and verify IPFS hashes of analyzed news articles on blockchain
 */
contract NewsAuth {
    
    /// @dev Structure to store article data
    struct Article {
        address author;
        string ipfsCID;
        uint256 timestamp;
        bytes32 contentHash;
        uint8 credibilityScore;
        bool verified;
    }

    /// @dev Mapping from article hash to article data
    mapping(bytes32 => Article) public articles;

    /// @dev Counter for total articles registered
    uint256 public articleCount;

    /// @dev Array to track all article hashes
    bytes32[] public articleHashes;

    /// @dev Mapping from address to articles by user
    mapping(address => bytes32[]) public userArticles;

    /// @dev Events
    event ArticleRegistered(
        indexed bytes32 hash,
        indexed address author,
        string ipfsCID,
        uint256 timestamp
    );

    event ArticleVerified(
        indexed bytes32 hash,
        address verifiedBy,
        uint256 timestamp
    );

    event CredibilityUpdated(
        indexed bytes32 hash,
        uint8 newScore,
        uint256 timestamp
    );

    /// @dev Owner for admin functions
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
        articleCount = 0;
    }

    /**
     * @dev Register a new article on blockchain
     * @param hash Keccak256 hash of the content
     * @param cid IPFS Content Identifier
     * @param credibilityScore AI-calculated credibility score (0-100)
     */
    function registerArticle(
        bytes32 hash,
        string memory cid,
        uint8 credibilityScore
    ) public {
        require(hash != bytes32(0), "Invalid hash");
        require(bytes(cid).length > 0, "CID cannot be empty");
        require(credibilityScore <= 100, "Invalid credibility score");
        require(articles[hash].timestamp == 0, "Article already exists");

        Article memory newArticle = Article({
            author: msg.sender,
            ipfsCID: cid,
            timestamp: block.timestamp,
            contentHash: hash,
            credibilityScore: credibilityScore,
            verified: false
        });

        articles[hash] = newArticle;
        articleHashes.push(hash);
        userArticles[msg.sender].push(hash);
        articleCount++;

        emit ArticleRegistered(hash, msg.sender, cid, block.timestamp);
    }

    /**
     * @dev Verify an article (only owner)
     * @param hash Article hash to verify
     */
    function verifyArticle(bytes32 hash) public onlyOwner {
        require(articles[hash].timestamp != 0, "Article not found");
        require(!articles[hash].verified, "Already verified");

        articles[hash].verified = true;

        emit ArticleVerified(hash, msg.sender, block.timestamp);
    }

    /**
     * @dev Update credibility score (only owner)
     * @param hash Article hash
     * @param newScore New credibility score
     */
    function updateCredibilityScore(bytes32 hash, uint8 newScore) public onlyOwner {
        require(articles[hash].timestamp != 0, "Article not found");
        require(newScore <= 100, "Invalid score");

        articles[hash].credibilityScore = newScore;

        emit CredibilityUpdated(hash, newScore, block.timestamp);
    }

    /**
     * @dev Get article data by hash
     * @param hash Article hash
     * @return Article data structure
     */
    function getArticle(bytes32 hash) public view returns (Article memory) {
        require(articles[hash].timestamp != 0, "Article not found");
        return articles[hash];
    }

    /**
     * @dev Get all articles by an author
     * @param author Address of the author
     * @return Array of article hashes
     */
    function getArticlesByAuthor(address author) public view returns (bytes32[] memory) {
        return userArticles[author];
    }

    /**
     * @dev Batch register articles
     * @param hashes Array of article hashes
     * @param cids Array of IPFS CIDs
     * @param scores Array of credibility scores
     */
    function batchRegisterArticles(
        bytes32[] memory hashes,
        string[] memory cids,
        uint8[] memory scores
    ) public {
        require(
            hashes.length == cids.length && hashes.length == scores.length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < hashes.length; i++) {
            registerArticle(hashes[i], cids[i], scores[i]);
        }
    }

    /**
     * @dev Get total number of registered articles
     * @return Total article count
     */
    function getTotalArticles() public view returns (uint256) {
        return articleCount;
    }

    /**
     * @dev Get article by index
     * @param index Article index
     * @return Article hash
     */
    function getArticleHash(uint256 index) public view returns (bytes32) {
        require(index < articleHashes.length, "Index out of bounds");
        return articleHashes[index];
    }

    /**
     * @dev Transfer ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}