const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
        .toString();
    };

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1 ).join("1")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("BlOCK MINED : " + this.hash());
    }

    hasValidTransaction(){
        for (const tx of this.transactions) {
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
};

class BlockChain {
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    createGenesisBlock(){
        return new Block(Date.now(), "Genesis Block", "0")
    };
    
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    };
    minePendingTransactions(miningRewardAddr){
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock.hash());
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined.");
        this.chain.push(block);
        this.pendingTransactions[
            new Transaction(null, miningRewardAddr, this.miningReward)
        ];
    };
    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include a from and to address.');
        }
        if (!transaction.isValid()){
            throw new Error('Transaction is invalid in chain.');
        }
        this.pendingTransactions.push(transaction);
    };
    getBalanceOfAddress(address){
        let balance = 0;
        for (const block of this.chain){
            for (const trans of block.transactions){
                if (trans.fromAddress === address){
                    balance -= trans.amount;
                }
                if (trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    };
    verifyChainIntegrity(){
        for(let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i -1];
        }
        if(!currentBlock.hasValidTransaction()){
            return false;
        }
        if(currentBlock.hash !== currentBlock.calculateHash()) {
            return false;
        }
        if (currentBlock.previousHash !== previousBlock.hash()){
            return false;
        }
        return true;
    }
};

class Transaction {
    constructor (fromAddress, toAddress, amount, timestamp) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount; 
        this.timestamp = timestamp;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if (signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('Can\'t sign transactions for other wallets.');
        }
        
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0){
            throw new Error('No signature in Transaction.');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
};

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
