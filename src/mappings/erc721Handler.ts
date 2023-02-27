// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  AvalancheLog,
} from "@subql/types-avalanche";
import {
  ERC721Transfer,
  
} from "../types";
import { ApprovalEvent, ApprovalForAllEvent, TransferEvent } from "../contracts/Erc721";
import { Erc721__factory } from "../contracts";
import { provider } from "../fetch/constants";
import { fetchERC721, fetchERC721Operator, fetchERC721Token } from "../fetch/erc721";
import { fetchAccount } from "../fetch/account";
import { constants } from "ethers";

export async function handle721Transfer(log: AvalancheLog<TransferEvent['args']>): Promise<void> {
  
  if(log.args){

    const erc721ContractFactory=Erc721__factory.connect(log.address,provider())
    
    let contract=await fetchERC721(log.address,erc721ContractFactory,log.blockNumber)
    if(contract!=null){

      let [from,to]=await Promise.all([
        await fetchAccount(log.args.from),
        await fetchAccount(log.args.to)
      ]) 

      let minter="false";
      if(log.args.from==constants.AddressZero){
        minter=log.args.to
      }
      let token=await fetchERC721Token(contract,log.args.tokenId.toBigInt(),erc721ContractFactory,log.blockNumber,minter)

      token.ownerId=to.id
      token.approvalId=(await fetchAccount(constants.AddressZero)).id
      await token.save()

      let ev=new ERC721Transfer(`${log.transactionHash}-${log.logIndex}`)
      ev.emitterId=contract.id
      
      ev.transaction=log.transactionHash

     // ev.blockNumber=BigInt(log.blockNumber)

      ev.timestamp=log.block.timestamp
      ev.contractId=contract.id
      ev.tokenId=token.id
      ev.fromId=from.id
      ev.toId=to.id

      await ev.save()
    }
  }
  
}



  export async function handle721Approval(log: AvalancheLog<ApprovalEvent['args']>): Promise<void> {
  
  if(log.args){
    const erc721ContractFactory=Erc721__factory.connect(log.address,provider())
  
    let contract=await fetchERC721(log.address,erc721ContractFactory,log.blockNumber)

    if(contract!==null){

      let [token,owner,approved]=await Promise.all([
        await fetchERC721Token(contract,log.args.tokenId.toBigInt(),erc721ContractFactory,log.blockNumber),
        await fetchAccount(log.args.owner),
        await fetchAccount(log.args.approved)
      ])

      token.ownerId=owner.id
      token.approvalId=approved.id

      await token.save()
      await owner.save()
      await approved.save()
    }

  }
}


export async function handle721ApprovalForAll(log: AvalancheLog<ApprovalForAllEvent['args']>): Promise<void> {
  
  if(log.args){
    const erc721ContractFactory=Erc721__factory.connect(log.address,provider())
  
    let contract=await fetchERC721(log.address,erc721ContractFactory,log.blockNumber)

    if(contract!==null){
      let [owner,operator]=await Promise.all([
        await fetchAccount(log.args.owner),
        await fetchAccount(log.args.operator)
      ])
     
      let delegation=await fetchERC721Operator(contract,owner,operator)

      delegation.approved=log.args.approved

      await delegation.save()

    }

  }
}

