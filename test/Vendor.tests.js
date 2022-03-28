const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { expect, chai } = require("chai");
const { ethers } = require("hardhat");

describe("Vendor", () => {

    let Token;
    let token;
    let Vendor;
    let vendorContract;

    let name = "Staking Token"
    let symbol = "STTK"
    let totalSupply = 1000000000

    beforeEach(async () => {
        [owner, beneficiary1, beneficiary2, beneficiary3, beneficiary4, beneficiary5, ...otherAccounts] = await ethers.getSigners();

        Token = await ethers.getContractFactory('Token');
        Vendor = await ethers.getContractFactory('Vendor');
        token = await Token.deploy(name, symbol, totalSupply);
        vendorContract = await Vendor.deploy(token.address);
    });

    describe('Deploy contracts', async () => {
        it('Should reverted deploying with zero address', async () => {
            await expect(Vendor.deploy('0x0000000000000000000000000000000000000000'))
                .to.be.revertedWith("Vendor: Invalid token address");
        });

        it('Should contracts not to be ..', async () => {
            expect(token.address).to.be.not.undefined;
            expect(token.address).to.be.not.null;
            expect(token.address).to.be.not.NaN;

            expect(vendorContract.address).to.be.not.undefined;
            expect(vendorContract.address).to.be.not.null;
            expect(vendorContract.address).to.be.not.NaN;
        });

        it('Should initialize name and symbol correct', async () => {
            expect(await token.name()).to.be.equal(name)
            expect(await token.symbol()).to.be.equal(symbol)
        });

        it('Should initialize totalSupply and balance of the owner correct', async () => {
            expect(await token.totalSupply()).to.be.equal(totalSupply)
            expect(await token.balanceOf(owner.address)).to.be.equal(totalSupply)
        });

        it('Should initialize vendor contract correct', async () => {
            expect(await token.balanceOf(vendorContract.address)).to.be.equal(0)
            expect(await vendorContract.owner()).to.be.equal(owner.address)
        });
    });

    describe('Set price', async () => {

        it('Should reverted because only owner can call function', async () => {
            await expect(vendorContract.connect(beneficiary1).setPrice(ethers.utils.parseUnits('0.05', 'ether')))
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it('Should  reverted because a negative price', async () => {
            await expect(vendorContract.setPrice((ethers.utils.parseUnits('0', 'ether'))))
                .to.be.revertedWith("Vendor: price cannot be low or equal zero");
        });

        it('Should successfully set price', async () => {
            await vendorContract.setPrice(ethers.utils.parseUnits('0.05', 'ether'));
            expect(await vendorContract.price()).to.be.equal(ethers.utils.parseUnits('0.05', 'ether'));
        });

    });

    describe('Buy tokens', async () => {
        it('Should reverted because value is negative number', async () => {
            await vendorContract.setPrice(ethers.utils.parseUnits('0.05', 'ether'));
            await token.transfer(vendorContract.address, token.balanceOf(owner.address));

            const amount = ethers.utils.parseUnits('0', 'ether');
            await expect(
                vendorContract.connect(beneficiary1).buyTokens({
                    value: amount,
                }),
            ).to.be.revertedWith("Vendor: value cannot be low or equal zero");
        });

        it('Should reverted because vnot enought tokens in contract balance', async () => {
            await vendorContract.setPrice(ethers.utils.parseUnits('0.05', 'ether'));
            await token.transfer(vendorContract.address, 5);

            const amount = ethers.utils.parseUnits('5', 'ether');
            await expect(
                vendorContract.connect(beneficiary1).buyTokens({
                    value: amount,
                }),
            ).to.be.revertedWith("Vendor: contract has not enough tokens in its balance");
        });

        it('Should successfully buy tokens', async () => {
            await vendorContract.setPrice(ethers.utils.parseUnits('0.05', 'ether'));
            await token.transfer(vendorContract.address, token.balanceOf(owner.address));

            const amount = ethers.utils.parseUnits('5', 'ether');
            await expect(
                vendorContract.connect(beneficiary1).buyTokens({
                    value: amount,
                }),
            )
                .to.emit(vendorContract, 'BoughtToken')
                .withArgs(beneficiary1.address, amount, 100);

            const userTokenBalance = await token.balanceOf(beneficiary1.address);
            const userTokenAmount = 100;
            expect(userTokenBalance).to.equal(userTokenAmount);

            const vendorTokenBalance = await token.balanceOf(vendorContract.address);
            expect(vendorTokenBalance).to.equal(999999900);

            const vendorBalance = await ethers.provider.getBalance(vendorContract.address);
            expect(vendorBalance).to.equal(amount);
        });

        it('Should successfully buy tokens and return change', async () => {
            await vendorContract.setPrice(ethers.utils.parseUnits('0.05', 'ether'));
            await token.transfer(vendorContract.address, token.balanceOf(owner.address));

            const amount = ethers.utils.parseUnits('5.01', 'ether');
            await expect(
                vendorContract.connect(beneficiary1).buyTokens({
                    value: amount,
                }),
            )
                .to.emit(vendorContract, 'BoughtToken')
                .withArgs(beneficiary1.address, (ethers.utils.parseUnits('5', 'ether')), 100);

            const userTokenBalance = await token.balanceOf(beneficiary1.address);
            const userTokenAmount = 100;
            expect(userTokenBalance).to.equal(userTokenAmount);

            const vendorTokenBalance = await token.balanceOf(vendorContract.address);
            expect(vendorTokenBalance).to.equal(999999900);

            const vendorBalance = await ethers.provider.getBalance(vendorContract.address);
            expect(vendorBalance).to.equal((ethers.utils.parseUnits('5', 'ether')));
        });

    });

    describe('sell tokens', async () => {

        beforeEach(async () => {
            await vendorContract.setPrice(ethers.utils.parseUnits('0.05', 'ether'));
            await token.transfer(vendorContract.address, token.balanceOf(owner.address));

            const amount = ethers.utils.parseUnits('5', 'ether');
            // 100 tokens
            await vendorContract.connect(beneficiary1).buyTokens({
                value: amount,
            });
        });

        it('Should reverted because amount is negative number', async () => {
            const amountToSell = 0;
            await expect(vendorContract.connect(beneficiary1).sellTokens(amountToSell))
                .to.be.revertedWith("Vendor: specify an amount of token greater than zero");
        })

        it('Should reverted because not enough tokens in contract', async () => {
            const amountToSell = 101;
            await expect(vendorContract.connect(beneficiary1).sellTokens(amountToSell))
                .to.be.revertedWith("Vendor: your balance is lower than the amount of tokens you want to sell");
        })

        it('sellTokens reverted because user has now approved transfer', async () => {
            const amountToSell = 100;
            await expect(vendorContract.connect(beneficiary1).sellTokens(amountToSell))
                .to.be.revertedWith("ERC20: insufficient allowance");
        });

        it('sellTokens successfully', async () => {
            const amountToSell = 100;
            await token.connect(beneficiary1).approve(vendorContract.address, amountToSell);

            const vendorAllowance = await token.allowance(beneficiary1.address, vendorContract.address);
            expect(vendorAllowance).to.equal(amountToSell);

            const sellTokens = await vendorContract.connect(beneficiary1).sellTokens(amountToSell);

            const vendorTokenBalance = await token.balanceOf(vendorContract.address);
            expect(vendorTokenBalance).to.equal(1000000000);

            const userTokenBalance = await token.balanceOf(beneficiary1.address);
            expect(userTokenBalance).to.equal(0);

            const userEthBalance = ethers.utils.parseUnits('5', 'ether');
            await expect(sellTokens).to.changeEtherBalance(beneficiary1, userEthBalance);
        });

    });

    describe('withdraw ', () => {
        it('withdraw reverted because only owner can call', async () => {
            await expect(vendorContract.connect(beneficiary1).withdraw())
                .to.be.revertedWith("Ownable: caller is not the owner");
        });

        it('withdraw reverted because contract balance is empty', async () => {
            await expect(vendorContract.connect(owner).withdraw())
                .to.be.revertedWith("Vendor: contract has not balance to withdraw");
        });

        it('withdraw successfully', async () => {
            await vendorContract.setPrice(ethers.utils.parseUnits('0.05', 'ether'));
            await token.transfer(vendorContract.address, token.balanceOf(owner.address));

            const amount = ethers.utils.parseUnits('5', 'ether');
            // 100 tokens
            await vendorContract.connect(beneficiary1).buyTokens({
                value: amount,
            });

            const ethWithdraw = await vendorContract.connect(owner).withdraw();

            const vendorBalance = await ethers.provider.getBalance(vendorContract.address);
            expect(vendorBalance).to.equal(0);

            await expect(ethWithdraw).to.changeEtherBalance(owner, amount);
        });


        it('vendor cannot accept the sell request', async () => {
            await vendorContract.setPrice(ethers.utils.parseUnits('0.05', 'ether'));
            await token.transfer(vendorContract.address, token.balanceOf(owner.address));

            const amount = ethers.utils.parseUnits('5', 'ether');
            // 100 tokens
            await vendorContract.connect(beneficiary1).buyTokens({
                value: amount,
            });

            await vendorContract.connect(owner).withdraw();

            await expect(vendorContract.connect(beneficiary1).sellTokens(100))
                .to.be.revertedWith("Vendor: contract has not enough funds to accept the sell request");

        });

    });

});
