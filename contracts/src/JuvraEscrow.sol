// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
        uint256 createdAt;
        uint256 deadline;
        Status status;
    }

    uint256 public jobCount;
    address public arbitrator;

    mapping(uint256 => Job) public jobs;
    mapping(uint256 => address[]) private applicants;
    mapping(uint256 => mapping(address => bool)) public hasApplied;

    event JobPosted(
        uint256 indexed jobId,
        address indexed client,
        uint256 amount,
        string title
    );
    event FreelancerApplied(uint256 indexed jobId, address indexed freelancer);
    event FreelancerSelected(uint256 indexed jobId, address indexed freelancer);
    event WorkSubmitted(uint256 indexed jobId, string submissionURI);
    event PaymentReleased(uint256 indexed jobId, address indexed freelancer, uint256 amount);
    event DisputeRaised(uint256 indexed jobId, address indexed raisedBy);
    event DisputeResolved(uint256 indexed jobId, bool clientWins, uint256 amount);
    event JobCancelled(uint256 indexed jobId, uint256 refundAmount);

    error InvalidJob();
    error InvalidAddress();
    error InvalidAmount();
    error InvalidDeadline();
    error EmptyTitle();
    error EmptyCategory();
    error EmptyDescriptionURI();
    error EmptySubmissionURI();
    error Unauthorized();
    error InvalidStatus(Status current, Status expected);
    error AlreadyApplied();
    error ClientCannotApply();
    error FreelancerDidNotApply();
    error TransferFailed();

    modifier onlyClient(uint256 jobId) {
        if (jobs[jobId].client != msg.sender) {
            revert Unauthorized();
        }
        _;
    }

    modifier onlyFreelancer(uint256 jobId) {
        if (jobs[jobId].freelancer != msg.sender) {
            revert Unauthorized();
        }
        _;
    }

    modifier onlyArbitrator() {
        if (msg.sender != arbitrator) {
            revert Unauthorized();
        }
        _;
    }

    modifier inStatus(uint256 jobId, Status expected) {
        Status current = jobs[jobId].status;
        if (current != expected) {
            revert InvalidStatus(current, expected);
        }
        _;
    }

    modifier jobExists(uint256 jobId) {
        if (jobId == 0 || jobId > jobCount || jobs[jobId].client == address(0)) {
            revert InvalidJob();
        }
        _;
    }

    constructor(address initialArbitrator) Ownable(msg.sender) {
        if (initialArbitrator == address(0)) {
            revert InvalidAddress();
        }

        arbitrator = initialArbitrator;
    }

    function setArbitrator(address newArbitrator) external onlyOwner {
        if (newArbitrator == address(0)) {
            revert InvalidAddress();
        }

        arbitrator = newArbitrator;
    }

    function postJob(
        string calldata title,
        string calldata category,
        string calldata descriptionURI,
        uint256 deadline
    ) external payable {
        if (msg.value == 0) {
            revert InvalidAmount();
        }
        if (bytes(title).length == 0) {
            revert EmptyTitle();
        }
        if (bytes(category).length == 0) {
            revert EmptyCategory();
        }
        if (bytes(descriptionURI).length == 0) {
            revert EmptyDescriptionURI();
        }
        if (deadline <= block.timestamp) {
            revert InvalidDeadline();
        }

        jobCount++;

        jobs[jobCount] = Job({
            id: jobCount,
            client: msg.sender,
            freelancer: address(0),
            title: title,
            category: category,
            descriptionURI: descriptionURI,
            submissionURI: "",
            amount: msg.value,
            createdAt: block.timestamp,
            deadline: deadline,
            status: Status.Open
        });

        emit JobPosted(jobCount, msg.sender, msg.value, title);
    }

    function applyForJob(uint256 jobId)
        external
        jobExists(jobId)
        inStatus(jobId, Status.Open)
    {
        Job storage job = jobs[jobId];

        if (msg.sender == job.client) {
            revert ClientCannotApply();
        }
        if (hasApplied[jobId][msg.sender]) {
            revert AlreadyApplied();
        }

        hasApplied[jobId][msg.sender] = true;
        applicants[jobId].push(msg.sender);

        emit FreelancerApplied(jobId, msg.sender);
    }

    function selectFreelancer(uint256 jobId, address freelancer)
        external
        jobExists(jobId)
        onlyClient(jobId)
        inStatus(jobId, Status.Open)
    {
        if (freelancer == address(0)) {
            revert InvalidAddress();
        }
        if (!hasApplied[jobId][freelancer]) {
            revert FreelancerDidNotApply();
        }

        Job storage job = jobs[jobId];
        job.freelancer = freelancer;
        job.status = Status.Assigned;

        emit FreelancerSelected(jobId, freelancer);
    }

    function submitWork(uint256 jobId, string calldata submissionURI)
        external
        jobExists(jobId)
        onlyFreelancer(jobId)
        inStatus(jobId, Status.Assigned)
    {
        if (bytes(submissionURI).length == 0) {
            revert EmptySubmissionURI();
        }

        Job storage job = jobs[jobId];
        job.submissionURI = submissionURI;
        job.status = Status.Submitted;

        emit WorkSubmitted(jobId, submissionURI);
    }

    function approveWork(uint256 jobId)
        external
        nonReentrant
        jobExists(jobId)
        onlyClient(jobId)
        inStatus(jobId, Status.Submitted)
    {
        Job storage job = jobs[jobId];
        uint256 amount = job.amount;
        address freelancer = job.freelancer;

        job.amount = 0;
        job.status = Status.Approved;

        _sendValue(freelancer, amount);

        emit PaymentReleased(jobId, freelancer, amount);
    }

    function raiseDispute(uint256 jobId)
        external
        jobExists(jobId)
    {
        Job storage job = jobs[jobId];
        if (msg.sender != job.client && msg.sender != job.freelancer) {
            revert Unauthorized();
        }
        if (job.status != Status.Assigned && job.status != Status.Submitted) {
            revert InvalidStatus(job.status, Status.Assigned);
        }

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
        uint256 amount = job.amount;
        address recipient = clientWins ? job.client : job.freelancer;

        job.amount = 0;
        job.status = clientWins ? Status.Refunded : Status.Approved;

        _sendValue(recipient, amount);

        emit DisputeResolved(jobId, clientWins, amount);
    }

    function cancelJob(uint256 jobId)
        external
        nonReentrant
        jobExists(jobId)
        onlyClient(jobId)
        inStatus(jobId, Status.Open)
    {
        Job storage job = jobs[jobId];
        uint256 amount = job.amount;

        job.amount = 0;
        job.status = Status.Cancelled;

        _sendValue(job.client, amount);

        emit JobCancelled(jobId, amount);
    }

    function getJob(uint256 jobId) external view jobExists(jobId) returns (Job memory) {
        return jobs[jobId];
    }

    function getJobCount() external view returns (uint256) {
        return jobCount;
    }

    function getApplicants(uint256 jobId)
        external
        view
        jobExists(jobId)
        returns (address[] memory)
    {
        return applicants[jobId];
    }

    function _sendValue(address recipient, uint256 amount) private {
        if (recipient == address(0)) {
            revert InvalidAddress();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }
}
