import { Erc20 } from "../contracts"
import { ERC20Contract,Account,ERC20Balance,ERC20Approval } from "../types"
import { fetchAccount } from "./account"
import { constants } from "./constants"

export const fetchERC20=async(address:string,erc20ContractFactory:Erc20,blockNumber:number):Promise<ERC20Contract> =>{
    let contract=await ERC20Contract.get(address)
    
    if(!contract){
     
    const [name,symbol,decimals]=await Promise.all([
        await try_name(erc20ContractFactory),
        await try_symbol(erc20ContractFactory),
        await try_decimals(erc20ContractFactory)
    ])
     
      const contractAccount=await fetchAccount(address)
   
      contract=new ERC20Contract(address)
      contract.name=name
      contract.symbol=symbol
      contract.decimals=decimals
      contract.asAccountId=contractAccount.id

      //contract.blockNumber=BigInt(blockNumber)
      await contract.save()

      const totalSupply=await fetchERC20Balance(contract, null)
      contract.totalSupplyId=totalSupply.id
      
        await contract.save()

      contractAccount.asERC20Id=contract.id

      await contractAccount.save()
    }
  
    return contract
  }

  export async function  fetchERC20Balance(contract: ERC20Contract, account: Account | null): Promise<ERC20Balance> {
   
    let id      = contract.id.concat('/').concat(account ? account.id : 'totalSupply')
    let balance = await ERC20Balance.get(id)
      
    if (balance == null) {
      balance                 = new ERC20Balance(id)
      balance.contractId        = contract.id
      balance.accountId         = account ? account.id : null
      balance.value           = 0
      balance.valueExact      = constants.BIGINT_ZERO
      await balance.save()
    }
  
    return balance 
  }

  export const try_name=async(erc20ContractFactory:Erc20):Promise<string>=>{

    try {
        const name=await erc20ContractFactory.name()
        
        return name
    } catch (error) {
        return ''
    }
}


export const try_symbol=async(erc20ContractFactory:Erc20):Promise<string>=>{

    try {
        
        const symbol=await erc20ContractFactory.symbol()
        return symbol
    } catch (error) {
        return ''
    }
}

export const try_decimals=async(erc20ContractFactory:Erc20):Promise<number>=>{

    try {
        
        const decimals=await erc20ContractFactory.decimals()
        return decimals
    } catch (error) {
        return 18
    }
}

export const fetchERC20Approval=async(contract:ERC20Contract,owner:Account,spender:Account):Promise<ERC20Approval>=>{

    let id=contract.id.concat('/').concat(owner.id).concat('/').concat(spender.id)

    let approval=await ERC20Approval.get(id)

    if(approval == null){
        approval=new ERC20Approval(id)
        approval.contractId=contract.id
        approval.ownerId=owner.id
        approval.spenderId=spender.id
        approval.value=0
        approval.valueExact=constants.BIGINT_ZERO
    }

    return approval
}