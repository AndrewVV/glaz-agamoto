'use strict';
const TelegramBot = require('node-telegram-bot-api');
const token = '843315365:AAH0u3DC01ulc-AC0_r6hTD9Gf2QHI8Hn5A';
const bot = new TelegramBot(token, {polling: true});

let fs = require('fs');
const express = require('express');
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');
const Http = require('http');
const Https = require('https');
class GlazAgamoto{
    constructor(){
        this.app = express();
        this.httpServer = Http.createServer(this.app);
        this.init();
    }

    init(){
        return new Promise(async(resolve,reject)=>{
            try{
                let contract= await this.getContractAddress();
                let abi = await this.getContractAbi();
                let Contract= new this.web3ws.eth.Contract(
                    abi);
                Contract.options.address=contract;
                this.contract = Contract;
                this.validator.validateObject(this.contract, 'Smart Contract');
                this.run();
                return resolve(true);
            }catch (e) {
                return reject(e);
            }
        });
    }
    run(){
        try{
            // run server
            this.httpServer.listen(process.env.PORT, (err) => {
                this.debug(`server is listening on `+process.env.PORT)
            });

            bot.onText(/\/echo (.+)/, (msg, match) => {
                const resp = match[1];
                bot.sendMessage(chatId, resp);
            });

            bot.on('message', (msg) => {
                if (msg.text == '/start') {
                bot.sendMessage(chatId, 'write the amount of transaction which you want to follow')
                }

                if (msg.text == 10000) {
                bot.sendMessage(chatId, 'amount confirmed');
                bot.sendMessage(chatId, 'write address which you want to follow');
                }
            
                if (msg.text == '0x60CD5836659E53F1BBFF7131F82F9a95EF4D0c1f') {
                bot.sendMessage(chatId, 'address confirmed');
                bot.sendMessage(chatId, 'you will get a transaction > 10000 tokens from address: 0x60CD5836659E53F1BBFF7131F82F9a95EF4D0c1f');
                }
            });
                   
            this.app.post('/eth/create-address', async(request,response)=>{
                try{
                    let result = await this.web3http.eth.accounts.create('');
                    let address = result.address;
                    if(result.privateKey.substr(0, 2)==='0x'){
                        result.privateKey= result.privateKey.substr(2,result.privateKey.length);
                    }else{
                        throw new Error('Invalid private key');
                    }
                    this.validator.validateEthAddress(address);

                    let addressSaved = await this.userAccountManager.addAccount(address);
                    response.send(result);
                }catch (e) {
                    response.send(e.message);
                }
            });
 
 			this.app.post('/wrc/get-new-kitov',async(request,response)=>{
                 try{
                    let data = this.processRequestData(request);
                 	let from = data.from;
                    let result = await this.supervisedTransactionManager.getAllFromTransactions(from);
                    from = result[0].from;
                    console.log(from);
                    let to = result[0].to;
                    console.log(to);
                    let amount = result[0].amount;
                    console.log(amount);
                    let txHash = result[0].txHash;
                    console.log(txHash);
                    response.send(result);
                 }catch (e) {
                    this.logger.logError(ETH_PROXY_SUBJECT,e.message,e);
                    response.send(e.message);
                 }
            });

            let TransferEvent = this.contract.events.Transfer({},
                async(error,eventData)=>
                {
                    try{
                        if(!error)
                        {
                            this.logger.logEvent(ETH_PROXY_SUBJECT,'Transfer Event',[eventData.returnValues,eventData.transactionHash]);
                            let args = eventData.returnValues;
                            let _from = args.from;
                            let _to = args.to;
                            let _amount = this.toFixedBigValue(args.value);
                            let minInterestAmount = 10000;
                            minInterestAmount - this.formatToDecimals(minInterestAmount);
                            minInterestAmount = this.toFixedBigValue(minInterestAmount);
                            let _hash = eventData.transactionHash;

                            this.validator.validateEthAddress(args.to,'To Address');
                            this.validator.validateEthAddress(args.from,'From Address');
                            this.validator.validateString(_hash,'TxHash');
                            this.validator.validateNumber(_amount);
                            console.log("---------AMOUNT= "+ _amount +"-------FROM="+_from);
                            _amount = this.formatToDecimals(_amount);

                            let result = false;
                            if(_amount>minInterestAmount){
                                this.callFromAnrew(_amount, _from);
                                console.log("-----AMOUNT-------------" + _amount);
                                console.log(await this.supervisedTransactionManager.addTransaction(_hash,_from,_to,_amount, this.supervisedTransactionManager.TOPIC_E2C ));
                            }else{
                                this.callSmallAmount();
                            	console.log("AMOUNT--LESS--THAN---minInterestAmount")
                            }
                        }else
                        {
                            return false;
                        }
                    }catch (e) {
                        return false;
                    }
                });
        }catch(e){
        }
    }

    callFromAnrew(amount, address) {
        bot.on('message', (msg) => {
            console.log("---------AMOUNT======= "+ amount +"-------FROM======"+address);
            bot.sendMessage(chatId, 'transaction from ' + address + " on sum " + amount + " tokens was sended");
        })
    };

    callSmallAmount() {
        bot.on('message', (msg) => {
            bot.sendMessage(chatId, "AMOUNT  LESS THAN YOUR AMOUNT");
        })
    };

    formatToDecimals(amount)
    {
        return amount/Math.pow(10,18).toFixed(8);
    }

    formatFromDecimals(amount)
    {
        amount=parseFloat(amount);
        return amount*Math.pow(10,18).toFixed(8);
    };

    toFixedBigValue(x) {
        if (Math.abs(x) < 1.0) {
            let e = parseInt(x.toString().split('e-')[1]);
            if (e) {
                x *= Math.pow(10,e-1);
                x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
            }
        } else {
            let e = parseInt(x.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                x /= Math.pow(10,e);
                x += (new Array(e+1)).join('0');
            }
        }
        return x;
    }
};
