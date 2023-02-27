import { Erc1155 } from "../contracts";
import { ERC1155Contract,ERC1155Token,ERC1155Balance,Account ,ERC1155Operator} from "../types";
import { fetchAccount } from "./account";
import { constants } from "./constants";

export const fetchERC1155=async(address:string,blockNumber:number,owner:string="false"):Promise<ERC1155Contract>=>{
    let contract=await ERC1155Contract.get(address)

    if(contract==null){
        let account=await fetchAccount(address)
       

        contract=new ERC1155Contract(address)
        contract.asAccountId=address
         // contract.blockNumber=BigInt(blockNumber)
        await contract.save()

        account.asERC1155Id=contract.id
        await account.save()
    }

    return contract
}

export const fetchERC1155Token=async(contract:ERC1155Contract,identifier:bigint,erc1155ContractFactory:Erc1155,blockNumber:number,minter:string="false"):Promise<ERC1155Token> =>{
    let id=contract.id.concat('/').concat(identifier.toString())
    let token=await ERC1155Token.get(id)

    if(token==null){
        let uri=await try_uri(identifier,erc1155ContractFactory)
        token=new ERC1155Token(id)
        token.contractId=contract.id
        token.identifier=identifier
        await token.save()
        token.totalSupplyId=(await fetchERC1155Balance(token,null)).id
        token.uri=uri
       // token.blockNumber=BigInt(blockNumber)
        if(minter && minter!=="false"){
            token.minter=minter
            token.blockNumer_minted=BigInt(blockNumber)
          }
        await token.save()
    }
    return token
}

export const fetchERC1155Balance=async(token:ERC1155Token,account:Account | null):Promise<ERC1155Balance> =>{
    
    let id=token.id.concat('/').concat(account?account.id:'totalSupply')
    let balance=await ERC1155Balance.get(id)

    if(balance==null){
        balance=new ERC1155Balance(id)
        balance.contractId=token.contractId
        balance.tokenId=token.id
        balance.accountId=account?account.id:null
        balance.value=0
        balance.valueExact=constants.BIGINT_ZERO

        await balance.save()
    }

    return balance
}

export const fetchERC1155Operator=async(contract:ERC1155Contract,owner:Account,operator:Account):Promise<ERC1155Operator> =>{
    
    let id=contract.id.concat('/').concat(owner.id).concat('/').concat(operator.id)
    let op=await ERC1155Operator.get(id)

    if(op==null){
        op=new ERC1155Operator(id)
        op.contractId=contract.id
        op.ownerId=owner.id
        op.operatorId=operator.id
    }
    return op

}
const try_uri=async(identifier:bigint,erc1155ContractFactory:Erc1155):Promise<string>=>{

    try {
        
        const uri=await erc1155ContractFactory.uri(identifier)
        return uri
    } catch (error) {
        return ''
    }
}