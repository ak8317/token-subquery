import { AvalancheLog } from "@subql/types-avalanche";
import { constants } from "ethers";
import { Erc1155__factory } from "../contracts";
import { ApprovalForAllEvent, TransferBatchEvent, TransferSingleEvent, URIEvent } from "../contracts/Erc1155";
import { fetchAccount } from "../fetch/account";
import { provider, toDecimals } from "../fetch/constants";
import {
  fetchERC1155,
  fetchERC1155Balance,
  fetchERC1155Operator,
  fetchERC1155Token,
} from "../fetch/erc1155";
import { Account, ERC1155Contract, ERC1155Transfer } from "../types";

async function registerTransfer(
    log: AvalancheLog,
    suffix: string,
    contract: ERC1155Contract,
    operator: Account,
    id: bigint,
    value: bigint
  ): Promise<void> {

    const [from,to]=await Promise.all([
      await fetchAccount(log.args.from),
      await fetchAccount(log.args.to)
    ])

    const erc1155ContractFactory = Erc1155__factory.connect(
      log.address,
      provider()
    );
    let minter="false";
    if(log.args.from==constants.AddressZero){
      minter=log.args.to
    }
    let token = await fetchERC1155Token(contract, id, erc1155ContractFactory,log.blockNumber,minter);
    let ev = new ERC1155Transfer(`${log.transactionHash}-${log.logIndex}-${suffix}`);
    ev.emitterId = token.contractId;

    
    ev.transaction = log.transactionHash;

   // ev.blockNumber=BigInt(log.blockNumber)
    ev.timestamp = log.block.timestamp;
    ev.contractId = contract.id;
    ev.tokenId = token.id;
    ev.operatorId = operator.id;
    ev.value = toDecimals(value);
    ev.valueExact = value;
  
    if (from.id == constants.AddressZero) {
      let totalSupply = await fetchERC1155Balance(token, null);
      totalSupply.valueExact = totalSupply.valueExact + value;
      totalSupply.value = toDecimals(totalSupply.valueExact);
  
      await totalSupply.save();
    } else {
      let balance = await fetchERC1155Balance(token, from);
      balance.valueExact = balance.valueExact - value;
      balance.value = toDecimals(balance.valueExact);
      await balance.save();
  
      ev.fromId = from.id;
      ev.fromBalanceId = balance.id;
    }
  
    if (to.id == constants.AddressZero) {
      let totalSupply = await fetchERC1155Balance(token, null);
      totalSupply.valueExact = totalSupply.valueExact - value;
      totalSupply.value = toDecimals(totalSupply.valueExact);
  
      await totalSupply.save();
    } else {
      let balance = await fetchERC1155Balance(token, from);
      balance.valueExact = balance.valueExact + value;
      balance.value = toDecimals(balance.valueExact);
      await balance.save();
  
      ev.toId = to.id;
      ev.toBalanceId = balance.id;
    }
    await token.save();
    await ev.save();
  }

export async function handle1155TransferSingle(
  log: AvalancheLog<TransferSingleEvent["args"]>
): Promise<void> {
  if (log.args) {

    let [contract,operator]=await Promise.all([
      await fetchERC1155(log.address,log.blockNumber),
      await fetchAccount(log.args.operator)
    ])
    await registerTransfer(
      log,
      "",
      contract,
      operator,
      log.args.id.toBigInt(),
      log.args.value.toBigInt()
    );
  }
}

export async function handle1155TransferBatch(
    log: AvalancheLog<TransferBatchEvent["args"]>
  ): Promise<void> {
    if (log.args) {
      let [contract,operator]=await Promise.all([
        await fetchERC1155(log.address,log.blockNumber),
        await fetchAccount(log.args.operator)
      ])
        
      let ids=log.args.ids
      let values=log.args.values

      if(ids.length == values.length)
	{
		for (let i = 0;  i < ids.length; ++i)
		{
			await registerTransfer(
				log,
				"/".concat(i.toString()),
				contract,
				operator,
				ids[i].toBigInt(),
				values[i].toBigInt()
			)
		}
	}
  }
}

export async function handle1155ApprovalForAll(log:AvalancheLog<ApprovalForAllEvent['args']>):Promise<void>{
    if(log.args){
      let [contract,owner,operator]=await Promise.all([
        await fetchERC1155(log.address,log.blockNumber),
        await fetchAccount(log.args.account),
        await fetchAccount(log.args.operator)
      ])
        
        let delegation=await fetchERC1155Operator(contract,owner,operator)

        delegation.approved=log.args.approved

        await delegation.save()
    }
}

export async function handle1155URI(log:AvalancheLog<URIEvent['args']>):Promise<void>{
    if(log.args){
       
       const erc1155ContractFactory = Erc1155__factory.connect(
        log.address,
        provider()
      );
      let contract=await fetchERC1155(log.address,log.blockNumber)
       let token=await fetchERC1155Token(contract,log.args.id.toBigInt(),erc1155ContractFactory,log.blockNumber)
        token.uri=log.args.value

        await token.save()
    }
}