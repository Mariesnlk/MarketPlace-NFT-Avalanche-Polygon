import '../styles/globals.css'
import './app.css'
import Link from 'next/link'

// function MyApp({ Component, pageProps }) {
//   return <Component {...pageProps} />
// }

// export default MyApp

function KryptoPaintMarketplace({ Component, pageProps }) {
    return (
        <div>
            <nav className='border-b p-6' style={{ backgroundColor: 'purple' }}>
                <p className='text-4x1 font-bold text-white' > KryptoPaintz Marketplace </p>
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