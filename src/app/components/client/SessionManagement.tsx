"use client";

import { Button } from "@/components/ui/button";
import { Toaster, toaster } from "@/components/ui/toaster"
import { Box, Center, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import OwnSession from "./Sessions/OwnSession";
import { RpcProvider } from "starknet";
import { DevnetProvider } from "starknet-devnet";
import fs from 'fs';
import { SessionContractAddress } from "@/utils/constants";
import { useProvider } from "@starknet-react/core";

export default function SessionManager() {
    const [timerId, setTimerId] = useState<NodeJS.Timer | undefined>(undefined);
    const [choice, setChoice] = useState<number>(0);
    const [isDevnetRunning, setDevnetRunning] = useState<boolean>(false);
    const [isContractPresent, setContractPresence] = useState<boolean>(false);
    const myProvider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    const {provider}=useProvider();

    async function testDevnetAlive() {
        const l2DevnetProvider = new DevnetProvider({ timeout: 40_000 });
        const res = await l2DevnetProvider.isAlive();
        console.log({ res });
        setDevnetRunning(res);
        if (!res) {
            toaster.create({
                description: "Devnet-rs is not running!",
                type: "warning",
                placement: "bottom-end",
                duration: 6_000,
            });
            toaster.create({
                description: "Launch Devnet-rs and refresh!",
                type: "warning",
                placement: "bottom-end",
                duration: 7_000,
            })
        } else {
            if (!isContractPresent) {
                try {
                    console.log({provider});
                    console.log({myProvider});
                    const res = await myProvider.getClassHashAt(SessionContractAddress);
                    setContractPresence(true);
                } catch (err) {
                    console.log(err);
                    setContractPresence(false);
                    toaster.create({
                        description: "Devnet-rs has to be a fork of Testnet!",
                        type: "warning",
                        placement: "bottom-end",
                        duration: 7_000,
                    })
                }
            }
        }
    };

    useEffect(() => {
        testDevnetAlive();
        const tim = setInterval(() => {
            testDevnetAlive()
            console.log("timerId=", tim);
        }
            , 12_000 //ms
        );
        setTimerId(() => tim);
        console.log("startTimer", tim);

        return () => {
            clearInterval(tim);
            console.log("stopTimer", tim)
        }

    },
        []
    );


    return (
        <Box
            pt="4"
        >
            <Toaster />
            {choice == 0 ? (
                <>
                    <Center>
                        <HStack>
                            <Button
                                variant="surface"
                                ml={4}
                                px={5}
                                fontWeight='bold'
                                onClick={() => { setChoice(1) }}
                            >
                                Start your own session
                            </Button>
                            <Button
                                variant="surface"
                                ml={4}
                                px={5}
                                fontWeight='bold'
                                onClick={() => { setChoice(2) }}
                            >
                                Start a free trial session
                            </Button>
                        </HStack>
                    </Center>
                </>
            ) : (<>
                {choice == 1 ? (
                    <>
                        {isDevnetRunning && (<>Devnet Running</>)}
                        <OwnSession></OwnSession>
                    </>
                ) : (
                    <>
                        choice 2
                    </>
                )}
                <Center>
                    <Button
                        variant="surface"
                        ml={4}
                        mt={3}
                        px={5}
                        fontWeight='bold'
                        onClick={() => { setChoice(0) }}
                    >
                        Close Session
                    </Button>
                </Center>
            </>
            )

            }

        </Box>
    )
}