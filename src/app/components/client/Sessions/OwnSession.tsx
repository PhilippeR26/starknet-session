"use client";
import { counterAbi } from "@/app/contracts/abis/counter-abi";
import { Button } from "@/components/ui/button";
import styles from '@/app/page.module.css'
import { addrETH, CounterContractAddress } from "@/utils/constants";
import { formatBalance } from "@/utils/utils";
import {
    SignSessionError,
    CreateSessionParams,
    createSession,
    buildSessionAccount,
    bytesToHexString,
    type SessionKey,
    createSessionRequest,
    type SessionRequest,
} from "@argent/x-sessions"
import { Box, Center, Text, VStack } from "@chakra-ui/react";
import { useAccount, useProvider, useSignTypedData, useReadContract, useNetwork, useContract, useSendTransaction, useTransactionReceipt } from "@starknet-react/core";
import { SquareMinus, SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { constants, ec, stark, type Account, type Call } from "starknet";

const maxFee: bigint = (2n * 10n ** 15n); // session fees in wei

export default function OwnSession() {
    const [sessionKey, setSessionKey] = useState<SessionKey | undefined>(undefined);
    const [isSessionSigned, setIsSessionSigned] = useState<boolean>(false);
    const [sessionAccount, setSessionAccount] = useState<Account | undefined>(undefined);
    const [dateEndSession, setDateEndSession] = useState<number | undefined>(undefined);
    const [counter, setCounter] = useState<bigint>(0n);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [remainingFee, setRemainingFee] = useState<bigint>(maxFee);
    const [isNewTxAuthorized, setIsNewTxAuthorized] = useState<boolean>(true);

    // const myProvider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });

    const { provider } = useProvider();
    const { chain } = useNetwork();
    const { data: bal, isSuccess } = useReadContract({
        abi: counterAbi,
        address: CounterContractAddress,
        functionName: "get_counter",
        args: [],
        watch: true,
    });
    const { contract } = useContract({
        abi: counterAbi,
        address: CounterContractAddress,
    });
    const { address } = useAccount();
    const { sendAsync } = useSendTransaction({
        calls: []
    });
    const { data, signTypedDataAsync } = useSignTypedData({});

    async function increase() {
        if (contract !== undefined) {
            setIsNewTxAuthorized(false);
            const increaseCall: Call = contract?.populate("increase", []);
            const res = await sendAsync([increaseCall]);

            console.log("increase", { res });
            setCounter(counter + 1n);
            const txR = await provider.waitForTransaction(res.transaction_hash, { retryInterval: 2000 });
            setIsNewTxAuthorized(true);
            if (txR.isSuccess()) {
                setRemainingFee(remainingFee - BigInt(txR.actual_fee.amount));
            }
        }
    }

    async function decrease() {
        if (contract !== undefined) {
            setIsNewTxAuthorized(false);
            const decreaseCall: Call = contract?.populate("decrease", []);
            const res = await sendAsync([decreaseCall]);
            console.log("decrease", { res });
            setCounter(counter - 1n);
            const txR = await provider.waitForTransaction(res.transaction_hash, { retryInterval: 2000 });
            setIsNewTxAuthorized(true);
            if (txR.isSuccess()) {
                setRemainingFee(remainingFee - BigInt(txR.actual_fee.amount));
            }
        }
    }

    // creation of session key
    useEffect(() => {
        const privateKey = stark.randomAddress();
        const sessionKey: SessionKey = {
            privateKey, //string
            publicKey: ec.starkCurve.getStarkKey(privateKey), //string
        };
        console.log("Session key =", sessionKey);
        setSessionKey(sessionKey);

        return () => { }
    },
        []
    );

    // update of balance
    useEffect(() => {
        if (bal !== undefined) setCounter(BigInt(bal));
        console.log("counter modified :", bal)

        return () => { }
    },
        [bal]
    );

    // initialization of session
    useEffect(() => {
        async function sessionReq() {
            console.log("address changed =", address);
            if ((sessionKey !== undefined) && address && (sessionAccount === undefined)) {
                console.log("address changed and test OK");

                const endDate: number = Math.floor((Date.now() + 1000 * 60 * 60) / 1000); // 1 hour
                setDateEndSession(endDate);
                const sessionParams: CreateSessionParams = {
                    allowedMethods: [{
                        "Contract Address": CounterContractAddress,
                        selector: "increase"
                    },
                    {
                        "Contract Address": CounterContractAddress,
                        selector: "decrease"
                    }
                    ],
                    expiry: BigInt(endDate),
                    sessionKey: sessionKey,
                    metaData: {
                        projectID: "session-dapp",
                        txFees: [{
                            tokenAddress: addrETH,
                            maxAmount: maxFee.toString()
                        }]
                    }
                }
                console.log({ sessionParams });
                const chId = chain.id === BigInt("0x534e5f5345504f4c4941") ? constants.StarknetChainId.SN_SEPOLIA : constants.StarknetChainId.SN_MAIN;
                console.log({ chId });
                const sessionRequest = createSessionRequest({
                    sessionParams,
                    chainId: chId
                });
                const authorizationSignature = await signTypedDataAsync(sessionRequest.sessionTypedData);
                console.log("signature", authorizationSignature);
                if ((sessionKey !== undefined) && address) {
                    const chId = chain.id === BigInt("0x534e5f5345504f4c4941") ? constants.StarknetChainId.SN_SEPOLIA : constants.StarknetChainId.SN_MAIN;
                    const session = await createSession({
                        sessionRequest, // SessionRequest
                        address, // Account address
                        chainId: chId, // StarknetChainId
                        authorisationSignature: authorizationSignature // Signature
                    })
                    const sessionAccount0: Account = await buildSessionAccount({
                        useCacheAuthorisation: false, // optional and defaulted to false, will be added in future developments
                        session,
                        sessionKey,
                        provider,
                    });
                    setSessionAccount(sessionAccount0);
                    console.log("sessionAccount Created");
                    setIsSessionSigned(true);
                }
            }


            // This transaction failed as the cosigner could not provide a valid signature. Please contact support.
            sessionReq().catch(console.error);
        }

        return () => { }
    },
        [address]
    );

    // timer for remaining time of session
    useEffect(() => {
        async function sessionTimer() {
            if (dateEndSession) {
                const now = Math.floor(Date.now() / 1000);
                setRemainingTime(dateEndSession - now);
            }
        }
        sessionTimer()
        const tim = setInterval(() => {
            sessionTimer()
            console.log("remaining timerId=", tim);
        }
            , 60 * 1_000 //ms
        );
        console.log("remaining startTimer", tim);

        return () => {
            clearInterval(tim);
            console.log("remaining stopTimer", tim);
        }
    }
        , []);


    return (
        <>
            {!isSessionSigned && (
                <Center>
                    <VStack>
                        <Text textAlign={"center"}>
                            {/* {isSuccess ? "getCounterOK" : "Err getCounter" } */}
                            <br></br>
                            Session using fees from your own account.
                            <br></br>
                            Remaining fees in this session : {" "}
                            <span className={remainingFee < 10n ** 13n ? styles.red : ""}>
                                {formatBalance(remainingFee, 18) + " "}
                                ETH
                            </span>
                            <br></br>
                            Remaining time :{" "}<span className={remainingTime < 2 ? styles.red : ""}>
                                {remainingTime}'
                            </span>
                        </Text>
                        <Box
                            bgColor={"beige"}
                            w={"250px"}
                            textAlign={"center"}
                            fontSize={"30px"}
                            fontWeight={"bold"}
                            color={"sienna"}
                            p={4}
                            borderWidth={4}
                            borderRadius={"xl"}
                            borderColor={"tan"}
                        >
                            Counter : {" "}
                            {counter.toString()}
                        </Box>
                        <Button
                            p={3}
                            colorPalette={"green"}
                            variant={"surface"}
                            disabled={
                                (counter === 2n ** 128n)
                                || (remainingFee < 10n ** 13n)
                                || !isNewTxAuthorized
                            }
                            fontWeight={"bold"}
                            onClick={() => increase()}
                        >
                            <SquarePlus />
                            increase counter</Button>
                        <Button
                            p={3}
                            colorPalette={"green"}
                            variant={"surface"}
                            disabled={
                                (counter === 0n)
                                || (remainingFee < 10n ** 13n)
                                || !isNewTxAuthorized
                            }
                            fontWeight={"bold"}
                            onClick={() => decrease()}
                        >
                            <SquareMinus />
                            decrease counter</Button>
                    </VStack>
                </Center>)
            }
        </>
    )
}