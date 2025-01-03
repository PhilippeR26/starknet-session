"use server";

import Image from 'next/image'
import styles from './page.module.css'
import { Center, Text } from '@chakra-ui/react';
import starknetJsImg from "../public/Images/StarkNet-JS_logo.png";
import argentImg from "../public/Images/ArgentLogo.png";
import starknetReactImg from "../public/Images/starknet-react.png";
import { DisplayConnected } from './components/client/DisplayConnected';
import LowerBanner from './components/client/LowerBanner';

export default async function Page() {

    return (
        <div>
            <p className={styles.bgText}>
                Test Starknet session
            </p>
            <Center>
                <Image src={starknetReactImg} alt='starknet-react' height={150} />
                <Text px={4}></Text>
                <Image src={starknetJsImg} alt='starknet.js' height={150} />
            </Center>
            <Center pt="3">
                <Image src={argentImg} alt='ArgentX' height={65} />
            </Center>
            <p className={styles.bgText}>
                Please connect an ArgentX wallet that uses Starknet Devnet-rs network
            </p>
            <Center>
            Use a fork of Testnet
            </Center>
            <div>
                <DisplayConnected></DisplayConnected>
            </div>
            <LowerBanner></LowerBanner>
        </div >
    )
}

