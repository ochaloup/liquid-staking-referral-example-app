import { Marinade, MarinadeConfig, web3 } from '@marinade.finance/marinade-ts-sdk'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import React, { Context, createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'

export interface MarinadeContext {
  marinade: Marinade | null
}

const defaultContext: MarinadeContext = { marinade: null }
const MarinadeContext: Context<MarinadeContext> = createContext(defaultContext)

export const useMarinade = () => useContext(MarinadeContext)

interface MarinadeProviderProps {
  children: ReactNode
}

export const MarinadeProvider: FC<MarinadeProviderProps> = ({ children }) => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [marinade, setMarinade] = useState<Marinade | null>(null)

  useEffect(() => {
    if (!publicKey) {
      setMarinade(null)
      return
    }

    // !!! You have to put in your own Referral Code on the line below !!!
    const referralCode = new web3.PublicKey('CRiqV9QCSJ2GLrMDSE8yi9MzSzMvNY2fActLQXdxz2fv')  // partner referral account / referral-keypair from setup-referral
    // !!! Then uncomment the `referralCode` configuration option !!!

    const localConnection = new web3.Connection("http://localhost:8899")
    const config = new MarinadeConfig({
      connection: localConnection,
      publicKey,  // wallet pubkey
      marinadeFinanceProgramId: new web3.PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),  // this is default value
      marinadeReferralProgramId: new web3.PublicKey('NTxC2LBrYLBtCmzTUJCWTxiHMYCJfeiEgzkhxCaGM3S'),
      marinadeStateAddress: new web3.PublicKey('6d5c9xHMWWmwd8eFfvqhSnXdHMSYcJzwyPmXEpykqSxp'),  // marinade instance
      marinadeReferralGlobalStateAddress: new web3.PublicKey('AR9emZP2faAG9NAM5nKvPt2j9w4piU2d5VpeA8TGy7vA'),
      referralCode,   // partner referral state account
      referralPartnerAccount: new web3.PublicKey('2f7svTzicpawmpywwfnGfv5T8UxP2sb4yrTkePF4GQWL'), // partner beneficiary account (partner main account)
    })
    const marinade = new Marinade(config)

    setMarinade(marinade)
  }, [connection, publicKey])

  return <MarinadeContext.Provider value={{ marinade }}>
    {children}
  </MarinadeContext.Provider>
}
