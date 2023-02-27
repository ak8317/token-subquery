// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  AvalancheLog,
} from "@subql/types-avalanche";
import {
  ERC20Transfer,
} from "../types";
import * as ERC20 from "../contracts/Erc20";
import { Erc20__factory } from "../contracts";
import { fetchERC20, fetchERC20Approval, fetchERC20Balance } from "../fetch/erc20";
import {  provider, toDecimals } from "../fetch/constants";
import {  constants } from "ethers";
import { fetchAccount } from "../fetch/account";

export async function handleTransfer(log: AvalancheLog<ERC20.TransferEvent['args']>): Promise<void> {

  if(log.args){
   

    const {from,to,value} = log.args


    const erc20ContractFactory=Erc20__factory.connect(log.address,provider())
   
    let contract=await fetchERC20(log.address,erc20ContractFactory,log.blockNumber)

    let ev=new ERC20Transfer(`${log.transactionHash}-${log.logIndex}`)
    ev.emitterId=contract.id
    
    ev.transaction=log.transactionHash
   //ev.blockNumber=BigInt(log.blockNumber)

    ev.timestamp=log.block.timestamp
    ev.contractId=contract.id
   
    ev.value=toDecimals(value.toBigInt(),contract.decimals)
    
    ev.valueExact=value.toBigInt()
   
 
    if(from == constants.AddressZero){
     
      let totalSupply=await fetchERC20Balance(contract,null)
     
      totalSupply.valueExact=totalSupply.valueExact+value.toBigInt()
    
      totalSupply.value=toDecimals(totalSupply.valueExact,contract.decimals)
     
      await totalSupply.save()
    }else{
    
      let fromAddress=await fetchAccount(from)
      let balance=await fetchERC20Balance(contract,fromAddress)
      balance.valueExact=balance.valueExact-value.toBigInt()
      balance.value=toDecimals(balance.valueExact,contract.decimals)
      await balance.save()
  
      ev.fromId=fromAddress.id
      ev.fromBalanceId=balance.id
    }
   
    if(to== constants.AddressZero){
      let totalSupply=await fetchERC20Balance(contract,null)
      totalSupply.valueExact=totalSupply.valueExact-value.toBigInt()
      totalSupply.value=toDecimals(totalSupply.valueExact,contract.decimals)
      await totalSupply.save()
    }else{
      let toAddress=await fetchAccount(to)
      let balance=await fetchERC20Balance(contract,toAddress)
      balance.valueExact=balance.valueExact+value.toBigInt()
      balance.value=toDecimals(balance.valueExact,contract.decimals)
      await balance.save()
  
      ev.toId=toAddress.id
      ev.toBalanceId=balance.id
    }
  
    await ev.save()
  }
 
}



export async function handleApproval(log:AvalancheLog<ERC20.ApprovalEvent['args']>):Promise<void>{
  
  if(log.args){

    const erc20ContractFactory=Erc20__factory.connect(log.address,provider())
    
    let [contract,owner,spender]=await Promise.all([
      await fetchERC20(log.address,erc20ContractFactory,log.blockNumber),
      await fetchAccount(log.args.owner),
      await fetchAccount(log.args.spender)
    ])
    let approval=await fetchERC20Approval(contract,owner,spender)
    approval.valueExact=log.args.value.toBigInt()
    approval.value=toDecimals(log.args.value.toBigInt(),contract.decimals)
    await approval.save()

  }
}