// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthRecords {
    address public owner;

    struct Visit {
        uint256 id;
        uint256 timestamp;
        address doctor;     // Doctor who added it
        bytes encryptedData; // Encrypted IPFS CID or symmetric encrypted blob
    }

    struct Doctor {
        bool isRegistered;
        string name;
        string clinic;
        string timezone;
        string workingHoursStart;
        string workingHoursEnd;
    }

    struct Patient {
        bool isRegistered;
        string name;
        string bloodType;
        string phone;
        string email;
    }

    // State Variables
    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(address => Visit[]) private patientHistory;

    // Consent mappings: mapping(patient => mapping(doctor => state))
    mapping(address => mapping(address => bool)) public patientConsent;
    mapping(address => mapping(address => bool)) public pendingConsent;

    // Events
    event ConsentRequested(address indexed patient, address indexed doctor);
    event ConsentGranted(address indexed patient, address indexed doctor);
    event ConsentRefused(address indexed patient, address indexed doctor);
    event ConsentRevoked(address indexed patient, address indexed doctor);
    event PatientRegistered(address indexed patient, string name);
    event DoctorAdded(address indexed doctor, string name, string clinic);
    event DoctorRemoved(address indexed doctor);
    event VisitAdded(address indexed patient, address indexed doctor, uint256 visitId);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender].isRegistered, "Caller is not an authorized doctor");
        _;
    }

    modifier onlyPatient() {
        require(patients[msg.sender].isRegistered, "Caller is not a registered patient");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- Identity Registration ---

    function registerPatient(string memory _name, string memory _bloodType, string memory _phone, string memory _email) public {
        require(!patients[msg.sender].isRegistered, "Already registered as a patient.");
        require(!doctors[msg.sender].isRegistered, "Doctors cannot register as patients.");
        
        patients[msg.sender] = Patient({
            isRegistered: true,
            name: _name,
            bloodType: _bloodType,
            phone: _phone,
            email: _email
        });
        emit PatientRegistered(msg.sender, _name);
    }

    function addDoctor(
        address _doctor, 
        string memory _name,
        string memory _clinic,
        string memory _timezone,
        string memory _workingHoursStart,
        string memory _workingHoursEnd
    ) public onlyOwner {
        require(!doctors[_doctor].isRegistered, "Doctor is already registered");
        require(!patients[_doctor].isRegistered, "Address is already registered as a patient");

        doctors[_doctor] = Doctor({
            isRegistered: true,
            name: _name,
            clinic: _clinic,
            timezone: _timezone,
            workingHoursStart: _workingHoursStart,
            workingHoursEnd: _workingHoursEnd
        });

        emit DoctorAdded(_doctor, _name, _clinic);
    }

    function removeDoctor(address _doctor) public onlyOwner {
        require(doctors[_doctor].isRegistered, "Address is not a doctor.");
        require(_doctor != owner, "Cannot remove the owner as doctor.");
        doctors[_doctor].isRegistered = false;
        // Optional: clear the name as well
        emit DoctorRemoved(_doctor);
    }

    // --- Metadata Getters ---

    function getDoctorProfile(address _doctor) public view returns (string memory name) {
        require(doctors[_doctor].isRegistered, "Not an authorized doctor.");
        return doctors[_doctor].name;
    }

    function getPatientProfile(address _patient) public view returns (string memory name, string memory bloodType, string memory phone, string memory email) {
        require(patients[_patient].isRegistered, "Not a registered patient.");
        Patient memory p = patients[_patient];
        return (p.name, p.bloodType, p.phone, p.email);
    }

    // --- Patient Consent ---

    function requestConsent(address _patient) public onlyDoctor {
        require(patients[_patient].isRegistered, "Address is not a registered patient.");
        require(!patientConsent[_patient][msg.sender], "Consent is already granted.");
        require(!pendingConsent[_patient][msg.sender], "Consent request is already pending.");
        
        pendingConsent[_patient][msg.sender] = true;
        emit ConsentRequested(_patient, msg.sender);
    }

    function grantConsent(address _doctor) public onlyPatient {
        require(doctors[_doctor].isRegistered, "Address is not an authorized doctor.");
        
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
            id: patientHistory[_patient].length,
            timestamp: block.timestamp,
            doctor: msg.sender,
            encryptedData: _encryptedData
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