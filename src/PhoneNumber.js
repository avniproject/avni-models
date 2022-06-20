import {get} from 'lodash';

class PhoneNumber {
    constructor(phoneNumber, verified = false, skipVerification = false) {
        this.phoneNumber = phoneNumber;
        this.verified = verified;
        this.skipVerification = skipVerification;
    }

    get toResource() {
        return {phoneNumber: this.phoneNumber, verified: this.verified};
    }

    static fromObs(obs) {
        return get(obs, 'phoneNumber', null) ?
            new PhoneNumber(obs.phoneNumber, obs.verified, obs.skipVerification) :
            null;
    }

    getValue() {
        return this.phoneNumber;
    }

    isVerified() {
        return this.verified;
    }

    cloneForEdit() {
        return new PhoneNumber(this.phoneNumber, this.verified, this.skipVerification);
    }

    toString() {
        return this.phoneNumber;
    }

    isVerificationRequired() {
        return !this.skipVerification && !this.isVerified();
    }
}

export default PhoneNumber;
