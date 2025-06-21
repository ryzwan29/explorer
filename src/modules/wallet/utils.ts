import { useDashboard } from "@/stores"
import type { Coin } from "@/types"
import { fromBech32, toBech32 } from "@cosmjs/encoding"

export interface AccountEntry {
  chainName: string,
  logo: string,
  address: string,
  coinType: string,
  endpoint?: string,
  compatiable?: boolean,
}

export interface LocalKey {
  cosmosAddress: string, hdPath: string
}

export function scanLocalKeys() {
  const connected = [] as LocalKey[]
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith("m/44")) {
      const wallet = JSON.parse(localStorage.getItem(key) || "")
      if (wallet) {
        connected.push(wallet)
      }
    }
  }
  return connected
}

export function scanCompatibleAccounts(keys: LocalKey[]) {
  const dashboard = useDashboard()
  const available = [] as AccountEntry[]
  keys.forEach(wallet => {
    Object.values(dashboard.chains).forEach(chain => {
      available.push({
        chainName: chain.chainName,
        logo: chain.logo,
        // Ganti prefix doang, data tetap sama
        address: wallet.cosmosAddress.replace(/^([a-z]+1)/, `${chain.bech32Prefix}1`),
        coinType: chain.coinType,
        compatiable: wallet.hdPath.indexOf(chain.coinType) > 0,
        endpoint: chain.endpoints.rest?.at(0)?.address
      })
    })
  })
  return available
}
