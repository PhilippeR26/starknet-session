"use client";

import { Button } from "@/components/ui/button";
import { Box, Center, HStack } from "@chakra-ui/react";
import { useState } from "react";
import OwnSession from "./Sessions/OwnSession";

export default function SessionManager() {
    const [choice, setChoice] = useState<number>(0);

    return (
        <Box
            pt="4"
        >
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
            )}
        </Box>
    )
}