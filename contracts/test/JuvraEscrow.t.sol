// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {JuvraEscrow} from "../src/JuvraEscrow.sol";

contract JuvraEscrowTest is Test {
    JuvraEscrow private escrow;

    address private owner = address(0xA11CE);
    address private client = address(0xC11E47);
    address private freelancer = address(0xF2EE);
    address private otherFreelancer = address(0xB0B);
    address private arbitrator = address(0xA2B);

    uint256 private constant AMOUNT = 5 ether;

    event FreelancerApplied(uint256 indexed jobId, address indexed freelancer);
    event FreelancerSelected(uint256 indexed jobId, address indexed freelancer);
    event WorkSubmitted(uint256 indexed jobId, string submissionURI);
    event PaymentReleased(uint256 indexed jobId, address indexed freelancer, uint256 amount);
    event DisputeRaised(uint256 indexed jobId, address indexed raisedBy);
    event DisputeResolved(uint256 indexed jobId, bool clientWins, uint256 amount);
    event JobCancelled(uint256 indexed jobId, uint256 refundAmount);

    function setUp() public {
        vm.prank(owner);
        escrow = new JuvraEscrow(arbitrator);

        vm.deal(client, 100 ether);
        vm.deal(freelancer, 1 ether);
        vm.deal(otherFreelancer, 1 ether);
        vm.deal(arbitrator, 1 ether);
    }

    function testPostJobAndGetJobCount() public {
        uint256 jobId = _postJob();

        assertEq(jobId, 1);
        assertEq(escrow.getJobCount(), 1);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.client, client);
        assertEq(job.amount, AMOUNT);
        assertEq(job.title, "Build UI");
        assertEq(uint8(job.status), uint8(JuvraEscrow.Status.Open));
    }

    function testApplyForJob() public {
        uint256 jobId = _postJob();

        vm.expectEmit(true, true, false, false);
        emit FreelancerApplied(jobId, freelancer);

        vm.prank(freelancer);
        escrow.applyForJob(jobId);

        address[] memory applicants = escrow.getApplicants(jobId);
        assertEq(applicants.length, 1);
        assertEq(applicants[0], freelancer);
        assertTrue(escrow.hasApplied(jobId, freelancer));
    }

    function testSelectFreelancer() public {
        uint256 jobId = _postAndApply();

        vm.expectEmit(true, true, false, false);
        emit FreelancerSelected(jobId, freelancer);

        vm.prank(client);
        escrow.selectFreelancer(jobId, freelancer);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.freelancer, freelancer);
        assertEq(uint8(job.status), uint8(JuvraEscrow.Status.Assigned));
    }

    function testSubmitWork() public {
        uint256 jobId = _postApplyAndSelect();

        vm.expectEmit(true, false, false, true);
        emit WorkSubmitted(jobId, "ipfs://work");

        vm.prank(freelancer);
        escrow.submitWork(jobId, "ipfs://work");

        JuvraEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.submissionURI, "ipfs://work");
        assertEq(uint8(job.status), uint8(JuvraEscrow.Status.Submitted));
    }

    function testApproveWorkPaysFreelancerAndPreventsDoublePayout() public {
        uint256 jobId = _submittedJob();
        uint256 beforeBalance = freelancer.balance;

        vm.expectEmit(true, true, false, true);
        emit PaymentReleased(jobId, freelancer, AMOUNT);

        vm.prank(client);
        escrow.approveWork(jobId);

        assertEq(freelancer.balance, beforeBalance + AMOUNT);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.amount, 0);
        assertEq(uint8(job.status), uint8(JuvraEscrow.Status.Approved));

        vm.expectRevert(
            abi.encodeWithSelector(
                JuvraEscrow.InvalidStatus.selector,
                JuvraEscrow.Status.Approved,
                JuvraEscrow.Status.Submitted
            )
        );
        vm.prank(client);
        escrow.approveWork(jobId);
    }

    function testDisputeResolutionPaysClientWhenClientWins() public {
        uint256 jobId = _submittedJob();
        uint256 beforeBalance = client.balance;

        vm.prank(client);
        escrow.raiseDispute(jobId);

        vm.expectEmit(true, false, false, true);
        emit DisputeResolved(jobId, true, AMOUNT);

        vm.prank(arbitrator);
        escrow.resolveDispute(jobId, true);

        assertEq(client.balance, beforeBalance + AMOUNT);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.amount, 0);
        assertEq(uint8(job.status), uint8(JuvraEscrow.Status.Refunded));
    }

    function testDisputeResolutionPaysFreelancerWhenFreelancerWins() public {
        uint256 jobId = _submittedJob();
        uint256 beforeBalance = freelancer.balance;

        vm.prank(freelancer);
        escrow.raiseDispute(jobId);

        vm.prank(arbitrator);
        escrow.resolveDispute(jobId, false);

        assertEq(freelancer.balance, beforeBalance + AMOUNT);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.amount, 0);
        assertEq(uint8(job.status), uint8(JuvraEscrow.Status.Approved));
    }

    function testCancelJobRefundsClient() public {
        uint256 jobId = _postJob();
        uint256 beforeBalance = client.balance;

        vm.expectEmit(true, false, false, true);
        emit JobCancelled(jobId, AMOUNT);

        vm.prank(client);
        escrow.cancelJob(jobId);

        assertEq(client.balance, beforeBalance + AMOUNT);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);
        assertEq(job.amount, 0);
        assertEq(uint8(job.status), uint8(JuvraEscrow.Status.Cancelled));
    }

    function testRaiseDisputeFromAssignedOrSubmitted() public {
        uint256 assignedJobId = _postApplyAndSelect();

        vm.expectEmit(true, true, false, false);
        emit DisputeRaised(assignedJobId, client);

        vm.prank(client);
        escrow.raiseDispute(assignedJobId);

        uint256 submittedJobId = _submittedJob();
        vm.prank(freelancer);
        escrow.raiseDispute(submittedJobId);

        JuvraEscrow.Job memory job = escrow.getJob(submittedJobId);
        assertEq(uint8(job.status), uint8(JuvraEscrow.Status.Disputed));
    }

    function testReverts() public {
        uint256 jobId = _postJob();

        vm.expectRevert(JuvraEscrow.ClientCannotApply.selector);
        vm.prank(client);
        escrow.applyForJob(jobId);

        vm.prank(freelancer);
        escrow.applyForJob(jobId);

        vm.expectRevert(JuvraEscrow.AlreadyApplied.selector);
        vm.prank(freelancer);
        escrow.applyForJob(jobId);

        vm.expectRevert(JuvraEscrow.FreelancerDidNotApply.selector);
        vm.prank(client);
        escrow.selectFreelancer(jobId, otherFreelancer);

        vm.expectRevert(JuvraEscrow.Unauthorized.selector);
        vm.prank(otherFreelancer);
        escrow.selectFreelancer(jobId, freelancer);

        vm.prank(client);
        escrow.selectFreelancer(jobId, freelancer);

        vm.expectRevert(
            abi.encodeWithSelector(
                JuvraEscrow.InvalidStatus.selector,
                JuvraEscrow.Status.Assigned,
                JuvraEscrow.Status.Open
            )
        );
        vm.prank(client);
        escrow.cancelJob(jobId);

        vm.expectRevert(JuvraEscrow.Unauthorized.selector);
        vm.prank(otherFreelancer);
        escrow.submitWork(jobId, "ipfs://work");

        vm.expectRevert(JuvraEscrow.EmptySubmissionURI.selector);
        vm.prank(freelancer);
        escrow.submitWork(jobId, "");

        vm.prank(freelancer);
        escrow.submitWork(jobId, "ipfs://work");

        vm.expectRevert(JuvraEscrow.Unauthorized.selector);
        vm.prank(otherFreelancer);
        escrow.approveWork(jobId);
    }

    function testOnlyArbitratorCanResolveDispute() public {
        uint256 jobId = _submittedJob();

        vm.prank(client);
        escrow.raiseDispute(jobId);

        vm.expectRevert(JuvraEscrow.Unauthorized.selector);
        vm.prank(client);
        escrow.resolveDispute(jobId, true);
    }

    function testPostJobRevertsForInvalidInputs() public {
        vm.expectRevert(JuvraEscrow.InvalidAmount.selector);
        vm.prank(client);
        escrow.postJob{value: 0}("Build UI", "Frontend", "ipfs://job", block.timestamp + 1 days);

        vm.expectRevert(JuvraEscrow.EmptyTitle.selector);
        vm.prank(client);
        escrow.postJob{value: AMOUNT}("", "Frontend", "ipfs://job", block.timestamp + 1 days);

        vm.expectRevert(JuvraEscrow.EmptyCategory.selector);
        vm.prank(client);
        escrow.postJob{value: AMOUNT}("Build UI", "", "ipfs://job", block.timestamp + 1 days);

        vm.expectRevert(JuvraEscrow.EmptyDescriptionURI.selector);
        vm.prank(client);
        escrow.postJob{value: AMOUNT}("Build UI", "Frontend", "", block.timestamp + 1 days);

        vm.expectRevert(JuvraEscrow.InvalidDeadline.selector);
        vm.prank(client);
        escrow.postJob{value: AMOUNT}("Build UI", "Frontend", "ipfs://job", block.timestamp);
    }

    function _postJob() private returns (uint256) {
        vm.prank(client);
        escrow.postJob{value: AMOUNT}(
            "Build UI",
            "Frontend",
            "ipfs://job",
            block.timestamp + 7 days
        );

        return escrow.getJobCount();
    }

    function _postAndApply() private returns (uint256 jobId) {
        jobId = _postJob();

        vm.prank(freelancer);
        escrow.applyForJob(jobId);
    }

    function _postApplyAndSelect() private returns (uint256 jobId) {
        jobId = _postAndApply();

        vm.prank(client);
        escrow.selectFreelancer(jobId, freelancer);
    }

    function _submittedJob() private returns (uint256 jobId) {
        jobId = _postApplyAndSelect();

        vm.prank(freelancer);
        escrow.submitWork(jobId, "ipfs://work");
    }
}
