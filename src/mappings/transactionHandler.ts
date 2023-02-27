// SPDX-License-Identifier: Apache-2.0
import {
    
  
  } from "../types";
  import {
     AvalancheTransaction,
  
  } from "@subql/types-avalanche";
import { Erc1155__factory, Erc721__factory } from "../contracts";
import { provider } from "../fetch/constants";
import { supportsInterface } from "../fetch/erc165";
import { fetchERC721 } from "../fetch/erc721";
import { fetchERC1155 } from "../fetch/erc1155";


export async function handleTransaction(
    transaction: AvalancheTransaction
  ): Promise<void> {
      //check if contract is created and its ERC721
  if(transaction.from && transaction.to==null && transaction.receipt.status){
    //Contract Deployed transaction
    const address=transaction.receipt.contractAddress 
    const erc721ContractFactory=Erc721__factory.connect(address,provider())
    const erc1155ContractFactory = Erc1155__factory.connect(
      address,
      provider()
    );
    const isERC721=await supportsInterface(erc721ContractFactory, '80ac58cd')
    const isERC1155=await supportsInterface(erc1155ContractFactory, 'd9b67a26')
    if(isERC721){
     
      const erc721ContractEntity=await fetchERC721(address,erc721ContractFactory,transaction.blockNumber,transaction.from)
      await erc721ContractEntity.save()
    }
    if(isERC1155){
      const erc1155ContractEntity=await fetchERC1155(address,transaction.blockNumber,transaction.from)
      await erc1155ContractEntity.save()
    }

  }

  }