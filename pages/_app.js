import './app.css'
import Link from 'next/link'

function KryptoPaintMarketplace({ Component, pageProps }) {
    return (
        <div>
            <nav className='bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-800'>
                { /* Tailwind library */}
                <div className='container flex flex-wrap justify-center items-center mx-auto border-b-2 mb-4'>
                    <span class="font-semibold text-2xl tracking-tight mr-12 mt-6 ">KRYPTOPAINTZ MARETPLACE</span>
                    <Link href='/' >
                        <a className='mr-6 mt-6 text-xl' >Main Marketplace </a>
                    </Link>
                    { /* a componenet */}
                    <Link href='/mint-item'>
                        <a className='mr-6 mt-6 text-xl'>Mint Paintz </a>
                    </Link>
                    <Link href='/my-nfts' >
                        <a className='mr-6 mt-6 text-xl'> My NFTs </a>
                    </Link>
                    <Link href='/account-dashboard' >
                        <a className='mr-6 mt-6 text-xl'>Account Dashboard </a>
                    </Link>
                </div>
            </nav>
            <Component {...pageProps} />
        </div>
    )
}

export default KryptoPaintMarketplace