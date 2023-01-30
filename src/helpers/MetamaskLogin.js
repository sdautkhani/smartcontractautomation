import {
    USER_BASE_URL,
    globalService,
    USER_LOGIN_METAMASK_URL
} from "./";


export function metaMaskLogin(accountId) {

    return new Promise(async (resolve, reject) => {
        var config = {
            method: "POST",
            url: `${USER_BASE_URL}/${USER_LOGIN_METAMASK_URL}`,
            data: { "accountId": accountId },
        };

        try {
            const resp = await globalService(config);
            if (resp.token != null) {
                sessionStorage['user'] = JSON.stringify(resp);
                resolve("success")
            } else {
                reject(resp.msg)
            }


        } catch (err) {
            console.log(err);
            reject(err)
        }

    });

}