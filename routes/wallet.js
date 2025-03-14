const express = require('express');
const router = express.Router();
const lightwallet = require("eth-lightwallet");
const fs = require('fs');

// TODO : lightwallet 모듈을 사용하여 랜덤한 니모닉 코드를 얻습니다.
router.post('/newMnemonic', async (req, res) => {
    let mnemonic;
    try {
        const mnemonic = lightwallet.keystore.generateRandomSeed();
        res.json({ mnemonic });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: '니모닉 코드 생성 중 오류가 발생했습니다.' });
    }
});


// TODO : 니모닉 코드와 패스워드를 이용해 keystore와 address를 생성합니다. 
router.post('/newWallet', async (req, res) => {
    let password = req.body.password
    let mnemonic = req.body.mnemonic;


    if (!mnemonic || !password) {
        return res.status(400).json({ error: '니모닉 코드와 패스워드를 모두 제공해야 합니다.' });
    }

    try {
        lightwallet.keystore.createVault({
            password,
            seedPhrase: mnemonic,
            hdPathString: "m/0'/0'/0'"
        },
            function (err, ks) {
                if (err) {
                    return res.status(500).json({ error: "키스토어 생성 중 오류가 발생했습니다.", details: err });
                }

                ks.keyFromPassword(password, function (err, pwDerivedKey) {
                    if (err) {
                        return res.status(500).json({ error: "비밀번호로 키 생성 중 오류가 발생했습니다.", details: err });
                    }

                    ks.generateNewAddress(pwDerivedKey, 1);

                    let address = (ks.getAddresses()).toString();
                    let keystore = ks.serialize();

                    fs.writeFile('wallet.json', keystore, function (err, data) {
                        if (err) {
                            res.json({ code: 999, message: "실패" });
                        } else {
                            res.json({ code: 1, message: "성공" });
                        }
                    });
                });
            });
    } catch (exception) {
        console.log("NewWallet ==>>>> " + exception);
    }
});

module.exports = router;



