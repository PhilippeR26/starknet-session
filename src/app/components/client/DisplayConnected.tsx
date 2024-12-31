"use client";

import { Center } from "@chakra-ui/react";
import ConnectWallet from "./ConnectWallet/ConnectWallet";
import { useAccount, useNetwork } from "@starknet-react/core";

export function DisplayConnected() {
    const { chain } = useNetwork();
    const { address, isConnected, connector } = useAccount();

    return (
        <>
            <Center>
                <ConnectWallet></ConnectWallet>
            </Center>
            {address && (
                <>
                    <br />
                    sfdggfdfgd
                </>
            )
            }
        </>
    )
}