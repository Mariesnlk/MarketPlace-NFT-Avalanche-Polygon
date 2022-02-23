import { userState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import { nftaddress, nftmarketaddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KPMarket from '../artifacts/contracts/KPMarket.sol/KPMarket.json'

export default function MintPaint() {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()

    async function onChange(e) {
        const file = e.target.files[0]
        try {
            const added = await client.add(
                file, {
                progress: (prog) => console.log(`received: ${prog}`)
            })
            const url = `https://ipfs.infura.io:5001/api/v0/${added.path}`
            setFileUrl(url)
        } catch (error) {
            console.log("Error to upload file ", error)
        }
    }

    async function createMarket() {
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) return

        // upload to ipfs
        const data = JSON.stringify({
            name, description, image: fileUrl
        })

        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io:5001/api/v0/${added.path}`
            craeteSale(url)
        } catch (error) {
            console.log("Error to upload file ", error)
        }
    }

    async function craeteSale(url) {
        const web3Modal = new Web3Modal()
        const connaction = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connaction)
        const signer = provider.getSigner()

        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.mintToken(url)
        let tx = await transaction.wait()
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(nftmarketaddress, KPMarket.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.makeMarketItem(nftaddress, tokenId, price, { value: listingPrice })
        await transaction.wait()
        router.push('./')
    }

}