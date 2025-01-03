"use client";
import { Button } from "@/components/ui/button";
import {
    SignSessionError,
    CreateSessionParams,
    createSession,
    buildSessionAccount,
    bytesToHexString,
    type SessionKey
} from "@argent/x-sessions"
import { useAccount, useProvider, useSignTypedData } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { constants, ec, stark, WalletAccount, type Signature, type TypedData } from "starknet"

export default function OwnSession() {
    const [sessionKey, setSessionKey] = useState<SessionKey | undefined>(undefined);
    // const [signature, setSignature]=useState<Signature|undefined>(undefined);
    const {provider}=useProvider();
    const { connector } = useAccount();

    // const myTypedData: TypedData = {
    //     domain: {
    //         name: "Example DApp",
    //         chainId: constants.StarknetChainId.SN_SEPOLIA,
    //         // chainId: '0x534e5f5345504f4c4941',
    //         version: "0.0.3",
    //     },
    //     types: {
    //         StarkNetDomain: [
    //             { name: "name", type: "string" },
    //             { name: "chainId", type: "felt" },
    //             { name: "version", type: "string" },
    //         ],
    //         Message: [{ name: "message", type: "felt" }],
    //     },
    //     primaryType: "Message",
    //     message: {
    //         message: "1235",
    //     },
    // };
    // const { data, signTypedDataAsync } = useSignTypedData({ params: myTypedData });

    // async function sign() {
    //     //const myWalletAccount=WalletAccount.connect({nodeUrl:"http://127.0.0.1:5050/rpc"},)
    //     const a = await signTypedDataAsync(myTypedData);
    //     console.log({ data }, a);
    //     setSignature(a);

    // }

    useEffect(() => {
        const privateKey = stark.randomAddress();
        const sessionKey: SessionKey = {
            privateKey, //string
            publicKey: ec.starkCurve.getStarkKey(privateKey), //string
        };
        setSessionKey(sessionKey);

        return () => { }
    },
        []
    );


    return (
        <>
            
            
        </>
    )
}