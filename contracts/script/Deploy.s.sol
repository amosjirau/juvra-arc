// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {console2} from "forge-std/console2.sol";
import "forge-std/Script.sol";
import "../src/JuvraEscrow.sol";

contract Deploy is Script {
    uint256 private constant PLATFORM_FEE_BPS = 250;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address arbitrator = vm.envAddress("ARBITRATOR_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        JuvraEscrow escrow = new JuvraEscrow(arbitrator, 0);
        escrow.setPlatformFee(PLATFORM_FEE_BPS);

        vm.stopBroadcast();

        console2.log("JuvraEscrow deployed at:", address(escrow));
    }
}
