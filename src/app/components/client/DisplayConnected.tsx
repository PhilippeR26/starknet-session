"use client";

import { Box, Center } from "@chakra-ui/react";
import ConnectWallet from "./ConnectWallet/ConnectWallet";
import { useAccount, useNetwork } from "@starknet-react/core";
import { Button } from "@/components/ui/button";
import SessionManager from "./SessionManagement";

export function DisplayConnected() {
    const { chain } = useNetwork();
    const { address, isConnected, connector } = useAccount();

    return (
        <>
            <Center>
                <ConnectWallet></ConnectWallet>
            </Center>
            {address && (
                <SessionManager></SessionManager>
            )
            }
        </>
    )
}