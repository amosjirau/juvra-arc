// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract JuvraEscrow is Ownable, ReentrancyGuard {
    enum Status {
        Open,
        Assigned,
        Submitted,
        Approved,
        Disputed,
        Refunded,
        Cancelled
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        string title;
        string category;
        string descriptionURI;
        string submissionURI;
        uint256 amount;
        uint64 createdAt;
        uint64 deadline;
        Status status;
    }

    uint256 public jobCount;
    address public arbitrator;
    uint256 public platformFee;

    uint256 public constant MAX_FEE = 1000;

    mapping(uint256 => Job) private jobs;
    mapping(uint256 => address[]) private applicants;
    mapping(uint256 => mapping(address => bool)) public hasApplied;

    event JobPosted(uint256 indexed jobId, address indexed client, uint256 amount);
    event FreelancerApplied(uint256 indexed jobId, address indexed freelancer);
    event FreelancerSelected(uint256 indexed jobId, address indexed freelancer);
    event WorkSubmitted(uint256 indexed jobId, address indexed freelancer, string submissionURI);
    event PaymentReleased(uint256 indexed jobId, address indexed freelancer, uint256 amount);
    event DisputeRaised(uint256 indexed jobId, address indexed raisedBy);
    event DisputeResolved(uint256 indexed jobId, bool clientWon, address paidTo);
    event JobCancelled(uint256 indexed jobId);
    event ArbitratorUpdated(address indexed oldArbitrator, address indexed newArbitrator);
    event PlatformFeeUpdated(uint256 oldPlatformFee, uint256 newPlatformFee);

    constructor(address _arbitrator, uint256 _platformFee) Ownable(msg.sender) {
        require(_arbitrator != address(0), "INVALID_ARBITRATOR");
        require(_platformFee <= MAX_FEE, "FEE_TOO_HIGH");

        arbitrator = _arbitrator;
        platformFee = _platformFee;
    }

    modifier onlyClient(uint256 jobId) {
        require(jobs[jobId].client == msg.sender, "NOT_CLIENT");
        _;
    }

    modifier onlyFreelancer(uint256 jobId) {
        require(jobs[jobId].freelancer == msg.sender, "NOT_FREELANCER");
        _;
    }

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "NOT_ARBITRATOR");
        _;
    }

    modifier jobExists(uint256 jobId) {
        require(jobId < jobCount, "JOB_NOT_FOUND");
        _;
    }

    modifier inStatus(uint256 jobId, Status expected) {
        require(jobs[jobId].status == expected, "INVALID_STATUS");
        _;
    }

    function postJob(
        string calldata title,
        string calldata category,
        string calldata descriptionURI,
        uint64 deadline
    ) external payable {
        require(msg.value > 0, "NO_FUNDS_SENT");
        require(bytes(title).length > 0, "EMPTY_TITLE");
        require(bytes(category).length > 0, "EMPTY_CATEGORY");
        require(bytes(descriptionURI).length > 0, "EMPTY_DESCRIPTION");
        require(deadline > block.timestamp, "DEADLINE_IN_PAST");

        uint256 jobId = jobCount;

        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            freelancer: address(0),
            title: title,
            category: category,
            descriptionURI: descriptionURI,
            submissionURI: "",
            amount: msg.value,
            createdAt: uint64(block.timestamp),
            deadline: deadline,
            status: Status.Open
        });

        jobCount++;

        emit JobPosted(jobId, msg.sender, msg.value);
    }

    function applyForJob(uint256 jobId)
        external
        jobExists(jobId)
        inStatus(jobId, Status.Open)
    {
        Job storage job = jobs[jobId];

        require(msg.sender != job.client, "CLIENT_CANNOT_APPLY");
        require(!hasApplied[jobId][msg.sender], "ALREADY_APPLIED");

        applicants[jobId].push(msg.sender);
        hasApplied[jobId][msg.sender] = true;

        emit FreelancerApplied(jobId, msg.sender);
    }

    function selectFreelancer(uint256 jobId, address freelancer)
        external
        jobExists(jobId)
        onlyClient(jobId)
        inStatus(jobId, Status.Open)
    {
        require(freelancer != address(0), "INVALID_FREELANCER");
        require(hasApplied[jobId][freelancer], "FREELANCER_NOT_APPLIED");

        jobs[jobId].freelancer = freelancer;
        jobs[jobId].status = Status.Assigned;

        emit FreelancerSelected(jobId, freelancer);
    }

    function submitWork(uint256 jobId, string calldata submissionURI)
        external
        jobExists(jobId)
        onlyFreelancer(jobId)
        inStatus(jobId, Status.Assigned)
    {
        require(bytes(submissionURI).length > 0, "EMPTY_SUBMISSION");

        jobs[jobId].submissionURI = submissionURI;
        jobs[jobId].status = Status.Submitted;

        emit WorkSubmitted(jobId, msg.sender, submissionURI);
    }

    function approveWork(uint256 jobId)
        external
        nonReentrant
        jobExists(jobId)
        onlyClient(jobId)
        inStatus(jobId, Status.Submitted)
    {
        Job storage job = jobs[jobId];

        job.status = Status.Approved;

        uint256 fee = (job.amount * platformFee) / 10000;
        uint256 payout = job.amount - fee;

        (bool paidFreelancer, ) = job.freelancer.call{value: payout}("");
        require(paidFreelancer, "FREELANCER_PAYMENT_FAILED");

        if (fee > 0) {
            (bool paidOwner, ) = owner().call{value: fee}("");
            require(paidOwner, "FEE_PAYMENT_FAILED");
        }

        emit PaymentReleased(jobId, job.freelancer, payout);
    }

    function raiseDispute(uint256 jobId)
        external
        jobExists(jobId)
    {
        Job storage job = jobs[jobId];

        require(
            job.status == Status.Assigned || job.status == Status.Submitted,
            "DISPUTE_NOT_ALLOWED"
        );

        require(
            msg.sender == job.client || msg.sender == job.freelancer,
            "NOT_JOB_PARTY"
        );

        job.status = Status.Disputed;

        emit DisputeRaised(jobId, msg.sender);
    }

    function resolveDispute(uint256 jobId, bool clientWins)
        external
        nonReentrant
        jobExists(jobId)
        onlyArbitrator
        inStatus(jobId, Status.Disputed)
    {
        Job storage job = jobs[jobId];

        address receiver;

        if (clientWins) {
            job.status = Status.Refunded;
            receiver = job.client;
        } else {
            job.status = Status.Approved;
            receiver = job.freelancer;
        }

        (bool sent, ) = receiver.call{value: job.amount}("");
        require(sent, "DISPUTE_PAYMENT_FAILED");

        emit DisputeResolved(jobId, clientWins, receiver);
    }

    function cancelJob(uint256 jobId)
        external
        nonReentrant
        jobExists(jobId)
        onlyClient(jobId)
        inStatus(jobId, Status.Open)
    {
        Job storage job = jobs[jobId];

        job.status = Status.Cancelled;

        (bool refunded, ) = job.client.call{value: job.amount}("");
        require(refunded, "REFUND_FAILED");

        emit JobCancelled(jobId);
    }

    function getJob(uint256 jobId)
        external
        view
        jobExists(jobId)
        returns (Job memory)
    {
        return jobs[jobId];
    }

    function getApplicants(uint256 jobId)
        external
        view
        jobExists(jobId)
        returns (address[] memory)
    {
        return applicants[jobId];
    }

    function getJobCount() external view returns (uint256) {
        return jobCount;
    }

    function setArbitrator(address _arbitrator) external onlyOwner {
        require(_arbitrator != address(0), "INVALID_ARBITRATOR");
        address oldArbitrator = arbitrator;
        arbitrator = _arbitrator;

        emit ArbitratorUpdated(oldArbitrator, _arbitrator);
    }

    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= MAX_FEE, "FEE_TOO_HIGH");
        uint256 oldPlatformFee = platformFee;
        platformFee = _platformFee;

        emit PlatformFeeUpdated(oldPlatformFee, _platformFee);
    }
}
