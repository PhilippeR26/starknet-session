"use server";

import Image from 'next/image'
import styles from './page.module.css'
import { Center, Text } from '@chakra-ui/react';

// import starknetJsImg from "../../public/Images/StarkNet-JS_logo.png";
import LowerBanner from '@/app/(site)/components/client/LowerBanner';

export default async function Page() {

    return (
            <div>
                <p className={styles.bgText}>
                    Starknet-Sessions
                </p>
                {/* <Center>
                    <Image src={starknetReactImg} alt='starknet.js' height={150} /> 
                    
                </Center> */}
                <p className={styles.bgText}>
                    Please connect to Devnet-rs
                </p>
                <div>
                    
                </div>
                <LowerBanner></LowerBanner>
            </div >
    )
}

