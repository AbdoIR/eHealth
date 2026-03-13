const HealthRecords = artifacts.require("HealthRecords");

contract("HealthRecords", (accounts) => {
  const owner = accounts[0]; // Deploys the contract, is also a doctor
  const doctor2 = accounts[1];
  const patient = accounts[2];
  const unauthorizedUser = accounts[3];

  const encryptData = (data) => web3.utils.asciiToHex(data);
  const decryptData = (hexData) => web3.utils.hexToAscii(hexData);

  // --- Doctor Management ---

  it("should set deployer as owner and doctor", async () => {
    const instance = await HealthRecords.deployed();
    const contractOwner = await instance.owner();
    const ownerIsDoctor = await instance.isDoctor(owner);

    assert.equal(contractOwner, owner, "Deployer should be the owner.");
    assert.equal(ownerIsDoctor, true, "Deployer should be a doctor.");
  });

  it("should allow owner to add a new doctor", async () => {
    const instance = await HealthRecords.deployed();
    const tx = await instance.addDoctor(doctor2, { from: owner });

    const isDr = await instance.isDoctor(doctor2);
    assert.equal(isDr, true, "Newly added address should be a doctor.");
    assert.equal(tx.logs[0].event, "DoctorAdded", "Should emit DoctorAdded event.");
  });

  it("should prevent non-owner from adding a doctor", async () => {
    const instance = await HealthRecords.deployed();
    try {
      await instance.addDoctor(accounts[5], { from: unauthorizedUser });
      assert.fail("Should have reverted.");
    } catch (error) {
      assert(error.message.includes("Only owner"), "Error should mention 'Only owner'.");
    }
  });

  it("should allow owner to remove a doctor", async () => {
    const instance = await HealthRecords.deployed();
    await instance.addDoctor(accounts[4], { from: owner });
    const tx = await instance.removeDoctor(accounts[4], { from: owner });

    const isDr = await instance.isDoctor(accounts[4]);
    assert.equal(isDr, false, "Removed doctor should no longer be a doctor.");
    assert.equal(tx.logs[0].event, "DoctorRemoved", "Should emit DoctorRemoved event.");
  });

  it("should prevent removing the owner as doctor", async () => {
    const instance = await HealthRecords.deployed();
    try {
      await instance.removeDoctor(owner, { from: owner });
      assert.fail("Should have reverted.");
    } catch (error) {
      assert(error.message.includes("Cannot remove the owner"), "Error should mention owner protection.");
    }
  });

  // --- Registration & Management ---

  it("should allow a patient to register", async () => {
    const instance = await HealthRecords.deployed();
    const tx = await instance.registerPatient({ from: patient });
    
    const isPat = await instance.isPatient(patient);
    assert.equal(isPat, true, "Address should be registered as a patient.");
    assert.equal(tx.logs[0].event, "PatientRegistered", "Should emit PatientRegistered event.");
  });

  // --- Patient Consent ---

  it("should allow a doctor to request consent", async () => {
    const instance = await HealthRecords.deployed();
    const tx = await instance.requestConsent(patient, { from: owner });

    const isPending = await instance.pendingConsent(patient, owner);
    assert.equal(isPending, true, "Consent request should be pending.");
    assert.equal(tx.logs[0].event, "ConsentRequested", "Should emit ConsentRequested event.");
  });

  it("should allow a patient to grant consent to a doctor", async () => {
    const instance = await HealthRecords.deployed();
    const tx = await instance.grantConsent(owner, { from: patient });

    const consent = await instance.patientConsent(patient, owner);
    assert.equal(consent, true, "Patient should have granted consent.");
    assert.equal(tx.logs[0].event, "ConsentGranted", "Should emit ConsentGranted event.");
  });

  it("should prevent granting consent to a non-doctor", async () => {
    const instance = await HealthRecords.deployed();
    try {
      await instance.grantConsent(unauthorizedUser, { from: patient });
      assert.fail("Should have reverted.");
    } catch (error) {
      assert(error.message.includes("not an authorized doctor"), "Error should mention non-doctor.");
    }
  });

  it("should allow a patient to revoke consent", async () => {
    const instance = await HealthRecords.deployed();
    await instance.requestConsent(patient, { from: doctor2 });
    await instance.grantConsent(doctor2, { from: patient });
    const tx = await instance.revokeConsent(doctor2, { from: patient });

    const consent = await instance.patientConsent(patient, doctor2);
    assert.equal(consent, false, "Consent should be revoked.");
    assert.equal(tx.logs[0].event, "ConsentRevoked", "Should emit ConsentRevoked event.");
  });

  // --- Medical Records ---

  it("should allow a doctor to add a visit with patient consent", async () => {
    const instance = await HealthRecords.deployed();
    const encrypted = encryptData("Patient has a slight fever and cough.");

    const tx = await instance.addVisit(patient, encrypted, { from: owner });

    const count = await instance.getVisitCount(patient, { from: patient });
    assert.equal(count.toNumber(), 1, "Visit count should be 1.");
    assert.equal(tx.logs[0].event, "VisitAdded", "Should emit VisitAdded event.");
  });

  it("should reject a visit with empty encrypted data", async () => {
    const instance = await HealthRecords.deployed();
    try {
      await instance.addVisit(patient, "0x", { from: owner });
      assert.fail("Should have reverted.");
    } catch (error) {
      assert(error.message.includes("Encrypted data cannot be empty"), "Error should mention empty data.");
    }
  });

  it("should prevent a doctor from adding a visit without patient consent", async () => {
    const instance = await HealthRecords.deployed();
    try {
      await instance.addVisit(patient, encryptData("No consent"), { from: doctor2 });
      assert.fail("Should have reverted.");
    } catch (error) {
      assert(error.message.includes("not granted consent"), "Error should mention consent.");
    }
  });

  it("should prevent an unauthorized user from adding a visit", async () => {
    const instance = await HealthRecords.deployed();
    try {
      await instance.addVisit(patient, encryptData("Illegal entry"), { from: unauthorizedUser });
      assert.fail("Should have reverted.");
    } catch (error) {
      assert(
        error.message.includes("Only authorized doctors"),
        "Error should mention 'Only authorized doctors'.",
      );
    }
  });

  // --- Paginated History & Read Access ---

  it("should store encrypted data on-chain and allow decryption off-chain", async () => {
    const instance = await HealthRecords.deployed();
    const history = await instance.getHistory(patient, 0, 10, { from: patient });
    const originalText = "Patient has a slight fever and cough.";

    assert.equal(history.length, 1, "Patient should see 1 visit.");
    assert.notEqual(history[0].encryptedData, originalText, "On-chain data should not be plaintext.");

    const decrypted = decryptData(history[0].encryptedData);
    assert.equal(decrypted, originalText, "Decrypted data should match the original record.");
  });

  it("should allow an AUTHORIZED doctor to see patient history", async () => {
    const instance = await HealthRecords.deployed();
    // Owner was granted consent in the earlier test
    const history = await instance.getHistory(patient, 0, 10, { from: owner });
    assert.equal(history.length, 1, "Authorized doctor should be able to read the history.");
  });

  it("should prevent an UNAUTHORIZED doctor from viewing history", async () => {
    const instance = await HealthRecords.deployed();
    try {
      // doctor2 is a doctor, but had consent revoked earlier
      await instance.getHistory(patient, 0, 10, { from: doctor2 });
      assert.fail("Should have reverted.");
    } catch (error) {
      assert(
        error.message.includes("Not authorized"),
        "Error should prevent unconsented doctor from reading.",
      );
    }
  });

  it("should prevent unauthorized user from viewing history", async () => {
    const instance = await HealthRecords.deployed();
    try {
      await instance.getHistory(patient, 0, 10, { from: unauthorizedUser });
      assert.fail("Should have reverted.");
    } catch (error) {
      assert(error.message.includes("Not authorized"), "Error should mention authorization.");
    }
  });

  it("should paginate correctly with multiple visits", async () => {
    const instance = await HealthRecords.deployed();

    await instance.addVisit(patient, encryptData("Follow-up visit 1."), { from: owner });
    await instance.addVisit(patient, encryptData("Follow-up visit 2."), { from: owner });

    const count = await instance.getVisitCount(patient, { from: patient });
    assert.equal(count.toNumber(), 3, "Total visits should be 3.");

    const page1 = await instance.getHistory(patient, 0, 2, { from: patient });
    assert.equal(page1.length, 2, "First page should have 2 visits.");

    const page2 = await instance.getHistory(patient, 2, 2, { from: patient });
    assert.equal(page2.length, 1, "Second page should have 1 visit.");
    const decrypted = decryptData(page2[0].encryptedData);
    assert.equal(decrypted, "Follow-up visit 2.", "Last visit decrypted data should match.");
  });
});
