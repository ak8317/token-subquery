

import { Account } from "../types"

export async function fetchAccount(address: string): Promise<Account >{
	let account=await Account.get(address)

	if(!account){
		account=Account.create({
			id:address,
		})
	}
	await account.save()
	return account
}