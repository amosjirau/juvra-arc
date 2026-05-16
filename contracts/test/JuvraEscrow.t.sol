// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {JuvraEscrow} from "../src/JuvraEscrow.sol";

contract JuvraEscrowTest is Test {
    JuvraEscrow private escrow;

    address private owner = address(0xA11CE);
    address private client = address(0xC11E17);
    address private freelancer = address(0xF33);
    address private secondFreelancer = address(0xF44);
    address private arbitrator = address(0xA4817);

    uint256 private constant PAYMENT = 10 ether;

    function setUp() public {
        vm.prank(owner);
        escrow = new JuvraEscrow(arbitrator, 0);

        vm.deal(client, 100 ether);
        vm.deal(freelancer, 1 ether);
        vm.deal(secondFreelancer, 1 ether);
    }

    function testPostJob() public {
        uint256 jobId = _postJob();

        JuvraEscrow.Job memory job = escrow.getJob(jobId);

        assertEq(escrow.getJobCount(), 1);
        assertEq(job.id, jobId);
        assertEq(job.client, client);
        assertEq(job.freelancer, address(0));
        assertEq(job.title, "Build Juvra landing page");
        assertEq(job.descriptionURI, "ipfs://description");
        assertEq(job.category, "Design");
        assertEq(job.amount, PAYMENT);
        assertEq(uint256(job.status), uint256(JuvraEscrow.Status.Open));
        assertEq(address(escrow).balance, PAYMENT);
    }

    function testZeroPaymentReverts() public {
        vm.prank(client);
        vm.expectRevert(bytes("NO_FUNDS_SENT"));
        escrow.postJob("Build Juvra landing page", "Design", "ipfs://description", _deadline());
    }

    function testFreelancerApplies() public {
        uint256 jobId = _postJob();

        vm.prank(freelancer);
        escrow.applyForJob(jobId);

        address[] memory jobApplicants = escrow.getApplicants(jobId);

        assertEq(jobApplicants.length, 1);
        assertEq(jobApplicants[0], freelancer);
        assertTrue(escrow.hasApplied(jobId, freelancer));
    }

    function testDuplicateApplicationReverts() public {
        uint256 jobId = _postJob();

        vm.startPrank(freelancer);
        escrow.applyForJob(jobId);

        vm.expectRevert(bytes("ALREADY_APPLIED"));
        escrow.applyForJob(jobId);
        vm.stopPrank();
    }

    function testClientSelectsFreelancer() public {
        uint256 jobId = _postAndApply();

        vm.prank(client);
        escrow.selectFreelancer(jobId, freelancer);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);

        assertEq(job.freelancer, freelancer);
        assertEq(uint256(job.status), uint256(JuvraEscrow.Status.Assigned));
    }

    function testNonClientCannotSelect() public {
        uint256 jobId = _postAndApply();

        vm.prank(secondFreelancer);
        vm.expectRevert(bytes("NOT_CLIENT"));
        escrow.selectFreelancer(jobId, freelancer);
    }

    function testSelectedFreelancerSubmitsWork() public {
        uint256 jobId = _postApplyAndSelect();

        vm.prank(freelancer);
        escrow.submitWork(jobId, "ipfs://submission");

        JuvraEscrow.Job memory job = escrow.getJob(jobId);

        assertEq(job.submissionURI, "ipfs://submission");
        assertEq(uint256(job.status), uint256(JuvraEscrow.Status.Submitted));
    }

    function testNonSelectedFreelancerCannotSubmit() public {
        uint256 jobId = _postApplyAndSelect();

        vm.prank(secondFreelancer);
        vm.expectRevert(bytes("NOT_FREELANCER"));
        escrow.submitWork(jobId, "ipfs://submission");
    }

    function testClientApprovesWorkAndPaymentReleases() public {
        uint256 jobId = _postSelectAndSubmit();
        uint256 freelancerBalanceBefore = freelancer.balance;

        vm.prank(client);
        escrow.approveWork(jobId);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);

        assertEq(uint256(job.status), uint256(JuvraEscrow.Status.Approved));
        assertEq(freelancer.balance, freelancerBalanceBefore + PAYMENT);
        assertEq(address(escrow).balance, 0);
    }

    function testDisputeWhereClientWins() public {
        uint256 jobId = _postApplyAndSelect();
        uint256 clientBalanceBefore = client.balance;

        vm.prank(client);
        escrow.raiseDispute(jobId);

        vm.prank(arbitrator);
        escrow.resolveDispute(jobId, true);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);

        assertEq(uint256(job.status), uint256(JuvraEscrow.Status.Refunded));
        assertEq(client.balance, clientBalanceBefore + PAYMENT);
        assertEq(address(escrow).balance, 0);
    }

    function testDisputeWhereFreelancerWins() public {
        uint256 jobId = _postApplyAndSelect();
        uint256 freelancerBalanceBefore = freelancer.balance;

        vm.prank(freelancer);
        escrow.raiseDispute(jobId);

        vm.prank(arbitrator);
        escrow.resolveDispute(jobId, false);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);

        assertEq(uint256(job.status), uint256(JuvraEscrow.Status.Approved));
        assertEq(freelancer.balance, freelancerBalanceBefore + PAYMENT);
        assertEq(address(escrow).balance, 0);
    }

    function testCancelOpenJob() public {
        uint256 jobId = _postJob();
        uint256 clientBalanceBefore = client.balance;

        vm.prank(client);
        escrow.cancelJob(jobId);

        JuvraEscrow.Job memory job = escrow.getJob(jobId);

        assertEq(uint256(job.status), uint256(JuvraEscrow.Status.Cancelled));
        assertEq(client.balance, clientBalanceBefore + PAYMENT);
        assertEq(address(escrow).balance, 0);
    }

    function testCannotCancelAssignedJob() public {
        uint256 jobId = _postApplyAndSelect();

        vm.prank(client);
        vm.expectRevert(bytes("INVALID_STATUS"));
        escrow.cancelJob(jobId);
    }

    function _postJob() private returns (uint256) {
        vm.prank(client);
        escrow.postJob{value: PAYMENT}(
            "Build Juvra landing page",
            "Design",
            "ipfs://description",
            _deadline()
        );

        return escrow.getJobCount() - 1;
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

    function _postSelectAndSubmit() private returns (uint256 jobId) {
        jobId = _postApplyAndSelect();

        vm.prank(freelancer);
        escrow.submitWork(jobId, "ipfs://submission");
    }

    function _deadline() private view returns (uint64) {
        return uint64(block.timestamp + 7 days);
    }
}
