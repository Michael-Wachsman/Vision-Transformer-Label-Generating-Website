CREATE DATABASE db;


CREATE TABLE db.ImageInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    annotations JSON,
    trueAnnotations JSON,
    approvalStatus VARCHAR(100)
);

CREATE TABLE db.PerfHist(
    id INT AUTO_INCREMENT PRIMARY KEY,
    approvalPercentage DOUBLE DEFAULT 0.0,
    approvedIds JSON,
    rejectedIds JSON
)

-- CREATE TABLE db.UserCompanyInfo (
--     userId VARCHAR(100) NOT NULL,
--     companyId VARCHAR(100) NOT NULL,
--     status VARCHAR(100) NOT NULL,
--     innovationPractices TEXT, 
--     iPScore DOUBLE DEFAULT 0,
--     globalAlignment TEXT,
--     gAScore DOUBLE DEFAULT 0,
--     communityImpact TEXT, 
--     cIScore DOUBLE DEFAULT 0,
--     reportingConsistency TEXT, 
--     rCScore DOUBLE DEFAULT 0,
--     longTerm TEXT,
--     lTScore DOUBLE DEFAULT 0,
--     FOREIGN KEY (userId) REFERENCES UserInfo(id)
-- );



