const express = require("express");
const moment = require("moment");

const mongoClient = require("mongodb").MongoClient;
const ObjectId = require('mongodb').ObjectId;
const dotenv = require("dotenv");
dotenv.config();
const config = require("../config.js");
const MONGODB_URI = config.mongodburi;
const jverify = require("../model/JWT.js");
const constants = require("../model/constants.js");
const merkleTree = require("../model/merkleTree.js");
var router = express.Router();
const Enum = require("enum");
const Web3 = require('web3');
const fs = require('fs');
const solc = require('solc');
var connectionURL = "https://rpc-mumbai.maticvigil.com/v1/7c71994fb9d6dd7154539e4a1dc56ff96e5f3508";//"https://ropsten.infura.io/v3/1f32a6562a8c4cae9f9d32c4ed179314";//"https://rinkeby.infura.io/v3/b140d24d3a5744e0b9b98848003f07fe";
const re = require('express/lib/response');
var web3 = new Web3(new Web3.providers.HttpProvider(connectionURL));
Enum.register();
var database = "";

mongoClient.connect(
    MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    function (error, client) {
        if (error) {
            throw error;
        }
        database = client.db(process.env.DATABASE);
    }
);
//varify jwt
// router.use('*', async (request, response, next) => {
//     if (!database) {
//         response.send("DB not initialized yet");
//         return;
//     } else {
//         if (request.method == "GET") {
//             next();
//         } else {
//             await jverify.validateToken(request, response).then((data) => {
//                 if (!data.status) {
//                     response.send({ msg: "Unauthenticated request", status: 0 });
//                     return;
//                 } else {
//                     next()
//                 }
//             });
//         }
//     }
// })
//API for country list
router.get("/getCountryList", async (req, res) => {

    database && database.collection(process.env.COUNTRY_LIST)
        .find({}).sort({ countryName: 1 }).toArray(async (error, result) => {
            if (error) {
                return res.send(error);
            }

            res.send(result);
        });
});
//API's to get  token details for user
router.get("/getTokenDetailsbyUser/:userId/:type/:pg", async (req, res) => {
    var pageNumber = parseInt(req.params.pg);
    var userId = req.params.userId;
    var inputTokenStandard=req.params.type;
    var tokenStandard={};
    if(inputTokenStandard=="ERC20"){
        tokenStandard={$in:['ERC20',null]};
    }else{
        tokenStandard={$in:[inputTokenStandard.toLowerCase()]};
    }
    database && database.collection(process.env.TOKEN_DETAILS)
        .aggregate([
            { $match: { 'userName': userId,
                        'tokenStandard':tokenStandard
                        //'tokenStandard':{$nin:['ERC721','ERC1155']},
                      } 
            },
            {
                $lookup: {
                    from: process.env.BILLING_DETAILS,
                    localField: "_id",
                    foreignField: "tokenId",
                    as: "billingDetails"
                }
            },

            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $sort: { _id: -1 } },

                        { $skip: (pageNumber > 0 ? ((pageNumber - 1) * parseInt(process.env.TOKEN_PER_PAGE)) : 0) },
                        { $limit: (parseInt(process.env.TOKEN_PER_PAGE)) }]
                }
            }

        ]).toArray(async (error, result) => {
            if (error) {

                return res.send(error);
            }
            if (Object.keys(result[0].metadata).length > 0) {
                let totalcount = result[0].metadata[0].total;
                let numberOfPages = Math.ceil(parseInt(totalcount) / parseInt(process.env.TOKEN_PER_PAGE));
                result[0].metadata[0].numberOfPages = numberOfPages;
            }
            if (Object.keys(result[0].data).length > 0) {
                console.log(result[0].data);
               
                result[0].data.map(data => {
                   
                    if (inputTokenStandard == "ERC20") {
                        data.supplyType = constants.supplyTypeList.get(data.supplyType).key;
                        data.accessType = constants.supplyTypeList.get(data.accessType).key;
                        data.transferType = constants.transferTypeList.get(data.transferType).key;
                        data.tokenType = constants.tokenTypeList.get(data.tokenType).key;
                        data.network = constants.networkList.get(data.network).key;
                      
                    }else{
                       
                        data.startTime = moment(new Date(data.startTime)).format("DD-MM-YYYY HH:mm:ss");
                        data.endTime = moment(new Date(data.endTime)).format("DD-MM-YYYY HH:mm:ss");
                    }
                    data.status = constants.tokenStatus.get(data.status).key;
                    data.createdOn = moment(new Date(data.createdOn)).format("DD-MM-YYYY HH:mm:ss");
                    data.isMetamask = data.isMetamask ? 'Metamask' : "-";
                    data.chainId = data.chainId ? data.chainId : null;
                    data.baseurl=data.chainId ?constants.recheckURL[data.chainId]:constants.recheckURL["80001"];
                   
                })

            }
            res.json(result[0]);
        });

});
//Not in use
router.post("/createTokenviametamask", async (request, response) => {

    let alp_regex = new RegExp('[a-zA-Z]');
    switch (true) {
        case request.body.tokenName == '':
            return response.send({ msg: "Token Name Required" });
            break;
        case request.body.tokenSymbol == '':
            return response.send({ msg: "Token Symbol Required" });
            break;
        case (request.body.tokenSymbol).toString().length >= 6:
            return response.send({ msg: "Token Symbol should contain max 5 characters" });
            break;
        //  case isNaN(parseInt(request.body.token_symbol)) == true:
        case (alp_regex.test(request.body.tokenSymbol)) == false:
            return response.send({ msg: "Token Symbol should contain alphabets Only" });
            break;
        // case (parseInt(request.body.tokenDecimal) <= 9 || parseInt(request.body.tokenDecimal) >= 100):
        //     return response.send({ msg: "Token Decimal Should be between 10-99" });
        //     break;
        case isNaN(parseInt(request.body.tokenDecimal)) == true:
            return response.send({ msg: "Token Decimal should contain Numbers Only" });
            break;
        case isNaN(parseInt(request.body.initialSupply)) == true:
            return response.send({ msg: "Initial supply should contain Numbers Only" });
            break;
        case (parseInt(request.body.initialSupply) <= 0):
            return response.send({ msg: "Initial supply Should be more than 1" });
    }

    let query = { 'tokenName': request.body.tokenName }
    var collection = database.collection(
        process.env.TOKEN_DETAILS
    );
    // collection.findOne(query, async (err, result) => {
    //     if (err) {
    //         return response.send({status:2,msg:err});
    //     }
    //     if (result != null) {
    //         response.send({ status:2,msg: "Token Name Already Exists" });
    //     } else {

    let newToken = {
        tokenName: request.body.tokenName,
        tokenSymbol: request.body.tokenSymbol,
        tokenDecimal: request.body.tokenDecimal,
        initialSupply: request.body.initialSupply,
        tokenSupply: request.body.tokenSupply,
        supplyType: constants.supplyTypeList.get(request.body.supplyType).value,
        accessType: constants.accessTypeList.get(request.body.accessType).value,
        transferType: constants.transferTypeList.get(request.body.transferType).value,
        varifySource: request.body.varifySource,
        removeCopy: request.body.removeCopy,
        burnable: request.body.burnable,
        mintable: request.body.mintable,
        erc: request.body.erc,
        tokenRecover: request.body.tokenRecover,
        tokenType: constants.tokenTypeList.get(request.body.tokenType).value,
        network: constants.networkList.get(request.body.network).value,
        status: constants.tokenStatus.get(request.body.status).value,
        userName: request.body.userName,
        commisionFee: request.body.commisionFee,
        gasFee: request.body.gasFee,
        subscriptionFee: request.body.subscriptionFee,
        createdOn: new Date(),
        createdBy: request.body.createdBy
    };
    try {
        collection.insertOne(newToken, async (error, result) => {
            if (error) {
                return response.send({ status: 2, msg: error });
            } else {
                let msgtxt = "Token Created With Contract Address " + request.body.contractAddress;
                response.send({ status: 1, msg: msgtxt });



            }

        });
    } catch (ex) {
        response.send({ status: 1, msg: "Token Created" });
    }
    //     }
    // });

});
//creat and deploy new token
router.post("/createToken", async (request, response) => {

    let alp_regex = new RegExp('[a-zA-Z]');
    switch (true) {
        case request.body.tokenName == '':
            return response.send({ msg: "Token Name Required" });
            break;
        case request.body.tokenSymbol == '':
            return response.send({ msg: "Token Symbol Required" });
            break;
        case (request.body.tokenSymbol).toString().length >= 6:
            return response.send({ msg: "Token Symbol should contain max 5 characters" });
            break;

        case (alp_regex.test(request.body.tokenSymbol)) == false:
            return response.send({ msg: "Token Symbol should contain alphabets Only" });
            break;

        case isNaN(parseInt(request.body.tokenDecimal)) == true:
            return response.send({ msg: "Token Decimal should contain Numbers Only" });
            break;
        case isNaN(parseInt(request.body.initialSupply)) == true:
            return response.send({ msg: "Initial supply should contain Numbers Only" });
            break;
        case (parseInt(request.body.initialSupply) <= 0):
            return response.send({ msg: "Initial supply Should be more than 1" });
    }

    let query = { 'tokenName': request.body.tokenName }
    var collection = database.collection(
        process.env.TOKEN_DETAILS
    );

    let newToken = {
        tokenName: request.body.tokenName,
        tokenSymbol: request.body.tokenSymbol,
        tokenDecimal: request.body.tokenDecimal,
        initialSupply: request.body.initialSupply,
        tokenSupply: request.body.tokenSupply,
        supplyType: constants.supplyTypeList.get(request.body.supplyType).value,
        accessType: constants.accessTypeList.get(request.body.accessType).value,
        transferType: constants.transferTypeList.get(request.body.transferType).value,
        varifySource: request.body.varifySource,
        removeCopy: request.body.removeCopy,
        burnable: request.body.burnable,
        mintable: request.body.mintable,
        erc: request.body.erc,
        tokenRecover: request.body.tokenRecover,
        tokenType: constants.tokenTypeList.get(request.body.tokenType).value,
        network: constants.networkList.get(request.body.network).value,
        status: constants.tokenStatus.get(request.body.status).value,
        userName: request.body.userName,
        commisionFee: request.body.commisionFee,
        gasFee: request.body.gasFee,
        subscriptionFee: request.body.subscriptionFee,
        createdOn: new Date(),
        createdBy: request.body.createdBy,
        txHash: request.body.txHash == undefined ? null : request.body.txHash,
        contractAddress: request.body.contractAddress == undefined ? null : request.body.contractAddress,
        reason: request.body.reason == undefined ? null : request.body.reason,
        isMetamask: request.body.deployViaMetamask,
        tokenStandard: request.body.tokenStandard

    };
    try {
        collection.insertOne(newToken, async (error, result) => {
            if (error) {
                return response.send({ status: 2, msg: error });
            } else {
                let billingDtl = {
                    contractAddress: request.body.contractAddress,
                    tokenId: result.insertedId,
                    userName: request.body.userName,
                    createdBy: request.body.createdBy,
                };
                const billingResp = await addBillingDetails(request.body.billingDetails, billingDtl);
                if (request.body.deployViaMetamask == false) {

                    let ceatedRecaipt = await deploy(request.body);
                    var setQuery = {};
                    if (ceatedRecaipt.error != null) {
                        let temp1 = ceatedRecaipt.error.toString();

                        setQuery = {
                            txHash: null,
                            contractAddress: null,
                            status: constants.tokenStatus.get("Pending").value,
                            reason: temp1,
                            updatedOn: new Date(),
                            updatedBy: request.body.userName
                        };

                    } else {
                        setQuery = {
                            txHash: ceatedRecaipt.data["transactionHash"],
                            contractAddress: ceatedRecaipt.data["contractAddress"],
                            status: constants.tokenStatus.get("Deployed").value,
                            updatedOn: new Date(),
                            updatedBy: request.body.userName,
                            reason: ""
                        };
                    }
                    collection.updateOne(
                        { "_id": new ObjectId(result.insertedId) },
                        {
                            $set: setQuery
                        },

                        {
                            upsert: false,
                        },
                        (error, result) => {
                            if (error) {

                                response.send({ status: 2, msg: error });
                            } else {

                                let msgtxt = "";
                                if (ceatedRecaipt.data != null) {
                                    msgtxt = "Token Created With Contract Address " + ceatedRecaipt.data["contractAddress"];
                                    response.send({ status: 1, msg: msgtxt, contractAddress: ceatedRecaipt.data["contractAddress"] });
                                } else {
                                    msgtxt = "Token Created with deployment pending due to " + ceatedRecaipt.error.toString();
                                    response.send({ status: 1, msg: msgtxt, contractAddress: "" });
                                }


                            }

                        }
                    );

                } else {
                 //   var txhash = request.body.txHash != null ? (request.body.txHash).toString() : request.body.txHash;

                    // setTimeout(async () => {

                    //     if (request.body.txHash != null) {
                    //         if (request.body.network == "Polygon") {
                    //             connectionURL = "https://rpc-mainnet.maticvigil.com/v1/7c71994fb9d6dd7154539e4a1dc56ff96e5f3508";
                    //             web3 = new Web3(new Web3.providers.HttpProvider(connectionURL));
                    //         }
                    //         const createReceipt = await web3.eth.getTransactionReceipt(
                    //             txhash
                    //         );

                    //         if (createReceipt != null) {
                    //             setQuery = {

                    //                 contractAddress: createReceipt.contractAddress,

                    //             };
                    //             collection.updateOne(
                    //                 { "_id": new ObjectId(result.insertedId) },
                    //                 {
                    //                     $set: setQuery
                    //                 },

                    //                 {
                    //                     upsert: false,
                    //                 },
                    //                 (error, result) => {

                    //                 });
                    //         }

                    //     }
                    // }, 30000)

                    let errMsg = request.body.reason == null ? '' : " Token Created with deployment pending due to " + request.body.reason;
                    let msgtxt = "Token Created With Contract Address " + request.body.contractAddress + errMsg;
                    if (request.body.reason == null) {
                        msgtxt = "Token Created With Contract Address " + request.body.contractAddress;
                    } else {
                        msgtxt = "Token Created with deployment pending due to " + request.body.reason;
                    }
                    response.send({ status: 1, msg: msgtxt, contractAddress: request.body.contractAddress, });
                }

            }

        });
    } catch (ex) {
        response.send({ status: 1, msg: "Token Created" });
    }


});
//API's for SubscriptionFee
router.get("/getSubscriptionFee/:contract/:network", async (req, res) => {
    let query = {
        contractType: constants.tokenTypeList.get(req.params.contract).value,
        network: constants.networkList.get(req.params.network).value,

    };
    database && database.collection(process.env.SUBSCRIPTION_FEE)
        .find(query).toArray(async (error, result) => {
            if (error) {
                return res.send(error);
            }
            if(Object.keys(result).length>0){
            result.map(data => {
                data.contractType = constants.tokenTypeList.get(data.contractType).key;
                data.network = constants.networkList.get(req.params.network).key
            });
        }
            res.send(result);
        });
});
//API to get token details by token ID
router.get("/getTokenDetailsbyId/:tokenId", async (req, res) => {
    var tokenId = req.params.tokenId;
    database && database.collection(process.env.TOKEN_DETAILS)
        .aggregate([

            {
                $match: {
                    _id: new ObjectId(tokenId)
                }
            },
            {
                $addFields: {
                    subscriptionFee: {
                        $toObjectId: "$subscriptionFee"
                    }
                }
            },

            {
                $lookup: {
                    from: process.env.SUBSCRIPTION_FEE,
                    localField: "subscriptionFee",
                    foreignField: "_id",
                    as: "subscriptionFees"
                }
            }
        ])
        .toArray(async (error, result) => {
            if (error) {
                return res.send(error);
            }
            result.map(data => {
                data.supplyType = constants.supplyTypeList.get(data.supplyType).key;
                data.accessType = constants.supplyTypeList.get(data.accessType).key;
                data.transferType = constants.transferTypeList.get(data.transferType).key;
                data.tokenType = constants.tokenTypeList.get(data.tokenType).key;
                data.network = constants.networkList.get(data.network).key;
                data.isMetamask = data.isMetamask ? 'Metamask' : "-";

            })
            res.send(result);
        });

});
//APi to add billing details Not in use
router.post("/addBillingDetails/", async (req, res) => {
    var data = request.body;

    let billingDtls = {
        walletAddress: data.walletAddress,
        legalName: data.legalName,
        emailid: data.emailid,
        billingAddress: data.billingAddress,
        zipCode: data.zipCode,
        city: data.city,
        state: data.state,
        country: data.country,
        taxId: data.taxId,
        taxRegNumber: data.taxRegNumber,
        userId: data.userName,
        tokenId: data.tokenId,
        createdBy: data.userId,
        createdOn: new Date()
    };
    var collection = database.collection(
        process.env.BILLING_DETAILS
    );

    try {
        collection.insertOne(billingDtls, async (error, result) => {
            if (error) {
                return response.send({ status: 2, msg: error });
            } else {

            }

        });
    } catch (ex) {
        response.send({ status: 1, msg: "Token Created" });
    }


});
//API to get the ABI by Token Type 
router.get("/getContractValues/:featueList", async (req, res) => {
    var featueList = req.params.featueList;
    const data = await selectAbi(featueList);
    res.send(data);

});
router.post("/createNFT/", async (req, res) => {
    var data = req.body;
    let newToken = {
        imgUrl: data.imgUrl,
        tokenName: data.name,
        tokenSymbol: data.symbol,
        description: data.description,
        isPublicMint: data.isPublicMint,
        startTime: data.startTime,
        endTime: data.endTime,
        mintPrice: data.mintPrice,
        amountPerUser: data.amountPerUser,
        maxAmount: data.maxAmount,
        status: constants.tokenStatus.get(data.status).value,
        userName: data.userName,
        createdOn: new Date(),
        createdBy: data.createdBy,
        txHash: data.txHash == undefined ? null : data.txHash,
        contractAddress: data.contractAddress == undefined ? null : data.contractAddress,
        reason: data.reason == undefined ? null : data.reason,
        isMetamask: data.deployViaMetamask,
        tokenStandard: data.tokenStandard


    }
    try {
        var collection = database.collection(
            process.env.TOKEN_DETAILS
        );
        collection.insertOne(newToken, async (error, result) => {
            if (error) {
                return res.send(error);
            } else {

                res.send(result);
            }
        })
    } catch (error) {
         res.send(error);
    }
})
router.post("/createTokenSale/", async (req, res) => {
    var data = req.body;
    let newToken = {
        tokenAddress: data.tokenAddress,
        tokenName:data.name,
        tokenSymbol: data.symbol,
        tokenOnSale: data.tokenOnSale,
        tokenPrice: data.tokenPrice,
        supply: data.supply,
        hardCap: data.hardCap,
        softCap: data.softCap,
        addressType: data.addressType,
        startDate: data.startDate,
        endDate: data.endDate,
        claimDate:data.claimDate,
        maxInvest:data.maxInvest,
        minInvest:data.minInvest,
        ownerAddress:data.ownerAddress,
        saleRate:data.saleRate,
        selectedPayment:data.selectedPayment,
        chainId:data.chainId,
        createdOn: new Date(),
        createdBy: data.createdBy,
        txHash: data.txHash == undefined ? null : data.txHash,
        contractAddress: data.contractAddress == undefined ? null : data.contractAddress,
        reason: data.reason == undefined ? null : data.reason,
        isMetamask: data.deployViaMetamask

    }
    try {
        var collection = database.collection(
            process.env.TOKEN_SALE
        );
        collection.insertOne(newToken, async (error, result) => {
            if (error) {
                return res.send(error);
            } else {

                res.send(result);
            }
        })
    } catch (error) {
         res.send(error);
    }
})
router.get("/getTokenSaleDetails/:tokenId", async (req, res) => {
    console.log("tokenId=",req.params.tokenId)
    var tokenId = req.params.tokenId;
    let query={contractAddress:req.params.tokenId};
    console.log(query);
    database && database.collection(process.env.TOKEN_SALE)
    .findOne(query, async (error, result) => {
        console.log(error);
        
        console.log(result);
            if (error) {
                 res.send(error);
            }else{
                console.log("result===================");
                console.log(result);
                res.send(result);
            }   
           
            
        });

});
router.post("/updateTokenSale/", async (req, res) => {
    var data = req.body;
    console.log(data);
    let setQuery={...data.details};
   
    try {
        var collection = database.collection(
            process.env.TOKEN_SALE
        );
        collection.updateOne(
            {"_id":new ObjectId(data.id)},
            {
                $set: setQuery
            },
            
            {
                upsert: false,
            },
            (error, result) => {
                if (error) {
                    console.log(error)
                    res.send({status:2,msg:"Token Sale Updation Fail"});
                }else{
                    res.send({status:1,msg:"Token Sale Detail Updated"});
                }
                console.log(result);
               
            }
            );
    } catch (error) {
        console.log(error);
        res.send({status:2,msg:"Token Sale Updation Fail"});
    }
})
router.post("/updateWhitelistedAddress/", async (req, res) => {
    var data = req.body;
    console.log(data);
    let setQuery={"addressList":[...data.addressList]};
   
    try {
        var collection = database.collection(
            process.env.WHILTELISTED_ADDRESS
        );
        collection.updateOne(
            {"contractAddress":data.contractAddress},
            {
                $set: setQuery
            },
            
            {
                upsert: true,
            },
            (error, result) => {
                if (error) {
                    console.log(error)
                    res.send({status:2,msg:"Token Sale Updation Fail"});
                }else{
                    res.send({status:1,msg:"Token Sale Detail Updated"});
                }
                console.log(result);
               
            }
            );
    } catch (error) {
        console.log(error);
        res.send({status:2,msg:"Token Sale Updation Fail"});
    }
})
//Function to get the byte code and ABI by token type
const selectAbi = async (tokentype) => {
    try {
        /**
         * COMPILATION SCRIPT
         */
        var filename = "";
        var files = "";
        var input = {}
        var source = "";
        var sourceObj = {};

        switch (true) {
            case tokentype == "HelloERC20":
                filename = "HelloERC20.sol";
                break;
            case tokentype == "SimpleERC20":
                filename = "SimpleERC20.sol";
                break;
            case tokentype == "StandardERC20":
                filename = "StandardERC20.sol";
                break;
            case tokentype == "BurnableERC20":
                filename = "BurnableERC20.sol";
                break;
            case tokentype == "MintableERC20":
                filename = "MintableERC20.sol";
                break;
            case tokentype == "PausableERC20":
                filename = "PausableERC20.sol";
                break;
            case tokentype == "CommonERC20":
                filename = "CommonERC20.sol";
                break;
            case tokentype == "UnlimitedERC20":
                filename = "UnlimmitedERC20.sol";
                break;
            case tokentype == "erc20Airdrop":
                filename = "erc20Airdrop.sol";
                break;
            case tokentype == "erc721":
                filename = "erc721.sol";
                break;
            case tokentype == "erc1155":
                filename = "ERC1155.sol";
                break;
            case tokentype=="createSale":
                filename="sale.sol"    
                break;
            default:
                filename = "MyToken.sol";
                break;
        }

        source = fs.readFileSync('./model/' + filename, 'UTF-8');
        sourceObj[filename] = {
            content: source,
        };
        input = {
            language: 'Solidity',
            sources: sourceObj,
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['*']
                    }
                }
            }
        };
        var output = JSON.parse(solc.compile(JSON.stringify(input)));

        let contractObj = "MyToken";
        if (tokentype == "erc20Airdrop") {
            contractObj = "FlamToken";
        } else if (tokentype == "erc721") {
            contractObj = "Virtuosity";
        } 
        // else if (tokentype == "erc1155") {
        //     contractObj = "MyToken";
        // }
        
        const contractFile = output.contracts[filename][contractObj];
        const urlstemp = contractFile.metadata;
        console.log(urlstemp);
        const byteCode = contractFile.evm.bytecode.object;
        const contractABI = contractFile.abi;
        /**
         * DEPLOYMENT SCRIPT
         * 
         */
        return ({
            "byteCode": byteCode,

            "contractABI": contractABI
        })
    } catch (ex) {
        console.log(ex);
    }

}
//function to deploy the token
const deploy = async (tokenObj) => {
    var returnData = {};
    try {

        const abiResp = await selectAbi(tokenObj.tokenType);
        var argdata = [];
        if (tokenObj.tokenType == "SimpleERC20") {
            argdata = [tokenObj.tokenName, tokenObj.tokenSymbol, tokenObj.address, tokenObj.tokenDecimal];
        } else if (tokenObj.tokenType == "StandardERC20" || tokenObj.tokenType == "BurnableERC20") {
            argdata = [tokenObj.tokenName, tokenObj.tokenSymbol, tokenObj.address, tokenObj.initialSupply, tokenObj.tokenDecimal];
        } else if (tokenObj.tokenType == "HelloERC20") {
            argdata = [tokenObj.tokenName, tokenObj.tokenSymbol, tokenObj.address];
        } else if (tokenObj.tokenType == "MintableERC20" || tokenObj.tokenType == "PausableERC20" || tokenObj.tokenType == "CommonERC20" || tokenObj.tokenType == "UnlimitedERC20") {
            argdata = [tokenObj.tokenName, tokenObj.tokenSymbol, tokenObj.tokenDecimal];
        } else if (tokenObj.tokenType == "AmazingERC20") {
            argdata = [tokenObj.tokenName, tokenObj.tokenSymbol];
        } else if (tokenObj.tokenType == "PowerfulERC20") {
            argdata = [tokenObj.tokenName, tokenObj.tokenSymbol];
        }
        if (request.body.network == "Polygon") {
            connectionURL = "https://rpc-mainnet.maticvigil.com/v1/7c71994fb9d6dd7154539e4a1dc56ff96e5f3508";
            web3 = new Web3(new Web3.providers.HttpProvider(connectionURL));
        }

        const incrementer = new web3.eth.Contract(abiResp.contractABI);
        const incrementerTx = incrementer.deploy({
            data: abiResp.byteCode,
            arguments: argdata
        });
        const createTransaction = await web3.eth.accounts.signTransaction(
            {
                from: process.env.ADDRESS_WEB3,
                data: incrementerTx.encodeABI(),
                gas: '3000000',
            },
            process.env.PRIVATE_KEY_WEB3
        );
        const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
        );

        returnData = { "data": createReceipt, "error": null };
    } catch (ex) {

        returnData = { "data": null, "error": ex };

    } finally {
        return returnData;
    }
};
const addBillingDetails = async (data, billingDtl) => {

    let billingDtls = {
        walletAddress: data.walletAddress,
        legalName: data.legalName,
        emailid: data.emailid,
        billingAddress: data.billingAddress,
        zipCode: data.zipCode,
        city: data.city,
        state: data.state,
        country: data.countryName,
        taxId: data.taxId,
        taxRegNumber: data.taxRegNumber,
        userId: billingDtl.userId,
        tokenId: billingDtl.tokenId,
        createdBy: billingDtl.createdBy,
        createdOn: new Date(),
        contractAddress: billingDtl.contractAddress
    };
    var collection = database.collection(
        process.env.BILLING_DETAILS
    );

    try {
        collection.insertOne(billingDtls, async (error, result) => {
            if (error) {
                return ({ status: 2, msg: error });
            } else {
                return (result);
            }

        });
    } catch (ex) {
        return ({ status: 1, msg: "Token Created" });
    }


}
module.exports = router;