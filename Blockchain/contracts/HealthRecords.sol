// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthRecords {
    address public owner;

    struct Visit {
        address doctor;
        bytes encryptedData; // AES-encrypted medical record
        uint256 timestamp;
    }

    mapping(address => Visit[]) private patientHistory;
    mapping(address => bool) public isDoctor;
    mapping(address => bool) public isPatient;
    mapping(address => mapping(address => bool)) public patientConsent;
    mapping(address => mapping(address => bool)) public pendingConsent;

    // You can have up to three indexed parameters per event
    event DoctorAdded(address indexed doctor);
    event DoctorRemoved(address indexed doctor);
    event PatientRegistered(address indexed patient);
    event VisitAdded(address indexed patient, address indexed doctor, uint256 timestamp);
    event ConsentRequested(address indexed patient, address indexed doctor);
    event ConsentGranted(address indexed patient, address indexed doctor);
    event ConsentRefused(address indexed patient, address indexed doctor);
    event ConsentRevoked(address indexed patient, address indexed doctor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action.");
        _;
    }

    modifier onlyDoctor() {
        require(isDoctor[msg.sender], "Only authorized doctors can perform this action.");
        _;
    }

    modifier onlyPatient() {
        require(isPatient[msg.sender], "Only registered patients can perform this action.");
        _;
    }

    constructor() {
        owner = msg.sender;
        isDoctor[msg.sender] = true;
        emit DoctorAdded(msg.sender);
    }

    // --- Registration & Management ---

    function registerPatient() public {
        require(!isPatient[msg.sender], "Already registered as a patient.");
        require(!isDoctor[msg.sender], "Doctors cannot register as patients.");
        isPatient[msg.sender] = true;
        emit PatientRegistered(msg.sender);
    }

    function addDoctor(address _doctor) public onlyOwner {
        require(!isDoctor[_doctor], "Address is already a doctor.");
        isDoctor[_doctor] = true;
        emit DoctorAdded(_doctor);
    }

    function removeDoctor(address _doctor) public onlyOwner {
        require(isDoctor[_doctor], "Address is not a doctor.");
        require(_doctor != owner, "Cannot remove the owner as doctor.");
        isDoctor[_doctor] = false;
        emit DoctorRemoved(_doctor);
    }

    // --- Patient Consent ---

    function requestConsent(address _patient) public onlyDoctor {
        require(isPatient[_patient], "Address is not a registered patient.");
        require(!patientConsent[_patient][msg.sender], "Consent is already granted.");
        require(!pendingConsent[_patient][msg.sender], "Consent request is already pending.");
        
        pendingConsent[_patient][msg.sender] = true;
        emit ConsentRequested(_patient, msg.sender);
    }

    function grantConsent(address _doctor) public onlyPatient {
        require(isDoctor[_doctor], "Address is not an authorized doctor.");
        
        pendingConsent[msg.sender][_doctor] = false; // clear if existed
        patientConsent[msg.sender][_doctor] = true;
        emit ConsentGranted(msg.sender, _doctor);
    }

    function refuseConsent(address _doctor) public onlyPatient {
        require(pendingConsent[msg.sender][_doctor], "No pending consent request from this doctor.");
        
        pendingConsent[msg.sender][_doctor] = false;
        emit ConsentRefused(msg.sender, _doctor);
    }

    function revokeConsent(address _doctor) public onlyPatient {
        patientConsent[msg.sender][_doctor] = false;
        emit ConsentRevoked(msg.sender, _doctor);
    }

    // --- Medical Records ---

    function addVisit(address _patient, bytes memory _encryptedData) public onlyDoctor {
        require(patientConsent[_patient][msg.sender], "Patient has not granted consent to this doctor.");
        require(_encryptedData.length > 0, "Encrypted data cannot be empty.");

        Visit memory newVisit = Visit({
            doctor: msg.sender,
            encryptedData: _encryptedData,
            timestamp: block.timestamp
        });

        patientHistory[_patient].push(newVisit);
        emit VisitAdded(_patient, msg.sender, block.timestamp);
    }

    function getHistory(address _patient, uint256 _offset, uint256 _limit) public view returns (Visit[] memory) {
        require(msg.sender == _patient || patientConsent[_patient][msg.sender], "Not authorized to view this history.");

        Visit[] storage allVisits = patientHistory[_patient];

        if (_offset >= allVisits.length) {
            return new Visit[](0);
        }

        uint256 end = _offset + _limit;
        if (end > allVisits.length) {
            end = allVisits.length;
        }

        uint256 resultLength = end - _offset;
        Visit[] memory result = new Visit[](resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allVisits[_offset + i];
        }
        return result;
    }

    function getVisitCount(address _patient) public view returns (uint256) {
        require(msg.sender == _patient || patientConsent[_patient][msg.sender], "Not authorized to view this history.");
        return patientHistory[_patient].length;
    }
}