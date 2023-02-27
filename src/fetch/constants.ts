
import { providers } from "ethers"

export namespace constants {
	export let   BIGINT_ZERO      = BigInt(0)
	export let   BIGINT_ONE       = BigInt(1)
	// export let   BIGDECIMAL_ZERO  = new  BigNumber(constants.BIGINT_ZERO)
	// export let   BIGDECIMAL_ONE   = new  BigNumber(constants.BIGINT_ONE)
	// export const ADDRESS_ZERO     = Address.fromString('0x0000000000000000000000000000000000000000')
	// export const BYTES32_ZERO     = Bytes.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000000') as Bytes
}
export const toDecimals=(number:bigint,decimals:number=18) =>{
    return Number(number) / Math.pow(10,decimals)
}
const url="https://dcomm-validators.testnet.zeeve.net/ext/bc/ACT/rpc"
const avalancheURL="https://avalanche.api.onfinality.io/ext/bc/C/rpc?apikey=68dc4cfc-dd14-4eac-8b69-f0b30a3423cc"

export const provider=():providers.JsonRpcProvider=>{
	let customHttpProvider = new providers.JsonRpcProvider(avalancheURL);

	return customHttpProvider
}

