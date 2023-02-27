
  import { constants } from "ethers";
  import { Erc721 } from "../contracts";
  import {
      Account,
      ERC721Contract,
      ERC721Token,
      ERC721Operator
    } from "../types";
  import { fetchAccount } from "./account";
  import { supportsInterface } from "./erc165";
  
  
  
  export const fetchERC721=async(address:string,erc721ContractFactory:Erc721,blockNumber:number,owner:string="false"):Promise<ERC721Contract | null>  =>{
      let contract=await ERC721Contract.get(address)
  
      if(contract != null){
          return contract
      }
  
    //   let detectionId=address.concat('80ac58cd')
    //   let detectionAccount=await Account.get(detectionId)
  
    //   if(detectionAccount==null){
    //       detectionAccount=new Account(detectionId)
    //       let introspection_01ffc9a7 = await supportsInterface(erc721ContractFactory, '01ffc9a7') // ERC165
    //   	let introspection_80ac58cd = await supportsInterface(erc721ContractFactory, '80ac58cd') // ERC721
    //   	let introspection_00000000 = await supportsInterface(erc721ContractFactory, '00000000', false)
    //   	let isERC721               = introspection_01ffc9a7 && introspection_80ac58cd && introspection_00000000
    //   	detectionAccount.asERC721  = isERC721 ? true : false
    //   	await detectionAccount.save()
    //   }
      
    // if (detectionAccount.asERC721) {
          const contractAccount=await fetchAccount(address)
          const [name,symbol]=await Promise.all([
            await try_name(erc721ContractFactory),
            await try_symbol(erc721ContractFactory),
          ])
          contract=new ERC721Contract(address)
          contract.name=name
          contract.symbol=symbol
          contract.supportsMetadata=true

          
          contract.asAccountId=contractAccount.id
          
          contract.supportsMetadata = await supportsInterface(erc721ContractFactory, '5b5e139f') // ERC721Metadata
          
        
          //contract.blockNumber=BigInt(blockNumber)
          await contract.save()
        
          contractAccount.asERC721Id=contract.id
          await contractAccount.save()
     // }
  
  return contract
  
  }
  
  export const fetchERC721Token=async(contract:ERC721Contract,identifier:bigint,erc721ContractFactory:Erc721,blockNumber:number,minter:string="false"):Promise<ERC721Token>=>{
  
      let id=contract.id.concat('/').concat(identifier.toString())
  
      let token=await ERC721Token.get(id)
  
      if(token==null){
          token=new ERC721Token(id)
          token.contractId=contract.id
          token.identifier=identifier
          token.approvalId=(await fetchAccount(constants.AddressZero)).id
        
          
          if(contract.supportsMetadata){
              let tokenURI=await erc721ContractFactory.tokenURI(identifier.toString())
              token.uri=tokenURI
          }
          //token.blockNumber=BigInt(blockNumber)
          if(minter && minter!=="false"){
            token.minter=minter
            token.blockNumer_minted=BigInt(blockNumber)
          }
      }
      return token
  }
  
   const try_name=async(erc721ContractFactory:Erc721):Promise<string>=>{
  
      try {
          const name=await erc721ContractFactory.name()
          
          return name
      } catch (error) {
          return ''
      }
  }
  
  
   const try_symbol=async(erc721ContractFactory:Erc721):Promise<string>=>{
  
      try {
          
          const symbol=await erc721ContractFactory.symbol()
          return symbol
      } catch (error) {
        
          return ''
      }
  }

  export const fetchERC721Operator=async(contract:ERC721Contract,owner:Account,operator:Account):Promise<ERC721Operator>=>{
  
      let id=contract.id.concat('/').concat(owner.id).concat('/').concat(operator.id)
  
      let op=await ERC721Operator.get(id)
  
      if(op==null){
          op=new ERC721Operator(id)
          op.contractId=contract.id
          op.ownerId=owner.id
          op.operatorId=operator.id
      }
      return op 
  
  }