"use client";

import { Center } from "@chakra-ui/react";
import ConnectWallet from "./ConnectWallet/ConnectWallet";
import { useAccount } from "@starknet-react/core";
import SessionManager from "./SessionManagement";

export function DisplayConnected() {
    const { address } = useAccount();

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