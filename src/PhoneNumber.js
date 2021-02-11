class PhoneNumber {
    constructor(phoneNumber, verified = false) {
        this.phoneNumber = phoneNumber;
        this.verified = verified;
    }

    get toResource() {
        return {phoneNumber: this.phoneNumber, verified: this.verified};
    }

    static fromObs(obs) {
        return new PhoneNumber(obs.phoneNumber, obs.verified);
    }

    getValue() {
        return this.phoneNumber;
    }

    isVerified() {
        return this.verified;
    }

    cloneForEdit() {
        return new PhoneNumber(this.phoneNumber, this.verified);
    }

    toString() {
        return this.phoneNumber;
    }
}

export default PhoneNumber;
