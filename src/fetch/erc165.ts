import { Erc1155, Erc721 } from "../contracts";

export async function supportsInterface(contractFactory:Erc721|Erc1155,interfaceId:string,expected:boolean=true):Promise<boolean>{
    try {
        let result=await contractFactory.supportsInterface(`0x${interfaceId}`)
    
        return result==expected
    } catch (error) {
        return false
    }
   
}