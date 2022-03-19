import '../styles/Navbar.css'
import logo from '../img/logo.png'
import React from 'react'
import Link from 'next/link'
import { ethers } from "ethers"


export default class Navbar extends React.Component {

    async componentDidMount() {
        await this.connectWallet();
    }

    // Create a provider to interact with a smart contract
    async connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            console.log('Requesting account...');

            // Check if Meta Mask Extension exists 
            if (window.ethereum) {
                console.log('detected');

                try {
                    const accounts = await window.ethereum.request({
                        method: "eth_requestAccounts",
                    });
                    this.setState({ account: accounts[0] });
                    console.log(this.state.account);
                } catch (error) {
                    console.log('Error connecting...');
                }

            } else {
                alert('Meta Mask not detected');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            account: ''
        }
    }


    render() {
        return (
            <div>
                <nav className='bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-800'>
                    <div className='container flex flex-wrap justify-center items-center mx-auto border-b-2'>
                        <img src={logo} className='object-cover h-55 w-55 mr-12 mt-12 ml-12 text-xl' alt="logo" />
                        <Link href='/' >
                            <a className='mr-6 mt-6 text-2xl' >Main Marketplace </a>
                        </Link>
                        <Link href='/mint-item'>
                            <a className='mr-6 mt-6 text-2xl'>Mint Paintz </a>
                        </Link>
                        <Link href='/my-nfts' >
                            <a className='mr-6 mt-6 text-2xl'> My NFTs </a>
                        </Link>
                        <Link href='/account-dashboard' >
                            <a className='mr-6 mt-6 text-2xl'>Account Dashboard </a>
                        </Link>
                        {/* <span className='mr-6 mt-6 text-xl'>{this.state.account}</span> */}
                    </div>
                </nav>
            </div>
        )
    }
}