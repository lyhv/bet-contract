//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "../base/CustomChanIbcApp.sol";

contract NBABet is CustomChanIbcApp {
    enum IbcPacketStatus {
        UNSENT,
        SENT,
        ACKED,
        TIMEOUT
    }

    struct Bet {
        uint256 betAmount;
        uint predictedTeam;
        uint256 betRate;
        uint256 betTime;
        IbcPacketStatus ibcPacketStatus;
        uint betNFTId;
        string teamLogo;
    }

    mapping(uint256 => mapping(address => bool)) public hasBet;

    mapping(uint256 => mapping(address => Bet)) public betsOf;

    struct MatchData {
        uint256[] matchIds;
    }

    mapping(address => MatchData) private matchIdsOf;

    // Event emitted when a new bet is placed
    event BetPlaced(
        uint256 matchId,
        address user,
        uint predictedTeam,
        uint256 betAmount,
        uint256 betRate,
        uint256 betTime,
        string teamLogo
    );

    event SendBetInfo(bytes32 channelId, address betUser, uint256 matchId);

    event AckNFTMint(
        bytes32 channelId,
        uint sequence,
        address sender,
        uint256 matchId,
        uint betNFTId
    );

    error NotHaveAmountBet();

    address public chairperson;

    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Not chairperson.");
        _;
    }

    constructor(IbcDispatcher _dispatcher) CustomChanIbcApp(_dispatcher) {
        chairperson = msg.sender;
    }

    function placeBet(
        uint256 _matchId,
        uint _predictedTeam,
        string memory _teamLogo,
        bytes32 _channelId,
        uint64 _timeoutSeconds
    ) external payable {
        if (msg.value <= 0) revert NotHaveAmountBet();
        require(
            !hasBet[_matchId][msg.sender],
            "You have already placed a bet on this match"
        );

        Bet storage bet = betsOf[_matchId][msg.sender];
        bet.ibcPacketStatus = IbcPacketStatus.UNSENT;
        bet.betAmount = msg.value;
        bet.predictedTeam = _predictedTeam;
        bet.betRate = 0;
        bet.betTime = block.timestamp;
        bet.teamLogo = _teamLogo;

        hasBet[_matchId][msg.sender] = true;

        addMatchId(msg.sender, _matchId);

        emit BetPlaced(
            _matchId,
            msg.sender,
            msg.value,
            _predictedTeam,
            0,
            bet.betTime,
            _teamLogo
        );

        sendPacket(_channelId, _timeoutSeconds, msg.sender, _matchId, _teamLogo);
    }

    function sendPacket(
        bytes32 channelId,
        uint64 timeoutSeconds,
        address senderAddress,
        uint256 matchId,
        string memory _teamLogo
    ) internal {
        Bet storage bet = betsOf[matchId][senderAddress];
        require(
            bet.ibcPacketStatus == IbcPacketStatus.UNSENT ||
                bet.ibcPacketStatus == IbcPacketStatus.TIMEOUT,
            "An IBC packet relating to his bet has already been sent. Wait for acknowledgement."
        );

        bytes memory payload = abi.encode(
            senderAddress,
            matchId,
            _teamLogo
        );

        uint64 timeoutTimestamp = uint64(
            (block.timestamp + timeoutSeconds) * 1000000000
        );

        dispatcher.sendPacket(channelId, payload, timeoutTimestamp);
        bet.ibcPacketStatus = IbcPacketStatus.SENT;

        emit SendBetInfo(channelId, senderAddress, matchId);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getMatchIds(
        address _address
    ) external view returns (uint256[] memory) {
        return matchIdsOf[_address].matchIds;
    }

    function addMatchId(address _address, uint256 _matchId) internal {
        matchIdsOf[_address].matchIds.push(_matchId);
    }

    // -------------- IBC ---------------
    function onRecvPacket(
        IbcPacket memory
    )
        external
        view
        override
        onlyIbcDispatcher
        returns (AckPacket memory ackPacket)
    {
        require(false, "This function should not be called");

        return
            AckPacket(
                true,
                abi.encode("Error: This function should not be called")
            );
    }

    function onAcknowledgementPacket(
        IbcPacket calldata packet,
        AckPacket calldata ack
    ) external override onlyIbcDispatcher {
        ackPackets.push(ack);

        // // decode the ack data, find the address of the voter the packet belongs to and set ibcNFTMinted true
        (address sender, uint256 matchId, uint256 betNFTId) = abi.decode(
            ack.data,
            (address, uint256, uint256)
        );
        betsOf[matchId][sender].ibcPacketStatus = IbcPacketStatus.ACKED;
        betsOf[matchId][sender].betNFTId = betNFTId;

        emit AckNFTMint(
            packet.src.channelId,
            packet.sequence,
            sender,
            matchId,
            betNFTId
        );
    }

    function onTimeoutPacket(
        IbcPacket calldata packet
    ) external override onlyIbcDispatcher {
        timeoutPackets.push(packet);
        // do logic
    }
}
