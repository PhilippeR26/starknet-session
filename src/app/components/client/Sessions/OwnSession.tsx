"use client";
import { counterAbi } from "@/app/contracts/abis/counter-abi";
import styles from '@/app/page.module.css'
import { addrETH, addrSTRK, CounterContractAddress } from "@/utils/constants";
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
import { Box, Center, Text, VStack, Button } from "@chakra-ui/react";
import { useAccount, useProvider, useSignTypedData, useReadContract, useNetwork, useContract, useSendTransaction, useTransactionReceipt } from "@starknet-react/core";
import { SquareMinus, SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { constants, ec, RpcProvider, stark, type Account, type Call, type InvokeFunctionResponse, type SuccessfulTransactionReceiptResponse } from "starknet";

const maxFee: bigint = (2n * 10n ** 15n); // session fees in wei
const duration: number = 5; // session duration in minutes

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

    // const { provider } = useProvider();
    const provider = new RpcProvider({ nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/v0_7", specVersion: "0.7.1" });
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
            try {
                console.log("try to increase...")
                if (sessionAccount) {
                    console.log("Increase...")
                    // V1 transaction (ETH fees)
                    const estimationFees = await sessionAccount.estimateFee(increaseCall, { version: 1 });
                    console.log("estimationFees", estimationFees);
                    const increasedFees = stark.estimatedFeeToMaxFee(estimationFees.suggestedMaxFee, 50)
                    const res = await sessionAccount.execute(
                        increaseCall,
                        {
                            version: 1,
                            maxFee: 224005303668n
                        }
                    );
                    console.log("increase", { res });
                    setCounter(counter + 1n);
                    const txR = await provider.waitForTransaction(res.transaction_hash, { retryInterval: 2000 });
                    setIsNewTxAuthorized(true);
                    if (txR.isSuccess()) {
                        setRemainingFee(remainingFee - BigInt((txR.value as SuccessfulTransactionReceiptResponse).actual_fee.amount));
                    }
                }
            } catch (err: any) {
                setIsNewTxAuthorized(true);
                throw new Error(err);
            }
        }
    }

    async function decrease() {
        if (contract !== undefined) {
           setIsNewTxAuthorized(false);
            const increaseCall: Call = contract?.populate("decrease", []);
            try {
                console.log("try to decrease...")
                if (sessionAccount) {
                    console.log("Decrease...")
                    // V1 transaction (ETH fees)
                    const estimationFees = await sessionAccount.estimateFee(increaseCall, { version: 1 });
                    console.log("estimationFees", estimationFees);
                    const increasedFees = stark.estimatedFeeToMaxFee(estimationFees.suggestedMaxFee, 50)
                    const res = await sessionAccount.execute(
                        increaseCall,
                        {
                            version: 1,
                            maxFee: 224005303668n
                        }
                    );
                    console.log("decrease", { res });
                    setCounter(counter - 1n);
                    const txR = await provider.waitForTransaction(res.transaction_hash, { retryInterval: 2000 });
                    setIsNewTxAuthorized(true);
                    if (txR.isSuccess()) {
                        setRemainingFee(remainingFee - BigInt((txR.value as SuccessfulTransactionReceiptResponse).actual_fee.amount));
                    }
                }
            } catch (err: any) {
                setIsNewTxAuthorized(true);
                throw new Error(err);
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
        console.log("#####address changed =", sessionKey, address, sessionAccount);
        async function sessionReq() {
            if ((sessionKey !== undefined) && address && (sessionAccount === undefined)) {
                console.log("address changed and test OK");

                const endDate: number = Math.floor((Date.now() + 1000 * 60 * duration) / 1000);
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
                    const txV = sessionAccount0.transactionVersion;
                    console.log("tx version =", txV);
                    setSessionAccount(sessionAccount0);
                    console.log("sessionAccount Created");
                    setIsSessionSigned(true);
                }
            }


            // This transaction failed as the cosigner could not provide a valid signature. Please contact support.
        }
        sessionReq().catch(console.error);

        return () => { }
    },
        [address, sessionKey, chain.id, sessionAccount]
    );

    // timer for remaining time of session
    useEffect(() => {
        async function sessionTimer() {
            // console.log("sessionTimer");
            if (dateEndSession) {
                const now = Math.floor(Date.now() / 1000);
                setRemainingTime((dateEndSession - now) / 60);
            }
        }
        sessionTimer()
        const tim = setInterval(() => {
            sessionTimer()
            console.log("remaining timerId=", tim);
        }
            , 10 * 1_000 //ms
        );
        console.log("remaining startTimer", tim);

        return () => {
            clearInterval(tim);
            console.log("remaining stopTimer", tim);
        }
    }
        , [dateEndSession]);


    return (
        <>
            {isSessionSigned ? (
                <Center>
                    <VStack>
                        <Text textAlign={"center"}>
                            {/* {isSuccess ? "getCounterOK" : "Err getCounter" } */}
                            <br></br>
                            Session using fees from your own account.
                            <br></br>
                            Remaining fees in this session : {" "}
                            <span className={remainingFee < (10n ** 13n) ? styles.red : ""}>
                                {formatBalance(remainingFee, 18) + " "}
                                STRK
                            </span>
                            <br></br>
                            Remaining time :{" "}<span className={remainingTime < 2 ? styles.red : ""}>
                                {remainingTime>0?remainingTime+"'":"Ended"}
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
                </Center>) :(
                    <Center color={"red"}>
                        Approve amount in Argent-X wallet...
                    </Center>
                )
            }
        </>
    )
}