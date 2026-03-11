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
    mapping(address => mapping(address => bool)) public patientConsent;

    // You can have up to three indexed parameters per event
    event DoctorAdded(address indexed doctor);
    event DoctorRemoved(address indexed doctor);
    event VisitAdded(address indexed patient, address indexed doctor, uint256 timestamp);
    event ConsentGranted(address indexed patient, address indexed doctor);
    event ConsentRevoked(address indexed patient, address indexed doctor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action.");
        _;
    }

    modifier onlyDoctor() {
        require(isDoctor[msg.sender], "Only authorized doctors can add visits.");
        _;
    }

    constructor() {
        owner = msg.sender;
        isDoctor[msg.sender] = true;
        emit DoctorAdded(msg.sender);
    }

    // --- Doctor Management (owner only) ---

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

    function grantConsent(address _doctor) public {
        require(isDoctor[_doctor], "Address is not an authorized doctor.");
        patientConsent[msg.sender][_doctor] = true;
        emit ConsentGranted(msg.sender, _doctor);
    }

    function revokeConsent(address _doctor) public {
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