const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    constants
} = require("@openzeppelin/test-helpers");

describe("UserRegistration", () => {

    let userRegistration;
    let userRegistrationAddress;


    beforeEach(async () => {
        [owner, user1, user2, user3, ...otherAccounts] = await ethers.getSigners();

        const UserRegistratoin = await hre.ethers.getContractFactory("UserRegistratoin");
        userRegistration = await UserRegistratoin.deploy();
        userRegistrationAddress = userRegistration.address;

    });

    it('Should sucessfully deploy contracts', async () => {
        expect(await userRegistrationAddress).to.be.not.equal(constants.ZERO_ADDRESS);
    });

    describe('register', async () => {
        it('Should sucessfully register new user', async () => {
            await expect(userRegistration.connect(user1).register("mariesnlk", "11111", "hallo"))
                .to.emit(userRegistration, 'Registered')
                .withArgs(1, "mariesnlk", user1.address);
        });

        it('Reverted registration second time with the same username', async () => {
            await userRegistration.connect(user2).register("mariesnlk", "11111", "hallo");
            await expect(userRegistration.connect(user2).register("mariesnlk", "11111", "hallo"))
                .to.be.revertedWith("ALREADY_REGISTERED");

        });
    });

    describe('login', async () => {
        it('Should sucessfully login (return true)', async () => {
            await userRegistration.connect(user2).register("mariesnlk", "11111", "hallo");
            await userRegistration.connect(user2).login("mariesnlk", "11111");
            expect(await userRegistration.connect(user2).checkIsUserLogged()).to.be.true;
        });

        it('Reverted (return false) login if user is not registered before', async () => {
            await userRegistration.connect(user2).login("mariesnlk", "11111")
            expect(await userRegistration.connect(user2).checkIsUserLogged()).to.be.false;
        });

        it('Reverted (return false) login with incorrect parameters', async () => {
            await userRegistration.connect(user2).register("mariesnlk", "11111", "hallo");
            await userRegistration.connect(user2).login("mariesnlk", "1122");
            expect(await userRegistration.connect(user2).checkIsUserLogged()).to.be.false;

        });
    });

    describe('logout', async () => {
        it('Should sucessfully logout', async () => {
            await userRegistration.connect(user2).register("mariesnlk", "11111", "hallo");
            await userRegistration.connect(user2).login("mariesnlk", "11111");
            await userRegistration.connect(user2).logout();
            expect(await userRegistration.connect(user2).checkIsUserLogged()).to.be.false;
        });
    });

    describe('getUser', async () => {
        it('Should sucessfully get user info', async () => {
            const username = "mariesnlk";
            const password = "11111";
            await userRegistration.connect(user2).register(username, password, "hallo");
            await userRegistration.connect(user2).login(username, password);
            const [name, bio] = await userRegistration.connect(user2).getUser();
            expect(await name).to.be.equal(username);
            expect(await bio).to.be.equal("hallo");

        });
    });

    describe('getAllUsers', async () => {

    });

});
