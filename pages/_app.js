import '../styles/globals.css'
import './app.css'
import Link from 'next/link'

function KryptoPaintMarketplace({ Component, pageProps }) {
    return (
        <div>
            <nav className='border-b-4 p-6' style={{ backgroundColor: 'light' }}>
                { /* Tailwind library */}
                <div className='flex mt-4 justify-center' >
                    <Link href='/' >
                        <a className='mr-4' >Main Marketplace </a>
                    </Link>
                    { /* a componenet */}
                    <Link href='/mint-item'>
                        <a className='mr-6'>Mint Paintz </a>
                    </Link>
                    <Link href='/my-nfts' >
                        <a className='mr-6' > My NFTs </a>
                    </Link>
                    <Link href='/account-dashboard' >
                        <a className='mr-6' >Account Dashboard </a>
                    </Link>
                </div>
            </nav>
            <Component {...pageProps} />
        </div>
    )
}

export default KryptoPaintMarketplace