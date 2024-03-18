//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "../base/CustomChanIbcApp.sol";

contract XProofOfBetNFT is ERC721, CustomChanIbcApp {
    using Counters for Counters.Counter;
    Counters.Counter private currentTokenId;

    string uri = "";

    mapping(uint256 => mapping(address => uint256)) public winNFTof;
    mapping(uint256 => mapping(address => uint256)) public povNFTof;

    event MintedOnRecv(
        bytes32 channelId,
        uint64 sequence,
        address indexed sender,
        uint256 matchId,
        uint betNFTId
    );

    constructor(
        IbcDispatcher _dispatcher,
        string memory _baseURI
    ) CustomChanIbcApp(_dispatcher) ERC721("ProofOfBetNFT", "Bet") {
        uri = _baseURI;
    }

    function mint(
        address recipient,
        string memory _uri
    ) internal returns (uint256) {
        currentTokenId.increment();
        uint256 tokenId = currentTokenId.current();
        _safeMint(recipient, tokenId);
        _updateUri(_uri);
        return tokenId;
    }

    function mintWinNFT(
        uint256 _matchId,
        string memory _uri
    ) external returns (uint256) {
        require(povNFTof[_matchId][msg.sender] > 0, "Required POV NFT");
        require(winNFTof[_matchId][msg.sender] > 0, "Win NFT already minted!");
        uint256 tokenId = mint(msg.sender, _uri);
        winNFTof[_matchId][msg.sender] = tokenId;
        return tokenId;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return string(abi.encodePacked(uri));
    }

    function _updateUri(string memory _newBaseURI) internal {
        uri = _newBaseURI;
    }

    // IBC methods

    // This contract only receives packets from the IBC dispatcher

    function onRecvPacket(
        IbcPacket memory packet
    ) external override onlyIbcDispatcher returns (AckPacket memory ackPacket) {
        recvedPackets.push(packet);

        // Decode the packet data
        (address senderAddress, uint256 matchId) = abi.decode(
            packet.data,
            (address, uint256)
        );

        // Mint the NFT
        uint256 betNFTId = mint(senderAddress, "");
        povNFTof[matchId][msg.sender] = betNFTId;

        // Encode the ack data
        bytes memory ackData = abi.encode(senderAddress, matchId, betNFTId);

        // Emit
        emit MintedOnRecv(
            packet.dest.channelId,
            packet.sequence,
            senderAddress,
            matchId,
            betNFTId
        );
        return AckPacket(true, ackData);
    }

    function onAcknowledgementPacket(
        IbcPacket calldata,
        AckPacket calldata
    ) external view override onlyIbcDispatcher {
        require(
            false,
            "This contract should never receive an acknowledgement packet"
        );
    }

    function onTimeoutPacket(
        IbcPacket calldata
    ) external view override onlyIbcDispatcher {
        require(false, "This contract should never receive a timeout packet");
    }
}
