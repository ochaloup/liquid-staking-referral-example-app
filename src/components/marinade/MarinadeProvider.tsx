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
    // node ~/liquid-staking-referral-cli/dist/marinade-referral.js -c http://localhost:8899 show `solana-keygen pubkey keys/referral-state.json`
    const referralCode = new web3.PublicKey('CRiqV9QCSJ2GLrMDSE8yi9MzSzMvNY2fActLQXdxz2fv')  // referral account / referral-keypair from setup-referral
    // !!! Then uncomment the `referralCode` configuration option !!!

    const localConnection = new web3.Connection("http://localhost:8899")
    const config = new MarinadeConfig({
      connection: localConnection,
      publicKey,  // wallet pubkey
      marinadeFinanceProgramId: new web3.PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),  // this is default value
      marinadeReferralProgramId: new web3.PublicKey('NTxC2LBrYLBtCmzTUJCWTxiHMYCJfeiEgzkhxCaGM3S'),  // solana-keygen pubkey ~/marinade/liquid-staking-referral-program/target/deploy/marinade_referral-keypair.json
      marinadeStateAddress: new web3.PublicKey('J797wwZfauQivM4VUSzFUPRTpaXTrRtnV6tjvgt3fozH'),  // marinade instance; cat ~/marinade/marinade-anchor/keys/instance.pubkey
      marinadeReferralGlobalStateAddress: new web3.PublicKey('AR9emZP2faAG9NAM5nKvPt2j9w4piU2d5VpeA8TGy7vA'), // solana-keygen pubkey ~/marinade/liquid-staking-referral-cli/keys/global.json
      referralCode,   // partner referral state account
      tokenPartnerAccount: new web3.PublicKey('FYXVvGAhRhFw2M5MTMV8AkGoYRx4KuC7bpne7pMifRmN'), // partner ATA account; node dist/marinade-referral.js -c http://localhost:8899 show `solana-keygen pubkey ~/marinade/liquid-staking-referral-cli/keys/referral-state.json`
    })
    const marinade = new Marinade(config)

    setMarinade(marinade)
  }, [connection, publicKey])

  return <MarinadeContext.Provider value={{ marinade }}>
    {children}
  </MarinadeContext.Provider>
}
