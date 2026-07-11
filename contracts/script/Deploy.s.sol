// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/JuvraEscrow.sol";

contract Deploy is Script {
    function run() external {
        address arbitrator = vm.envOr("ARBITRATOR_ADDRESS", msg.sender);
        address agentSettler = vm.envOr("AGENT_SETTLER_ADDRESS", msg.sender);

        vm.startBroadcast();

        JuvraEscrow escrow = new JuvraEscrow(arbitrator, agentSettler);

        console.log("JuvraEscrow deployed at:", address(escrow));
        console.log("Arbitrator:", arbitrator);
        console.log("Agent settler:", agentSettler);

        vm.stopBroadcast();
    }
}
